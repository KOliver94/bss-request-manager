# syntax=docker/dockerfile:1
# Keep this syntax directive! It's used to enable Docker BuildKit
# Based on: https://gist.github.com/usr-ein/c42d98abca3cb4632ab0c2c6aff8c88a

##################################################

# Stage 1 - Build Frontend

# Pull base image
FROM node:22-alpine AS frontend-build

# Build args
ARG API_URL
ARG AUTHSCH_CLIENT_ID
ARG BSS_CLIENT_ID
ARG GOOGLE_CLIENT_ID
ARG MICROSOFT_CLIENT_ID
ARG RECAPTCHA_SITE_KEY
ARG SENTRY_URL

# Environment vars
ENV VITE_API_URL=$API_URL
ENV VITE_AUTHSCH_CLIENT_ID=$AUTHSCH_CLIENT_ID
ENV VITE_BSS_CLIENT_ID=$BSS_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV VITE_MICROSOFT_CLIENT_ID=$MICROSOFT_CLIENT_ID
ENV VITE_RECAPTCHA_SITE_KEY=$RECAPTCHA_SITE_KEY
ENV VITE_SENTRY_URL=$SENTRY_URL

# Set work directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json to Docker environment
COPY ./frontend/package*.json /app/frontend/

# Update npm and install all required node packages
RUN npm install -g npm@latest && npm install --silent

# Copy everything over to Docker environment
COPY ./frontend /app/frontend

# Build the frontend
RUN npm run build

##################################################

# Stage 2 - Build Admin dashboard

# Pull base image
FROM node:22-alpine AS frontend-admin-build

# Build args
ARG API_URL
ARG SENTRY_URL_ADMIN

# Environment vars
ENV VITE_API_URL=$API_URL
ENV VITE_SENTRY_URL=$SENTRY_URL_ADMIN

# Set work directory
WORKDIR /app/frontend-admin

# Copy package.json and package-lock.json to Docker environment
COPY ./frontend-admin/package*.json /app/frontend-admin/

# Update npm and install all required node packages
RUN npm install -g npm@latest && npm install --silent

# Copy everything over to Docker environment
COPY ./frontend-admin /app/frontend-admin

# Build the frontend
RUN npm run build

##################################################

# Stage 3 - Backend base

# Pull base image
FROM python:3.13-alpine AS backend-base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    \
    POETRY_VERSION=1.8.5 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1 \
    \
    PYSETUP_PATH="/opt/pysetup" \
    VIRTUAL_ENV="/opt/pysetup/.venv"

# Add Poetry and Venv to Path
ENV PATH="$POETRY_HOME/bin:$VIRTUAL_ENV/bin:$PATH"

##################################################

# Stage 4 - Backend builder

# Use backend-base image as base
FROM backend-base AS backend-builder

# Install build dependencies
RUN apk update && apk add curl postgresql-dev

# Install Poetry - respects $POETRY_VERSION & $POETRY_HOME
# The --mount will mount the buildx cache directory to where
# Poetry and Pip store their cache so that they can re-use it
RUN --mount=type=cache,target=/root/.cache \
    curl -sSL https://install.python-poetry.org | python3 -

# Set work directory
WORKDIR $PYSETUP_PATH

# Copy project requirement files here to ensure they will be cached
COPY backend/poetry.lock $PYSETUP_PATH
COPY backend/pyproject.toml $PYSETUP_PATH

# Install runtime dependencies
RUN --mount=type=cache,target=/root/.cache \
    poetry install --without=debug,dev,test --with=prod

##################################################

# Stage 5 - The Production Environment

# Use backend-base image as base
FROM backend-base AS request-manager-production

# Create the app user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy built runtime dependencies from builder container
COPY --from=backend-builder $PYSETUP_PATH $PYSETUP_PATH

# Install runtime dependency for psycopg[c]
RUN apk update && apk add --no-cache libpq

# Copy everything over to Docker environment
COPY ./backend /app/backend

# Copy built frontend assets
RUN mkdir -p /app/frontend/build
COPY --from=frontend-build /app/frontend/build /app/frontend/build-temp
COPY --from=frontend-admin-build /app/frontend-admin/build /app/frontend-admin/build

# Have to move all static files other than index.html to root/ for whitenoise middleware
WORKDIR /app/frontend
RUN mkdir build/root && mv build-temp/index.html build/index.html && mv build-temp/static build/static && mv build-temp/* build/root && rm -r build-temp

# Change the owner of all files to the app user
RUN chown -R appuser:appgroup /app

# Change to the app user
USER appuser

# Collect static files
WORKDIR /app/backend
RUN python manage.py collectstatic --no-input --clear --settings=core.settings.base

# Open port
EXPOSE 8000

# Copy and run entrypoint.sh (make sure line endings are UNIX style)
COPY --chown=appuser:appgroup ./docker-entrypoint.sh /app/entrypoint.sh
RUN dos2unix /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]

# Set health check
HEALTHCHECK --start-period=20s --interval=30s --retries=5 --timeout=30s \
    CMD python manage.py health_check

# Start the server
CMD ["gunicorn", "--bind=0.0.0.0:8000", "--workers=5", "--threads=2", "core.wsgi"]

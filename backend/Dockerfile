# syntax=docker/dockerfile:1
# Keep this syntax directive! It's used to enable Docker BuildKit
# Based on https://gist.github.com/usr-ein/c42d98abca3cb4632ab0c2c6aff8c88a

###################################
#  FOR DEVELOPMENT PURPOSES ONLY  #
###################################

##################################################

# Stage 1 - Backend base
FROM python:3.13 AS backend-base

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

# Stage 2 - Backend builder

# Use backend-base image as base
FROM python-base AS backend-builder

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
COPY poetry.lock pyproject.toml ./

# Install runtime dependencies
RUN --mount=type=cache,target=/root/.cache \
    poetry install --without=dev,test --with=prod

##################################################

# Stage 3 - Final image

# Use backend-base image as base
FROM python-base AS production

# Copy built runtime dependencies from builder container
COPY --from=backend-builder $PYSETUP_PATH $PYSETUP_PATH

# Install runtime dependency for psycopg[c]
RUN apk update && apk add --no-cache libpq

# Copy everything over to Docker environment
COPY . /app/backend

# Collect static files
WORKDIR /app/backend
RUN python manage.py collectstatic --no-input --clear --settings=core.settings.base

# Open port
EXPOSE 8000

# Set health check
HEALTHCHECK --start-period=30s --interval=5m \
    CMD python manage.py health_check

# Do the migrations and start the server
CMD ["sh", "-c", "python manage.py migrate; gunicorn --bind=0.0.0.0:8000 --workers=5 --threads=2 core.wsgi"]

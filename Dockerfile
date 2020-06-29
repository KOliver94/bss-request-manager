# Stage 1 - Build Frontend

# Pull base image
FROM node:14-alpine AS react-build

# Set work directory
WORKDIR /app/frontend

# Copy package.json and package-lock.json to Docker environment
COPY ./frontend/package*.json /app/frontend

# Install all required node packages
RUN npm install

# Copy everything over to Docker environment
COPY ./frontend /app/frontend

# Build the frontend
RUN npm run build

##################################################

# Stage 2 - The Production Environment

# Pull base image
FROM python:3.8

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app/backend

# Install dependencies
RUN apt-get update
    && apt-get install -y python3-dev libldap2-dev libsasl2-dev cron
RUN pip install pipenv

# Copy Pipfile and Pipfile.lock to Docker environment
COPY ./backend/Pipfile* /app/backend

# Install all required python packages
RUN pipenv install --system

# Copy everything over to Docker environment
COPY ./backend /app/backend

# Create log files
RUN mkdir -p /app/backend/logs
RUN touch /app/backend/logs/backend.log
RUN touch /app/backend/logs/backend.err

# Copy built frontend assets
RUN mkdir -p /app/frontend/build
COPY --from=react-build /app/frontend/build /app/frontend/build

# Have to move all static files other than index.html to root/ for whitenoise middleware
WORKDIR /app/frontend/build
RUN mkdir root && mv *.ico *.js *.json root

# Set up cron
RUN touch /var/log/cron.log
RUN crontab /app/backend/crontab && rm /app/backend/crontab

# Make migrations, collect static files and create default user
WORKDIR /app/backend
RUN python manage.py makemigrations && python manage.py migrate \
    && python manager.py collectstatic --noinput && python manage.py create_default_user

# Open port
EXPOSE 8000

# Start the server
CMD cron && gunicorn --bind 0.0.0.0:8000 manager.wsgi
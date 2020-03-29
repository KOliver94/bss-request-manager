# Dockerfile

# Pull base image
FROM python:3.8

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /code

# Install dependencies
RUN apt-get update && apt-get install -y python3-dev libldap2-dev libsasl2-dev
RUN pip install pipenv
COPY Pipfile Pipfile.lock /code/
RUN pipenv install --system

# Copy project
COPY . /code/

# Open port
EXPOSE 8000

# Make migrations and start the server
CMD python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000
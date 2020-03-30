# Dockerfile

# Pull base image
FROM python:3.8

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /code

# Install dependencies
RUN apt-get update && apt-get install -y python3-dev libldap2-dev libsasl2-dev cron
RUN pip install pipenv
COPY Pipfile Pipfile.lock /code/
RUN pipenv install --system

# Copy project
COPY . /code/

# Set up cron
RUN touch /var/log/cron.log
RUN crontab /code/crontab && rm /code/crontab

# Open port
EXPOSE 8000

# Make migrations, create default user and start the server
CMD python manage.py makemigrations && python manage.py migrate \
&& python manage.py create_default_user && cron && python manage.py runserver 0.0.0.0:8000
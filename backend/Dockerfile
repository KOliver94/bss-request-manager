###################################
#  FOR DEVELOPMENT PURPOSES ONLY  #
###################################
FROM python:3.10-alpine3.14

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app/backend

# Copy Pipfile and Pipfile.lock to Docker environment
COPY ./Pipfile* /app/backend/

# Install dependencies
RUN apk update \
    && apk add --no-cache --virtual .build-deps \
    postgresql-dev gcc python3-dev musl-dev libffi-dev openssl-dev cargo openldap-dev build-base \
    && python -m pip install --upgrade pip \
    && pip install --no-cache-dir pipenv \
    && pipenv install --system --deploy --clear \
    && find /usr/local \
        \( -type d -a -name test -o -name tests \) \
        -o \( -type f -a -name '*.pyc' -o -name '*.pyo' \) \
        -exec rm -rf '{}' + \
    && runDeps="$( \
        scanelf --needed --nobanner --recursive /usr/local \
                | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
                | sort -u \
                | xargs -r apk info --installed \
                | sort -u \
    )" \
    && apk add --virtual .rundeps $runDeps \
    && apk del .build-deps \
    && pip uninstall pipenv -y

# Copy everything over to Docker environment
COPY . /app/backend

# Collect static files
RUN python manage.py collectstatic --no-input --clear --settings=core.settings.test

# Open port
EXPOSE 8000

# Set health check
HEALTHCHECK --start-period=30s --interval=5m \
    CMD python manage.py health_check

# Do the migrations and start the server
CMD ["sh", "-c", "python manage.py migrate; gunicorn --bind=0.0.0.0:8000 --workers=5 --threads=2 core.wsgi"]

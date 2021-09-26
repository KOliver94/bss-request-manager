"""
Django settings for core project.

Generated by 'django-admin startproject' using Django 2.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os
from re import match

from celery.schedules import crontab
from decouple import Csv, config
from django.core.exceptions import ImproperlyConfigured

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BACKEND_DIR = BASE_DIR  # rename variable for clarity
FRONTEND_DIR = os.path.abspath(os.path.join(BACKEND_DIR, "..", "frontend"))

# URL of the site such as: https://website.example.com
BASE_URL_DOMAIN = config("BASE_URL_DOMAIN", default="localhost:8000")
BASE_URL_HTTPS = config("BASE_URL_HTTPS", default=True, cast=bool)
BASE_URL = f'{"https://" if BASE_URL_HTTPS else "http://"}{BASE_URL_DOMAIN}'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("APP_SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("APP_DEBUG", default=False, cast=bool)
DJANGO_ADMIN = config("DJANGO_ADMIN", default=False, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost", cast=Csv())
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())

# Application definition

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",
    "django_celery_results",
    "cacheops",
    "rest_framework",
    "django_filters",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",
    "phonenumber_field",
    "simple_history",
    "common",
    "video_requests",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "simple_history.middleware.HistoryRequestMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            os.path.join(FRONTEND_DIR, "build"),
            os.path.join(BACKEND_DIR, "templates"),
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DATABASE_NAME"),
        "USER": config("DATABASE_USER"),
        "PASSWORD": config("DATABASE_PASSWORD"),
        "HOST": config("DATABASE_HOST", default="localhost"),
        "PORT": config("DATABASE_PORT", default=5432, cast=int),
    }
}

# Cacheops
# https://github.com/Suor/django-cacheops

CACHEOPS_REDIS = config("CACHE_REDIS", default="redis://localhost:6379/0")
CACHEOPS_DEGRADE_ON_FAILURE = True
CACHEOPS = {
    # Automatically cache all gets and queryset fetches
    # to django.contrib.auth models for an hour
    "auth.*": {"ops": {"fetch", "get"}, "timeout": 60 * 60},
    # Cache all queries to Permission
    # 'all' is an alias for {'get', 'fetch', 'count', 'aggregate', 'exists'}
    "auth.permission": {"ops": "all", "timeout": 60 * 60},
    # Enable manual caching on all other models with default timeout of an hour
    # Invalidation is still automatic
    "*.*": {"timeout": 60 * 60},
}

# Celery
# https://docs.celeryproject.org/en/stable/userguide/configuration.html

CELERY_BROKER_URL = config("CELERY_BROKER", default="redis://localhost:6379/1")
CELERY_RESULT_BACKEND = "django-db"
CELERY_IMPORTS = ["common.utilities", "core.tasks", "video_requests.emails"]
CELERY_TIMEZONE = config("TIME_ZONE", default="Europe/Budapest")

# Scheduled tasks
# https://docs.celeryproject.org/en/stable/userguide/periodic-tasks.html

CELERY_BEAT_SCHEDULE = {
    "update_request_status": {
        "task": "core.tasks.scheduled_update_request_status",
        "schedule": crontab(minute=10),
    },
    "daily_reminder_email": {
        "task": "core.tasks.scheduled_send_daily_reminder_email",
        "schedule": crontab(minute=0, hour=7),
    },
    "weekly_tasks_email": {
        "task": "core.tasks.scheduled_send_weekly_tasks_email",
        "schedule": crontab(minute=30, hour=0, day_of_week="mon"),
    },
    "unfinished_requests_email": {
        "task": "core.tasks.scheduled_send_unfinished_requests_email",
        "schedule": crontab(minute=0, hour=20, day_of_week="sun"),
    },
    "overdue_requests_email": {
        "task": "core.tasks.scheduled_send_overdue_requests_email",
        "schedule": crontab(minute=30, hour=8),
    },
    "flush_expired_jwt_tokens": {
        "task": "core.tasks.scheduled_flush_expired_jwt_tokens",
        "schedule": crontab(minute=30, hour=3, day_of_week="fri"),
    },
}

# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# User authentication backends
# https://docs.djangoproject.com/en/3.0/ref/settings/#authentication-backends

AUTHENTICATION_BACKENDS = ()
ADMIN_GROUP = config("ADMIN_GROUP", default="Administrators")

# Django Rest Framework Settings
# https://www.django-rest-framework.org/

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.AnonRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "5/hour",
        "contact": "2/hour",
        "login": "5/minute",
    },
}

# Simple JWT Settings
# https://github.com/davesque/django-rest-framework-simplejwt

SIMPLE_JWT = {
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "USER_AUTHENTICATION_RULE": "common.authentication.default_user_authentication_rule",
}

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = config("LANGUAGE_CODE", default="en-us")

TIME_ZONE = config("TIME_ZONE", default="Europe/Budapest")

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

STATICFILES_DIRS = [
    os.path.join(FRONTEND_DIR, "build", "static"),
    os.path.join(BACKEND_DIR, "templates", "static"),
]
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
STATIC_ROOT = os.path.join(BACKEND_DIR, "staticfiles")
STATIC_URL = "/static/"

# Whitenoise
# http://whitenoise.evans.io/en/stable/django.html

WHITENOISE_ROOT = os.path.join(FRONTEND_DIR, "build", "root")

# Logging
# https://docs.djangoproject.com/en/3.0/topics/logging/

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": os.path.join(BACKEND_DIR, "logs", "backend.log"),
        },
        "error_file": {
            "level": "ERROR",
            "class": "logging.FileHandler",
            "filename": os.path.join(BACKEND_DIR, "logs", "backend.err"),
        },
    },
    "root": {
        "handlers": ["console", "file", "error_file"],
        "level": config("LOGGING_LEVEL", default="WARNING"),
    },
}

# If requested enable Django's admin site
if DJANGO_ADMIN:
    # Enable Django admin
    INSTALLED_APPS += [
        "django.contrib.admin",
    ]

# Health check
# https://django-health-check.readthedocs.io/en/stable/

HEALTH_CHECK_API_ENABLED = config("HEALTH_CHECK_API", default=False, cast=bool)
HEALTH_CHECK_URL_TOKEN = config("HEALTH_CHECK_URL_TOKEN", default=None)
INSTALLED_APPS += [
    "health_check",
    "health_check.db",
    "health_check.cache",
    "health_check.storage",
    "health_check.contrib.migrations",
    "health_check.contrib.celery",
    "health_check.contrib.celery_ping",
    "health_check.contrib.redis",
]
try:
    REDIS_URL = match("^redis://[a-zA-Z0-9]+:[0-9]+", CACHEOPS_REDIS).group(0)
except AttributeError:
    raise ImproperlyConfigured("Cannot extract proper Redis URL from CACHE_REDIS.")

# Django REST reCAPTCHA
# https://github.com/llybin/drf-recaptcha

DRF_RECAPTCHA_ENABLED = config("RECAPTCHA", default=True, cast=bool)
DRF_RECAPTCHA_SECRET_KEY = config("RECAPTCHA_SECRET_KEY", default=None)
if DRF_RECAPTCHA_ENABLED:
    INSTALLED_APPS += ["drf_recaptcha"]

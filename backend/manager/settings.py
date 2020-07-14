"""
Django settings for manager project.

Generated by 'django-admin startproject' using Django 2.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.0/ref/settings/
"""

import os
from datetime import timedelta

import ldap
import sentry_sdk
from celery.schedules import crontab
from decouple import Csv, config
from django_auth_ldap.config import GroupOfNamesType, LDAPSearch
from sentry_sdk.integrations.django import DjangoIntegration

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
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

ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=Csv())
CORS_ORIGIN_WHITELIST = config("CORS_ORIGIN_WHITELIST", default="", cast=Csv())

# Application definition

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",
    "django_celery_results",
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt.token_blacklist",
    "social_django",
    "rest_social_auth",
    "phonenumber_field",
    "simple_history",
    "drf_yasg",
    "common.apps.CommonConfig",
    "video_requests.apps.VideoRequestsConfig",
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

ROOT_URLCONF = "manager.urls"

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

WSGI_APPLICATION = "manager.wsgi.application"

# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql_psycopg2",
        "NAME": config("DATABASE_NAME"),
        "USER": config("DATABASE_USER"),
        "PASSWORD": config("DATABASE_PASSWORD"),
        "HOST": config("DATABASE_HOST"),
        "PORT": config("DATABASE_PORT", cast=int),
    }
}

# Cache
# https://docs.djangoproject.com/en/3.0/topics/cache/
# https://github.com/jazzband/django-redis

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": config("CACHE_REDIS", default="redis://localhost:6379/0"),
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
    }
}
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Celery
# https://docs.celeryproject.org/en/stable/userguide/configuration.html

CELERY_BROKER_URL = config("CELERY_BROKER", default="redis://localhost:6379/1")
CELERY_RESULT_BACKEND = "django-db"

# Scheduled tasks
# https://docs.celeryproject.org/en/stable/userguide/periodic-tasks.html

CELERY_BEAT_SCHEDULE = {
    "sync_ldap_users": {
        "task": "manager.tasks.scheduled_sync_ldap_users",
        "schedule": crontab(minute=15, hour=4),
    },
    "update_request_status": {
        "task": "manager.tasks.scheduled_update_request_status",
        "schedule": crontab(minute=0, hour=0),
    },
    "daily_reminder_email": {
        "task": "manager.tasks.scheduled_send_daily_reminder_email",
        "schedule": crontab(minute=0, hour=7),
    },
    "weekly_tasks_email": {
        "task": "manager.tasks.scheduled_send_weekly_tasks_email",
        "schedule": crontab(minute=30, hour=0, day_of_week="mon"),
    },
    "unfinished_requests_email": {
        "task": "manager.tasks.scheduled_send_unfinished_requests_email",
        "schedule": crontab(minute=0, hour=20, day_of_week="sun"),
    },
    "flush_expired_jwt_tokens": {
        "task": "manager.tasks.scheduled_flush_expired_jwt_tokens",
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

# LDAP User authentication
# https://django-auth-ldap.readthedocs.io/en/latest/index.html

# Baseline configuration.
AUTH_LDAP_GLOBAL_OPTIONS = {
    ldap.OPT_REFERRALS: 0,
    ldap.OPT_X_TLS_REQUIRE_CERT: ldap.OPT_X_TLS_NEVER,
}
AUTH_LDAP_SERVER_URI = config("LDAP_SERVER_URI")
AUTH_LDAP_BIND_DN = config("LDAP_BIND_DN")
AUTH_LDAP_BIND_PASSWORD = config("LDAP_BIND_PASSWORD")

AUTH_LDAP_USER_DN = config("LDAP_USER_DN")
AUTH_LDAP_USER_SEARCH = LDAPSearch(
    AUTH_LDAP_USER_DN, ldap.SCOPE_SUBTREE, "(sAMAccountName=%(user)s)"
)

# Set up the basic group parameters.
AUTH_LDAP_GROUP_DN = config("LDAP_GROUP_DN")
AUTH_LDAP_GROUP_SEARCH = LDAPSearch(
    AUTH_LDAP_GROUP_DN, ldap.SCOPE_SUBTREE, "(objectClass=group)",
)
AUTH_LDAP_GROUP_TYPE = GroupOfNamesType(name_attr="cn")

# Mirror user's groups to Django
# If LDAP_MIRROR_GROUPS_EXCEPT is not set or empty mirror all groups
if config("LDAP_MIRROR_GROUPS_EXCEPT", default="", cast=Csv()):
    AUTH_LDAP_MIRROR_GROUPS_EXCEPT = config("LDAP_MIRROR_GROUPS_EXCEPT", cast=Csv())
else:
    AUTH_LDAP_MIRROR_GROUPS = True

# Simple group restrictions
AUTH_LDAP_REQUIRE_GROUP = config("LDAP_STAFF_GROUP")

# Populate the Django user from the LDAP directory.
AUTH_LDAP_USER_ATTR_MAP = {
    "username": "sAMAccountName",
    "first_name": "givenName",
    "last_name": "sn",
    "email": "mail",
}

AUTH_LDAP_USER_FLAGS_BY_GROUP = {
    "is_staff": config("LDAP_STAFF_GROUP"),
    "is_superuser": config("LDAP_ADMIN_GROUP"),
}

# This is the default, but I like to be explicit.
AUTH_LDAP_ALWAYS_UPDATE_USER = True

# Use LDAP group membership to calculate group permissions.
AUTH_LDAP_FIND_GROUP_PERMS = True

# Cache distinguished names and group memberships for an hour to minimize
# LDAP traffic.
AUTH_LDAP_CACHE_TIMEOUT = 3600

# Social (OAuth2) User authentication
# https://github.com/st4lk/django-rest-social-auth
# https://python-social-auth.readthedocs.io/en/latest/index.html

# When using PostgreSQL, it’s recommended to use the built-in JSONB field to store the extracted extra_data.
SOCIAL_AUTH_POSTGRES_JSONFIELD = True

# Facebook OAuth2 settings:
SOCIAL_AUTH_FACEBOOK_KEY = config("AUTH_FACEBOOK_APP_ID")
SOCIAL_AUTH_FACEBOOK_SECRET = config("AUTH_FACEBOOK_APP_SECRET")
SOCIAL_AUTH_FACEBOOK_SCOPE = [
    "email",
]
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
    "fields": ",".join(
        [
            # public_profile
            "id",
            "cover",
            "name",
            "first_name",
            "last_name",
            "age_range",
            "link",
            "gender",
            "locale",
            "picture",
            "timezone",
            "updated_time",
            "verified",
            # extra fields
            "email",
        ]
    ),
}

# Google OAuth2 settings:
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = config("AUTH_GOOGLE_CLIENT_ID")
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = config("AUTH_GOOGLE_CLIENT_SECRET")
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    "email",
]

# AuthSCH OAuth2 settings:
SOCIAL_AUTH_AUTHSCH_KEY = config("AUTH_SCH_CLIENT_ID")
SOCIAL_AUTH_AUTHSCH_SECRET = config("AUTH_SCH_CLIENT_SECRET")

# For most OAuth providers the redirect URL in frontend and backend should match (e.g.: Facebook)
# More information: https://github.com/st4lk/django-rest-social-auth#settings
REST_SOCIAL_OAUTH_REDIRECT_URI = "/login"
REST_SOCIAL_DOMAIN_FROM_ORIGIN = DEBUG

SOCIAL_AUTH_PIPELINE = (
    # Custom action: Do not compare current user with new one.
    "common.social_pipeline.auto_logout",
    # Get the information we can about the user and return it in a simple
    # format to create the user instance later. In some cases the details are
    # already part of the auth response from the provider, but sometimes this
    # could hit a provider API.
    "social_core.pipeline.social_auth.social_details",
    # Get the social uid from whichever service we're authing thru. The uid is
    # the unique identifier of the given user in the provider.
    "social_core.pipeline.social_auth.social_uid",
    # Verifies that the current auth process is valid within the current
    # project, this is where emails and domains whitelists are applied (if
    # defined).
    "social_core.pipeline.social_auth.auth_allowed",
    # Custom action: Return error if e-mail was not provided by OAuth
    "common.social_pipeline.check_for_email",
    # Checks if the current social-account is already associated in the site.
    "social_core.pipeline.social_auth.social_user",
    # Make up a username for this person, appends a random string at the end if
    # there's any collision.
    "social_core.pipeline.user.get_username",
    # Send a validation email to the user to verify its email address.
    # Disabled by default.
    # 'social_core.pipeline.mail.mail_validation',
    # Associates the current social details with another user account with
    # a similar email address. Disabled by default.
    "social_core.pipeline.social_auth.associate_by_email",
    # Custom action: If the user already exists check if this is the first login
    # If so set the user to active.
    "common.social_pipeline.set_user_active_when_first_logs_in",
    # Create a user account if we haven't found one yet.
    "social_core.pipeline.user.create_user",
    # Create the record that associates the social account with the user.
    "social_core.pipeline.social_auth.associate_user",
    # Populate the extra_data field in the social record with the values
    # specified by settings (and the default ones like access_token, etc).
    "social_core.pipeline.social_auth.load_extra_data",
    # Update the user record with any changed info from the auth service.
    "social_core.pipeline.user.user_details",
    # Custom action: Add phone number to user's profile
    "common.social_pipeline.add_phone_number_to_profile",
    # Custom action: Get user's avatar
    "common.social_pipeline.get_avatar",
)

# User authentication backends
# https://docs.djangoproject.com/en/3.0/ref/settings/#authentication-backends

AUTHENTICATION_BACKENDS = (
    "django_auth_ldap.backend.LDAPBackend",
    "common.authentication.AuthSCHOAuth2",
    "social_core.backends.facebook.FacebookOAuth2",
    "social_core.backends.google.GoogleOAuth2",
)

# Django Rest Framework Settings
# https://www.django-rest-framework.org/

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "TEST_REQUEST_DEFAULT_FORMAT": "json",
}

# Simple JWT Settings
# https://github.com/davesque/django-rest-framework-simplejwt
SIMPLE_JWT = {
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
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
WHITENOISE_ROOT = os.path.join(FRONTEND_DIR, "build", "root")

# Swagger settings
# https://drf-yasg.readthedocs.io/en/stable/index.html

SWAGGER_SETTINGS = {
    "USE_SESSION_AUTH": False,
    "SECURITY_DEFINITIONS": {
        "Bearer": {"type": "apiKey", "name": "Authorization", "in": "header"}
    },
}

# E-mail settings
# https://docs.djangoproject.com/en/3.0/topics/email/

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST")
EMAIL_PORT = config("EMAIL_PORT")

EMAIL_HOST_USER = config("EMAIL_HOST_USER", default=None)
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default=None)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=None)
EMAIL_USE_SSL = config("EMAIL_USE_SSL", default=None)
EMAIL_TIMEOUT = config("EMAIL_TIMEOUT", default=None)
EMAIL_SSL_KEYFILE = config("EMAIL_SSL_KEYFILE", default=None)
EMAIL_SSL_CERTFILE = config("EMAIL_SSL_CERTFILE", default=None)

DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL")
DEFAULT_REPLY_EMAIL = config("DEFAULT_REPLY_EMAIL")
WEEKLY_TASK_EMAIL = config("WEEKLY_TASK_EMAIL")

DEBUG_EMAIL = config(
    "DEBUG_EMAIL", default=None
)  # if set all e-mails will be sent to this address only

# Google Calendar settings:
GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH = config("GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH")
GOOGLE_CALENDAR_ID = config("GOOGLE_CALENDAR_ID")

# Sentry (collect unhandled errors and exceptions and sends reports)
# https://sentry.io

if not DEBUG:
    sentry_sdk.init(
        dsn=config("SENTRY_URL"),
        integrations=[DjangoIntegration()],
        # If you wish to associate users to errors (assuming you are using
        # django.contrib.auth) you may enable sending PII data.
        send_default_pii=True,
    )

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
        "level": config("LOGGING_LEVEL"),
    },
}

# Debug settings

if DEBUG:
    # Enable Django admin
    INSTALLED_APPS += [
        "django.contrib.admin",
    ]

    # Enable local Django user based login
    AUTHENTICATION_BACKENDS += ("django.contrib.auth.backends.ModelBackend",)

    # Enable Browsable API
    REST_FRAMEWORK.update(
        {
            "DEFAULT_RENDERER_CLASSES": [
                "rest_framework.renderers.JSONRenderer",
                "rest_framework.renderers.BrowsableAPIRenderer",
            ],
        }
    )

    # Enable CORS requests from anywhere
    CORS_ORIGIN_ALLOW_ALL = True

    # Simple JWT Settings
    # https://github.com/davesque/django-rest-framework-simplejwt
    # Extend JWT token lifetime
    SIMPLE_JWT.update({"ACCESS_TOKEN_LIFETIME": timedelta(days=5)})

    # Do not send real e-mails in Debug mode
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

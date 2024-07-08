import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import ignore_logger
from sentry_sdk.integrations.redis import RedisIntegration

from core.settings._auth_social import *

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

# External services:
SCH_EVENTS_TOKEN = config("SCH_EVENTS_TOKEN")

# Google Calendar settings:
GOOGLE_SERVICE_ACCOUNT_KEY_FILE_NAME = config("GOOGLE_SERVICE_ACCOUNT_KEY_FILE_NAME")
GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH = (
    f"credentials/{GOOGLE_SERVICE_ACCOUNT_KEY_FILE_NAME}"
)
GOOGLE_CALENDAR_ID = config("GOOGLE_CALENDAR_ID")

# Sentry (collect unhandled errors and exceptions and sends reports)
# https://sentry.io

sentry_sdk.init(
    dsn=config("SENTRY_URL"),
    integrations=[
        CeleryIntegration(monitor_beat_tasks=True),
        DjangoIntegration(),
        RedisIntegration(),
    ],
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for performance monitoring.
    # We recommend adjusting this value in production,
    traces_sample_rate=0.15,
    # If you wish to associate users to errors (assuming you are using
    # django.contrib.auth) you may enable sending PII data.
    send_default_pii=True,
)
ignore_logger("django.security.DisallowedHost")

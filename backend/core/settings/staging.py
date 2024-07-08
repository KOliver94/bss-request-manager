import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import ignore_logger
from sentry_sdk.integrations.redis import RedisIntegration

from core.settings._auth_social import *

# E-mail settings
# https://docs.djangoproject.com/en/3.0/topics/email/
EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
EMAIL_FILE_PATH = "logs/emails"

DEFAULT_REPLY_EMAIL = "reply@example.com"
WEEKLY_TASK_EMAIL = "weekly@example.com"

# External services:
SCH_EVENTS_TOKEN = "123456789abcdef"  # nosec

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
    # If you wish to associate users to errors (assuming you are using
    # django.contrib.auth) you may enable sending PII data.
    send_default_pii=True,
)
ignore_logger("django.security.DisallowedHost")

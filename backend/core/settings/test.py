from datetime import timedelta

from core.settings.common import *

# Use the default Django authentication backend only
AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend"]

# Use faster password hashing algorithm
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Do not search for frontend build for tests
STATICFILES_DIRS.pop(0)

# Use short lifetime on access tokens
SIMPLE_JWT.update({"ACCESS_TOKEN_LIFETIME": timedelta(seconds=10)})

# Increase the throttling rates
REST_FRAMEWORK.update(
    {"DEFAULT_THROTTLE_RATES": {"anon": "500000/second", "login": "500000/second"}}
)

# Disable caching
CACHEOPS_ENABLED = False

# Do not send real e-mails
EMAIL_BACKEND_LIST = [
    "django.core.mail.backends.filebased.EmailBackend",
    "django.core.mail.backends.locmem.EmailBackend",
]
EMAIL_FILE_PATH = "logs/emails"
DEBUG_EMAIL = None
DEFAULT_REPLY_EMAIL = "reply@example.com"
WEEKLY_TASK_EMAIL = "weekly@example.com"

# Do not create real calendar events
GOOGLE_CALENDAR_ID = "NOT_EXISTING"
GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH = None

# Disable file logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

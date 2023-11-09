from datetime import timedelta

from core.settings._auth_social import *

# Use localhost as default instead of docker container hostnames
DATABASES["default"].update({"HOST": config("DATABASE_HOST", default="localhost")})
CACHEOPS_REDIS = config("CACHE_REDIS", default="redis://localhost:6379/0")
CELERY_BROKER_URL = config("CELERY_BROKER", default="redis://localhost:6379/1")
try:
    REDIS_URL = match("^redis://[a-zA-Z0-9]+:[0-9]+", CACHEOPS_REDIS).group(0)
except AttributeError:
    raise ImproperlyConfigured("Cannot extract proper Redis URL from CACHE_REDIS.")

# Use the default Django authentication backend
AUTHENTICATION_BACKENDS += ["django.contrib.auth.backends.ModelBackend"]

# Facebook OAuth2 settings:
SOCIAL_AUTH_FACEBOOK_KEY = "123456789012345"  # nosec
SOCIAL_AUTH_FACEBOOK_SECRET = "1234567890abcdef1234567890abcdef"  # nosec

# Google OAuth2 settings:
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = (
    "123456789012-p95xsuczae7s1w8un1apct2c90s6rj19.apps.googleusercontent.com"  # nosec
)
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = "27c7dFrK6aYsuvHLmV5Be3zU"  # nosec

# AuthSCH OAuth2 settings:
SOCIAL_AUTH_AUTHSCH_KEY = "12345678901234567890"  # nosec
SOCIAL_AUTH_AUTHSCH_SECRET = "TNcJ3UoBMUqpfYLBqlGlqN0Lsw1LHyIFvEtMTatL65RtTKAc6JnAYyNdDHX2DLFxkWLHpef8Wu8GHIAr"  # nosec

# Use faster password hashing algorithm
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Do not search for frontend build for tests
STATICFILES_DIRS.pop(0)
WHITENOISE_ROOT = None

# Override admin group to use the default value for tests
ADMIN_GROUP = "Administrators"

# Use short lifetime on access tokens
SIMPLE_JWT.update({"ACCESS_TOKEN_LIFETIME": timedelta(seconds=10)})

# Increase the throttling rates
REST_FRAMEWORK.update(
    {
        "DEFAULT_THROTTLE_RATES": {
            "anon": "500000/second",
            "contact": "500000/second",
            "login": "500000/second",
        }
    }
)

# Disable caching
CACHEOPS_ENABLED = False

# Save celery result to database when running in eager mode
CELERY_TASK_STORE_EAGER_RESULT = True

# Do not send real e-mails
EMAIL_BACKEND_LIST = [
    "django.core.mail.backends.filebased.EmailBackend",
    "django.core.mail.backends.locmem.EmailBackend",
]
EMAIL_FILE_PATH = "logs/emails"
DEFAULT_REPLY_EMAIL = "reply@example.com"
WEEKLY_TASK_EMAIL = "weekly@example.com"

# Do not create real calendar events
GOOGLE_CALENDAR_ID = "NOT_EXISTING"
GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH = None

# Random external token
SCH_EVENTS_TOKEN = "123456789abcdef"  # nosec

# Enable health check endpoint and remove celery from checks
HEALTH_CHECK_API_ENABLED = True
try:
    INSTALLED_APPS.remove("health_check.contrib.celery_ping")
except ValueError:
    pass

# Set DRF reCAPTCHA to test mode
DRF_RECAPTCHA_TESTING = True

# Disable file logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

from core.settings.common import *

# Use the default Django authentication backend only
AUTHENTICATION_BACKENDS = ["django.contrib.auth.backends.ModelBackend"]

# Use faster password hashing algorithm
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]

# Increase the throttling rates
REST_FRAMEWORK.update(
    {"DEFAULT_THROTTLE_RATES": {"anon": "500000/second", "login": "500000/second"}}
)

# Disable caching
CACHEOPS_ENABLED = False

# Do not send real e-mails
EMAIL_BACKEND = ["django.core.mail.backends.dummy.EmailBackend"]

# Do not create real calendar events
GOOGLE_CALENDAR_ID = "NOT_EXISTING"

# Disable file logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": "INFO"},
}

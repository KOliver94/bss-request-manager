from datetime import timedelta

from core.settings.production import *

################################################################################
#                                Debug settings                                #
################################################################################

if DEBUG:
    SWAGGER = config("SWAGGER", default=False, cast=bool)
    BROWSABLE_API = config("BROWSABLE_API", default=False, cast=bool)

    # Enable local Django user based login
    AUTHENTICATION_BACKENDS += ("django.contrib.auth.backends.ModelBackend",)

    # Enable CORS requests from anywhere
    CORS_ALLOW_ALL_ORIGINS = True

    # Do not send real e-mails
    EMAIL_BACKEND_TYPE = config("EMAIL_BACKEND", default="console")
    if EMAIL_BACKEND_TYPE.casefold() == "console":
        EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    elif EMAIL_BACKEND_TYPE.casefold() == "file":
        EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
        EMAIL_FILE_PATH = "logs/emails"
    else:
        EMAIL_BACKEND = "django.core.mail.backends.dummy.EmailBackend"

    # Extend JWT access token lifetime
    SIMPLE_JWT.update(
        {
            "ACCESS_TOKEN_LIFETIME": timedelta(days=5),
            "REFRESH_TOKEN_LIFETIME": timedelta(days=10),
        }
    )

    # Enable debug log file
    LOGGING["handlers"].update(
        {
            "debug": {
                "class": "logging.FileHandler",
                "filename": os.path.join(BACKEND_DIR, "logs", "debug.log"),
                "level": "DEBUG",
                "formatter": "default",
            }
        }
    )
    LOGGING.update(
        {
            "loggers": {
                "": {
                    "handlers": ["console", "info", "error", "debug"],
                    "level": "DEBUG",
                }
            },
        }
    )

    if BROWSABLE_API:
        # Enable Browsable API
        REST_FRAMEWORK.setdefault("DEFAULT_RENDERER_CLASSES", []).append(
            "rest_framework.renderers.BrowsableAPIRenderer"
        )

    if SWAGGER:
        # Enable Swagger/ReDoc
        INSTALLED_APPS += [
            "drf_yasg",
        ]

        # Swagger settings
        # https://drf-yasg.readthedocs.io/en/stable/index.html
        SWAGGER_SETTINGS = {
            "USE_SESSION_AUTH": False,
            "SECURITY_DEFINITIONS": {
                "Bearer": {"type": "apiKey", "name": "Authorization", "in": "header"}
            },
        }

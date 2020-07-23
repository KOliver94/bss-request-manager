from datetime import timedelta

from manager.settings.production import *

################################################################################
#                                Debug settings                                #
################################################################################

if DEBUG:
    # Enable local Django user based login
    AUTHENTICATION_BACKENDS += ("django.contrib.auth.backends.ModelBackend",)

    # Enable CORS requests from anywhere
    CORS_ORIGIN_ALLOW_ALL = True

    # Do not send real e-mails
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

    # Enable Django admin and Swagger/ReDoc
    INSTALLED_APPS += [
        "django.contrib.admin",
        "drf_yasg",
    ]

    # Enable Browsable API
    REST_FRAMEWORK.setdefault("DEFAULT_RENDERER_CLASSES", []).append(
        "rest_framework.renderers.BrowsableAPIRenderer"
    )

    # Extend JWT access token lifetime
    SIMPLE_JWT.update({"ACCESS_TOKEN_LIFETIME": timedelta(days=5)})

    # Swagger settings
    # https://drf-yasg.readthedocs.io/en/stable/index.html
    SWAGGER_SETTINGS = {
        "USE_SESSION_AUTH": False,
        "SECURITY_DEFINITIONS": {
            "Bearer": {"type": "apiKey", "name": "Authorization", "in": "header"}
        },
    }

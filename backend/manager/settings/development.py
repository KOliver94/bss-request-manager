from datetime import timedelta

from manager.settings.production import *

################################################################################
#                                Debug settings                                #
################################################################################

if DEBUG:
    # Enable Django admin
    INSTALLED_APPS += [
        "django.contrib.admin",
    ]

    # Enable local Django user based login
    AUTHENTICATION_BACKENDS += ("django.contrib.auth.backends.ModelBackend",)

    # Enable Browsable API
    REST_FRAMEWORK.setdefault("DEFAULT_RENDERER_CLASSES", []).append(
        "rest_framework.renderers.BrowsableAPIRenderer"
    )

    # Enable CORS requests from anywhere
    CORS_ORIGIN_ALLOW_ALL = True

    # Extend JWT access token lifetime
    SIMPLE_JWT.update({"ACCESS_TOKEN_LIFETIME": timedelta(days=5)})

    # Do not send real e-mails
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

from core.settings.test import *

# Set database settings
DATABASES["default"].update(
    {
        "NAME": "github_actions",
        "USER": "postgres",
        "PASSWORD": "postgres",
    }
)

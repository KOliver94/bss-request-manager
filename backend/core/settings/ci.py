from core.settings.test import *

# Set database settings
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "github_actions",
        "USER": "postgres",
        "PASSWORD": "postgres",
        "HOST": "localhost",
        "PORT": 5432,
    }
}

# Change redis hosts to localhost
CACHEOPS_REDIS = "redis://localhost:6379/0"
CELERY_BROKER_URL = "redis://localhost:6379/1"

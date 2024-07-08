from django.apps import AppConfig
from django.conf import settings


class CommonConfig(AppConfig):
    name = "common"
    default_auto_field = "django.db.models.AutoField"

    def ready(self):
        # noinspection PyUnresolvedReferences
        import common.signals

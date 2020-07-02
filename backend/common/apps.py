from django.apps import AppConfig


class CommonConfig(AppConfig):
    name = "common"

    def ready(self):
        # noinspection PyUnresolvedReferences
        import common.signals

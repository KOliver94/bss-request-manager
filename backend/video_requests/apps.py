from django.apps import AppConfig


class VideoRequestsConfig(AppConfig):
    name = "video_requests"
    default_auto_field = "django.db.models.AutoField"

    def ready(self):
        # noinspection PyUnresolvedReferences
        import video_requests.signals

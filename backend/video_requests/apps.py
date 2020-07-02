from django.apps import AppConfig


class VideoRequestsConfig(AppConfig):
    name = "video_requests"

    def ready(self):
        # noinspection PyUnresolvedReferences
        import video_requests.signals

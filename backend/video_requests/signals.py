from django.db.models.signals import post_delete
from django.dispatch import receiver

from video_requests.models import Video
from video_requests.utilities import update_request_status


@receiver(post_delete, sender=Video)
def update_request_status_after_video_delete(sender, instance, **kwargs):
    update_request_status(instance.request)

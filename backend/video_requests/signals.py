from django.db.models.signals import m2m_changed, post_delete
from django.dispatch import receiver

from video_requests.emails import email_staff_todo_assigned
from video_requests.models import Todo, Video
from video_requests.utilities import update_request_status


@receiver(post_delete, sender=Video)
def update_request_status_after_video_delete(sender, instance, **kwargs):
    update_request_status(instance.request)


def send_notification_to_new_assignees(
    sender, instance, action, reverse, model, pk_set, **kwargs
):
    if action == "post_add" and not reverse:
        # In this case pk_set will be the set of user ids added as new assignees
        email_staff_todo_assigned.delay(instance.id, list(pk_set))


m2m_changed.connect(send_notification_to_new_assignees, sender=Todo.assignees.through)

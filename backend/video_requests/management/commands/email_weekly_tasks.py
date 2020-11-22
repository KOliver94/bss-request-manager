from datetime import timedelta

from django.core.management import BaseCommand
from django.utils.timezone import localdate
from video_requests.emails import email_staff_weekly_tasks
from video_requests.models import Request


class Command(BaseCommand):
    help = "Send email about task to do this week"

    def handle(self, *args, **options):
        # Get requests which will happen this week
        date = localdate()
        start_week = date - timedelta(date.weekday())
        end_week = start_week + timedelta(7)
        recording = Request.objects.filter(
            start_datetime__date__range=[start_week, end_week], status__range=[1, 2]
        ).order_by("start_datetime")

        # Get requests which are already recorded but either no video was created or it is not finished yet
        recorded_requests_without_video = Request.objects.filter(
            status__range=[3, 4], videos__isnull=True
        )
        requests_with_unedited_video = Request.objects.filter(
            status__range=[3, 4], videos__status__range=[1, 2]
        )
        editing = recorded_requests_without_video | requests_with_unedited_video

        # Send the email if any of the queries contains data
        if recording.exists() or editing.exists():
            email_staff_weekly_tasks(recording, editing)
            self.stdout.write(
                self.style.SUCCESS("Weekly tasks email was sent successfully.")
            )
        else:
            self.stdout.write(self.style.NOTICE("No tasks for this week."))

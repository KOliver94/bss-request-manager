from django.core.management import BaseCommand
from django.utils.timezone import localtime
from video_requests.emails import email_crew_daily_reminder
from video_requests.models import Request


class Command(BaseCommand):
    help = "Send reminder to crew members of today's requests"

    def handle(self, *args, **options):
        today_min = localtime().replace(hour=0, minute=0, second=0, microsecond=0)
        today_max = localtime().replace(
            hour=23, minute=59, second=59, microsecond=999999
        )
        requests = Request.objects.filter(
            status__range=[Request.Statuses.REQUESTED, Request.Statuses.ACCEPTED],
            start_datetime__range=[today_min, today_max],
        )

        total_sent = 0

        for request in requests:
            if request.crew.exists():
                email_crew_daily_reminder(request, request.crew.all())
                total_sent += 1

        if requests.exists():
            self.stdout.write(
                self.style.SUCCESS(
                    f"{total_sent} reminders were sent to crew members. "
                    f"There are {requests.count()} request(s) today."
                )
            )
        else:
            self.stdout.write(self.style.NOTICE("No reminders for today."))

from django.core.management import BaseCommand
from django.utils.timezone import localdate
from video_requests.emails import email_responsible_overdue_request
from video_requests.models import Request


class Command(BaseCommand):
    help = "Send email to responsible, production manager and editor in chief about overdue requests"

    def handle(self, *args, **options):
        today = localdate()
        overdue_requests = Request.objects.filter(
            status__range=[Request.Statuses.REQUESTED, Request.Statuses.UPLOADED],
            deadline__lt=today,
        )
        for request in overdue_requests:
            email_responsible_overdue_request(request)
            self.stdout.write(
                self.style.SUCCESS(
                    f"Overdue request email was sent successfully. ({request.title})"
                )
            )
        if not len(overdue_requests):
            self.stdout.write(self.style.NOTICE("No overdue request was found."))

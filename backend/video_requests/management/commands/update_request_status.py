from datetime import datetime

from django.core.management import BaseCommand
from video_requests.models import Request
from video_requests.utilities import update_request_status


class Command(BaseCommand):
    help = "Update status of requests which should be recorded by this time"

    def handle(self, *args, **options):
        to_update = Request.objects.filter(status=2, end_datetime__lte=datetime.now())
        for request in to_update:
            update_request_status(request)
        self.stdout.write(
            self.style.SUCCESS(
                f"{to_update.count()} requests was checked for valid status."
            )
        )

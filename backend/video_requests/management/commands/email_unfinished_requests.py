from django.core.management import BaseCommand

from video_requests.emails import email_production_manager_unfinished_requests
from video_requests.models import Request


class Command(BaseCommand):
    help = 'Send email to production manager about unfinished requests'

    def handle(self, *args, **options):
        unfinished_requests = Request.objects.filter(status__range=[5, 6]).order_by('start_datetime')
        if unfinished_requests.exists():
            email_production_manager_unfinished_requests(unfinished_requests)
            self.stdout.write(self.style.SUCCESS('Unfinished requests email was sent successfully.'))
        else:
            self.stdout.write(self.style.NOTICE('No tasks for this week.'))

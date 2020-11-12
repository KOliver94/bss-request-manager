from common.utilities import create_calendar_event, get_google_calendar_service
from django.contrib.auth.models import User
from django.core.management import BaseCommand
from tests.helpers.video_requests_test_utils import create_request


class Command(BaseCommand):
    help = "Test Google Calendar API"

    def add_arguments(self, parser):
        parser.add_argument(
            "-l",
            "--list",
            action="store_true",
            help="List available calendars for service account.",
        )
        parser.add_argument(
            "-c", "--check", type=str, help="Check if this calendar is available."
        )
        parser.add_argument(
            "-a", "--accept", type=str, help="Accept invitation for given calendar."
        )
        parser.add_argument(
            "-rm", "--remove", type=str, help="Remove calendar from service account."
        )
        parser.add_argument(
            "-t",
            "--test",
            action="store_true",
            help="Save a test event to the calendar.",
        )

    def handle(self, *args, **options):
        ls = options["list"]
        check = options["check"]
        accept = options["accept"]
        remove = options["remove"]
        test = options["test"]

        service = get_google_calendar_service()

        if ls or check:
            calendar_list = service.calendarList().list().execute()
            if calendar_list["items"]:
                for event in calendar_list["items"]:
                    if ls:
                        self.stdout.write(
                            self.style.SUCCESS(f'{event["summary"]} - {event["id"]}')
                        )
                    elif check:
                        if event["id"] == check:
                            self.stdout.write(
                                self.style.SUCCESS(
                                    "Service account has access to the calendar."
                                )
                            )
                        else:
                            self.stdout.write(
                                self.style.ERROR(
                                    "Service account does not have access to the calendar."
                                )
                            )
            else:
                self.stdout.write(
                    self.style.ERROR(
                        "Service account does not have access to any calendars."
                    )
                )

        elif accept:
            event = {"id": accept}
            service.calendarList().insert(body=event).execute()
            self.stdout.write(
                self.style.SUCCESS(
                    "Calendar was added to service account successfully."
                )
            )

        elif remove:
            service.calendarList().delete(calendarId=remove).execute()
            self.stdout.write(
                self.style.SUCCESS(
                    "Calendar was removed from service account successfully."
                )
            )

        elif test:
            request = create_request(999999, User.objects.get(pk=1))
            try:
                create_calendar_event(request.id)
                self.stdout.write(self.style.SUCCESS("Event was saved successfully."))
            finally:
                request.delete()

        else:
            self.stdout.write(
                self.style.ERROR("Please define exactly one argument or flag.")
            )

from celery import shared_task
from django.conf import settings
from django.contrib.auth.models import User
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.discovery_cache.base import Cache

from video_requests.models import Request


##############################
#          Common            #
##############################
@property
def role(self):
    if self.is_admin:
        return "admin"
    elif self.is_staff:
        return "staff"
    else:
        return "user"


def get_full_name_eastern_order(self):
    full_name = f"{self.last_name} {self.first_name}"
    return full_name.strip()


@property
def is_admin(self):
    return self.is_staff and (
        self.groups.filter(name=settings.ADMIN_GROUP).exists() or self.is_superuser
    )


@property
def is_service_account(self):
    return self.groups.filter(name=settings.SERVICE_ACCOUNTS_GROUP).exists()


User.add_to_class("role", role)
User.add_to_class("get_full_name_eastern_order", get_full_name_eastern_order)
User.add_to_class("is_admin", is_admin)
User.add_to_class("is_service_account", is_service_account)


##############################
#       Special Roles        #
##############################
def get_editor_in_chief():
    return User.objects.filter(groups__name="FOSZERKESZTO")


def get_production_manager():
    return User.objects.filter(groups__name="GYARTASVEZETO")


def get_pr_responsible():
    return User.objects.filter(groups__name="PR")


##############################
#      Google Calendar       #
##############################


# https://github.com/googleapis/google-api-python-client/issues/325#issuecomment-274349841
class MemoryCache(Cache):
    _CACHE = {}

    def get(self, url):
        return MemoryCache._CACHE.get(url)

    def set(self, url, content):
        MemoryCache._CACHE[url] = content


def get_google_calendar_service():
    credentials = Credentials.from_service_account_file(
        filename=settings.GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH,
        scopes=["https://www.googleapis.com/auth/calendar"],
    )
    return build("calendar", "v3", credentials=credentials, cache=MemoryCache())


def get_calendar_event_body(request):
    return {
        "summary": request.title,
        "location": request.place,
        "description": f'További információk a <a href="{request.admin_url}">felkéréskezelőben</a>.',
        "start": {
            "dateTime": request.start_datetime.isoformat(),
            "timeZone": settings.TIME_ZONE,
        },
        "end": {
            "dateTime": request.end_datetime.isoformat(),
            "timeZone": settings.TIME_ZONE,
        },
    }


@shared_task
def create_calendar_event(request_id):
    if not settings.GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH:
        return "Missing credentials file for Google Calendar"
    request = Request.objects.get(pk=request_id)  # nosec B113
    service = get_google_calendar_service()
    request.additional_data["calendar_id"] = (
        service.events()
        .insert(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            body=get_calendar_event_body(request),
        )
        .execute()["id"]
    )
    request.save()
    return f"Calendar event for {request.title} was created successfully."


@shared_task
def update_calendar_event(request_id):
    if not settings.GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH:
        return "Missing credentials file for Google Calendar"
    request = Request.objects.get(pk=request_id)  # nosec B113
    if request.additional_data and "calendar_id" in request.additional_data:
        service = get_google_calendar_service()
        service.events().patch(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            eventId=request.additional_data["calendar_id"],
            body=get_calendar_event_body(request),
        ).execute()
        return f"Calendar event for {request.title} was updated successfully."


@shared_task
def remove_calendar_event(request_id):
    if not settings.GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH:
        return "Missing credentials file for Google Calendar"
    request = Request.objects.get(pk=request_id)  # nosec B113
    if request.additional_data and "calendar_id" in request.additional_data:
        service = get_google_calendar_service()
        service.events().delete(
            calendarId=settings.GOOGLE_CALENDAR_ID,
            eventId=request.additional_data["calendar_id"],
        ).execute()
        return "Calendar event for {request.title} was deleted successfully."

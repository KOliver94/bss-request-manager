from celery import shared_task
from django.conf import settings
from django.contrib.auth.models import User
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.discovery_cache.base import Cache
from googleapiclient.errors import HttpError
from video_requests.models import Request


##############################
#           LDAP             #
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
        "description": f'További információk a <a href="{settings.BASE_URL}/admin/requests/{request.id}">felkérés kezelőben</a>.',
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
    request = Request.objects.get(pk=request_id)
    service = get_google_calendar_service()
    try:
        request.additional_data["calendar_id"] = (
            service.events()
            .insert(
                calendarId=settings.GOOGLE_CALENDAR_ID,
                body=get_calendar_event_body(request),
            )
            .execute()["id"]
        )
        request.save()
    except HttpError:
        return


@shared_task
def update_calendar_event(request_id):
    request = Request.objects.get(pk=request_id)
    if request.additional_data and "calendar_id" in request.additional_data:
        service = get_google_calendar_service()
        try:
            service.events().patch(
                calendarId=settings.GOOGLE_CALENDAR_ID,
                eventId=request.additional_data["calendar_id"],
                body=get_calendar_event_body(request),
            ).execute()
        except HttpError:
            return


@shared_task
def remove_calendar_event(calendar_id):
    service = get_google_calendar_service()
    try:
        service.events().delete(
            calendarId=settings.GOOGLE_CALENDAR_ID, eventId=calendar_id,
        ).execute()
    except HttpError:
        return

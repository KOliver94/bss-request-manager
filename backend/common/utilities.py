from django.contrib.auth.models import User
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build

from manager import settings


def get_editor_in_chief():
    return User.objects.filter(groups__name='FOSZERKESZTO')


def get_production_manager():
    return User.objects.filter(groups__name='GYARTASVEZETO')


def get_pr_responsible():
    return User.objects.filter(groups__name='PR')


def get_google_calendar_service():
    credentials = Credentials.from_service_account_file(filename=settings.GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH,
                                                        scopes=['https://www.googleapis.com/auth/calendar'])
    return build('calendar', 'v3', credentials=credentials)


def create_calendar_event(request):
    service = get_google_calendar_service()

    service.events().insert(calendarId=settings.GOOGLE_CALENDAR_ID, body={
        'summary': request.title,
        'location': request.place,
        'start': {
            'dateTime': request.start_datetime.isoformat(),
            'timeZone': settings.TIME_ZONE,
        },
        'end': {
            'dateTime': request.end_datetime.isoformat(),
            'timeZone': settings.TIME_ZONE,
        },
    }).execute()

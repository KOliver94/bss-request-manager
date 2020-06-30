from django.contrib.auth.models import User
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

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


def get_calendar_event_body(request):
    return {
        'summary': request.title,
        'location': request.place,
        'description':
            f'További információk a <a href="{settings.BASE_URL}/admin/requests/{request.id}">felkérés kezelőben</a>.',
        'start': {
            'dateTime': request.start_datetime.isoformat(),
            'timeZone': settings.TIME_ZONE,
        },
        'end': {
            'dateTime': request.end_datetime.isoformat(),
            'timeZone': settings.TIME_ZONE,
        },
    }


def create_calendar_event(request):
    service = get_google_calendar_service()
    try:
        request.additional_data['calendar_id'] = \
            service.events().insert(calendarId=settings.GOOGLE_CALENDAR_ID,
                                    body=get_calendar_event_body(request)).execute()['id']
        request.save()
    except HttpError:
        return


def update_calendar_event(request):
    if request.additional_data and request.additional_data['calendar_id']:
        service = get_google_calendar_service()
        try:
            service.events().patch(calendarId=settings.GOOGLE_CALENDAR_ID,
                                   eventId=request.additional_data['calendar_id'],
                                   body=get_calendar_event_body(request)).execute()
        except HttpError:
            return


def remove_calendar_event(request):
    if request.additional_data and request.additional_data['calendar_id']:
        service = get_google_calendar_service()
        try:
            service.events().delete(calendarId=settings.GOOGLE_CALENDAR_ID,
                                    eventId=request.additional_data['calendar_id']).execute()
        except HttpError:
            return

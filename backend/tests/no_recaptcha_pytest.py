import pytest
from django.conf import settings
from django.contrib.auth.models import User
from django.core import mail
from django.test import override_settings
from rest_framework import status
from tests.email_sending_tests import EMAIL_FILE
from tests.helpers.test_utils import conditional_override_settings


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture
def disable_recaptcha(settings):
    settings.DRF_RECAPTCHA_ENABLED = False


@pytest.mark.django_db
def test_anonymous_can_create_requests_without_captcha(api_client, disable_recaptcha):
    data = {
        "title": "Test Request",
        "start_datetime": "2020-03-05T10:30",
        "end_datetime": "2020-03-06T10:30",
        "place": "Test place",
        "type": "Test type",
        "requester_first_name": "Test",
        "requester_last_name": "User",
        "requester_email": "test.user@example.com",
        "requester_mobile": "+36509999999",
        "comment_text": "Additional information",
    }
    assert not User.objects.filter(email=data["requester_email"]).exists()
    response = api_client.post("/api/v1/requests", data)
    assert response.status_code == status.HTTP_201_CREATED
    assert User.objects.filter(email=data["requester_email"]).exists()
    assert response.data["comments"][0]["author"]["username"] == "test.user@example.com"
    assert response.data["comments"][0]["text"] == "Additional information"


@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
@conditional_override_settings(
    EMAIL_BACKEND="tests.helpers.test_utils.CombinedEmailBackend", CONDITION=EMAIL_FILE
)
def test_contact_message_email_sent_without_captcha(api_client, disable_recaptcha):
    data = {
        "name": "Joe Bloggs",
        "email": "joe@example.com",
        "message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere tempus nibh et lobortis.",
    }
    response = api_client.post("/api/v1/misc/contact", data)
    assert response.status_code == status.HTTP_201_CREATED

    # Check if e-mail was sent to the right people
    assert len(mail.outbox) == 1
    assert data["email"] in mail.outbox[0].to
    assert settings.DEFAULT_REPLY_EMAIL in mail.outbox[0].cc
    assert settings.DEFAULT_REPLY_EMAIL in mail.outbox[0].reply_to
    assert mail.outbox[0].subject == "Kapcsolatfelvétel | Budavári Schönherz Stúdió"

import pytest
from django.contrib.auth.models import User
from rest_framework import status


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

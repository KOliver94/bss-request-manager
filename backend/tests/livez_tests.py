from django.urls import reverse
from rest_framework.status import HTTP_200_OK

# No django_db marker on purpose: /livez must answer without touching the DB.


def test_livez_returns_ok(client):
    response = client.get(reverse("livez"))

    assert response.status_code == HTTP_200_OK
    assert response.content == b"ok"

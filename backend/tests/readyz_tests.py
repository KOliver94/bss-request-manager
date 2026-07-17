import pytest
from django.urls import reverse
from rest_framework.status import HTTP_200_OK

pytestmark = pytest.mark.django_db


def test_readyz_ok_when_db_and_redis_up(client):
    response = client.get(reverse("readyz"))

    assert response.status_code == HTTP_200_OK

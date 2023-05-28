from random import randint

import pytest
from django.contrib.auth.models import Group, User
from rest_framework.test import APIClient

from video_requests.models import Request, Video


@pytest.fixture
def api_client():
    client = APIClient()
    return client


@pytest.fixture
def admin_user():
    user = User.objects.create_user(
        email="admin@example.com",
        first_name="Admin",
        is_staff=True,
        last_name="Test",
        password="password",
        username="admin",
    )

    group = Group.objects.get_or_create(name="Administrators")[0]
    user.groups.add(group)

    user.save()

    return user


@pytest.fixture
def staff_user():
    return User.objects.create_user(
        email="staff@example.com",
        first_name="Staff",
        is_staff=True,
        last_name="Test",
        password="password",
        username="staff",
    )


@pytest.fixture
def basic_user():
    return User.objects.create_user(
        email="basic@example.com",
        first_name="Basic",
        is_staff=False,
        last_name="Test",
        password="password",
        username="basic",
    )


@pytest.fixture
def not_existing_request_id():
    while True:
        non_existing_id = randint(1000, 100000)
        if not Request.objects.filter(pk=non_existing_id).exists():
            return non_existing_id


@pytest.fixture
def not_existing_user_id():
    while True:
        non_existing_id = randint(1000, 100000)
        if not User.objects.filter(pk=non_existing_id).exists():
            return non_existing_id


@pytest.fixture
def not_existing_video_id():
    while True:
        non_existing_id = randint(1000, 100000)
        if not Video.objects.filter(pk=non_existing_id).exists():
            return non_existing_id

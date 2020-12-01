import json
from io import StringIO

from common.models import get_sentinel_user
from django.conf import settings
from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from tests.helpers.users_test_utils import create_user
from tests.helpers.video_requests_test_utils import (
    create_comment,
    create_crew,
    create_rating,
    create_request,
    create_video,
)


class CommonTestCase(TestCase):
    def setUp(self):
        self.user = create_user()

    def test_userprofile_to_str(self):
        self.assertEqual(
            str(self.user.userprofile),
            f"{self.user.first_name} {self.user.last_name}'s ({self.user.username}) profile",
        )

    def test_sentinel_user_on_user_delete(self):
        user = create_user()
        request = create_request(100, user, responsible=user)
        video = create_video(200, request, editor=user)
        create_crew(300, request, user, "Test")
        create_comment(400, request, user, False)
        create_rating(500, video, user)

        request.refresh_from_db()

        self.assertEqual(request.requester, user)
        self.assertEqual(request.responsible, user)
        self.assertEqual(request.videos.get().editor, user)
        self.assertEqual(request.crew.get().member, user)
        self.assertEqual(request.comments.get().author, user)
        self.assertEqual(request.videos.get().ratings.get().author, user)

        user.delete()
        request.refresh_from_db()

        sentinel_user = get_sentinel_user()
        self.assertIsNone(request.requester)
        self.assertIsNone(request.responsible)
        self.assertIsNone(request.videos.get().editor)
        self.assertFalse(request.crew.exists())
        self.assertEqual(request.comments.get().author, sentinel_user)
        self.assertEqual(request.videos.get().ratings.get().author, sentinel_user)

    def test_health_check_endpoint_works(self):
        token = (
            f"/{settings.HEALTH_CHECK_URL_TOKEN}"
            if hasattr(settings, "HEALTH_CHECK_URL_TOKEN")
            and settings.HEALTH_CHECK_URL_TOKEN is not None
            else ""
        )
        response = self.client.get(f"/api/v1/health{token}?format=json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response.data = json.loads(response.content)
        self.assertIn("Cache backend: default", response.data)
        self.assertIn("DatabaseBackend", response.data)
        self.assertIn("DefaultFileStorageHealthCheck", response.data)
        self.assertIn("MigrationsHealthCheck", response.data)
        self.assertIn("RedisHealthCheck", response.data)

    def test_health_check_management_command_works(self):
        with StringIO() as out:
            call_command("health_check", stdout=out)
            self.assertEqual(out.getvalue().count("working"), 5)
            self.assertIn("Cache backend: default", out.getvalue())
            self.assertIn("DatabaseBackend", out.getvalue())
            self.assertIn("DefaultFileStorageHealthCheck", out.getvalue())
            self.assertIn("MigrationsHealthCheck", out.getvalue())
            self.assertIn("RedisHealthCheck", out.getvalue())

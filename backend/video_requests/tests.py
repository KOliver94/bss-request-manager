from datetime import timedelta

from django.conf import settings
from django.core.exceptions import ValidationError
from django.test import TestCase

from tests.helpers.users_test_utils import create_user
from tests.helpers.video_requests_test_utils import (
    create_comment,
    create_crew,
    create_rating,
    create_request,
    create_todo,
    create_video,
)


class VideoRequestsTestCase(TestCase):
    def setUp(self):
        user = create_user()
        self.request = create_request(100, user)
        self.crew_member = create_crew(200, self.request, user, "Test")
        self.video = create_video(300, self.request)
        self.comment = create_comment(400, self.request, user, False)
        self.rating = create_rating(500, self.video, user)
        self.todo = create_todo(600, "Test todo", self.request, user)

    def test_request_to_str(self):
        self.assertEqual(
            str(self.request),
            f"{self.request.title} || {self.request.start_datetime.date()}",
        )

    def test_request_get_url(self):
        self.assertEqual(
            self.request.url, f"{settings.BASE_URL}/my-requests/{self.request.id}"
        )

    def test_request_get_admin_url(self):
        self.assertEqual(
            self.request.admin_url,
            f"{settings.BASE_URL}/admin/requests/{self.request.id}",
        )

    def test_crew_member_to_str(self):
        self.assertEqual(
            str(self.crew_member),
            f"{self.crew_member.request.title} || {self.crew_member.member.get_full_name_eastern_order()} - {self.crew_member.position}",
        )

    def test_video_to_str(self):
        self.assertEqual(
            str(self.video), f"{self.video.request.title} || {self.video.title}"
        )

    def test_video_get_published_url_none(self):
        self.assertIsNone(self.video.published_url)

    def test_video_get_published_url(self):
        test_url = "https://example.com"
        self.video.additional_data["publishing"] = {"website": test_url}
        self.video.save()
        self.assertEqual(self.video.published_url, test_url)

    def test_comment_to_str(self):
        self.assertEqual(
            str(self.comment),
            f"{self.comment.request.title} || {self.comment.text} - {self.comment.author.get_full_name_eastern_order()}",
        )

    def test_rating_to_str(self):
        self.assertEqual(
            str(self.rating),
            f"{self.rating.video.title} || {self.rating.author.get_full_name_eastern_order()} ({self.rating.rating})",
        )

    def test_todo_to_str(self):
        self.assertEqual(
            str(self.todo),
            f"Todo || {self.request.title} - {self.todo.description[0:25]}[...]",
        )

    def test_request_date_validation(self):
        self.request.refresh_from_db()
        self.request.full_clean()

        with self.assertRaises(ValidationError) as context:
            self.request.end_datetime = self.request.start_datetime - timedelta(hours=5)
            self.request.full_clean()
        self.assertEqual(
            context.exception.messages[0], "Must be later than the start of the event."
        )

    def test_request_deadline_validation(self):
        self.request.refresh_from_db()
        self.request.full_clean()

        with self.assertRaises(ValidationError) as context:
            self.request.deadline = self.request.end_datetime.date()
            self.request.full_clean()
        self.assertEqual(
            context.exception.messages[0],
            "Must be later than the end of the event.",
        )

    def test_request_additional_data_validation(self):
        self.request.refresh_from_db()
        self.request.full_clean()

        with self.assertRaises(ValidationError) as context:
            self.request.additional_data = {"randomKey": "randomValue"}
            self.request.full_clean()
        self.assertIn(
            "Additional properties are not allowed ('randomKey' was unexpected)",
            context.exception.messages[0],
        )

    def test_video_additional_data_validation(self):
        self.video.refresh_from_db()
        self.video.full_clean()

        with self.assertRaises(ValidationError) as context:
            self.video.additional_data = {"randomKey": "randomValue"}
            self.video.full_clean()
        self.assertIn(
            "Additional properties are not allowed ('randomKey' was unexpected)",
            context.exception.messages[0],
        )

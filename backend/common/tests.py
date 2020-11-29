from common.models import get_sentinel_user
from django.test import TestCase
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

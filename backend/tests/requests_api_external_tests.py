import json
from unittest.mock import patch

import requests
from django.conf import settings
from django.contrib.auth.models import User
from django.test import override_settings
from django_celery_results.models import TaskResult
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from tests.helpers.users_test_utils import create_user, get_default_password
from tests.helpers.video_requests_test_utils import (
    create_comment,
    create_rating,
    create_request,
    create_video,
)
from video_requests.models import Request

INVALID_ID = 9000


class RequestsAPIExternalTestCase(APITestCase):
    def setUp(self):
        self.url = "/api/v1/external/sch-events/requests"
        self.admin_url = "/api/v1/admin/requests"
        self.default_url = "/api/v1/requests"
        self.user = create_user(password="unusable", groups=["Service Accounts"])
        token = Token.objects.get_or_create(user=self.user)[0]
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def authorize_user(self, user):
        url = reverse("login_obtain_jwt_pair")
        resp = self.client.post(
            url,
            {"username": user.username, "password": get_default_password()},
            format="json",
        )
        token = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    @property
    def _create_request_test_data(self):
        return {
            "title": "New Request",
            "start_datetime": "2021-05-06T20:36:00.000Z",
            "end_datetime": "2021-05-07T20:36:00.000Z",
            "place": "Random place",
            "type": "My custom type",
            "requester_first_name": "Tester",
            "requester_last_name": "User",
            "requester_email": "test.user@example.com",
            "requester_mobile": "+36509999999",
            "callback_url": "https://example.com/api/callback/123",
        }

    def test_external_request_creation_new_user(self):
        data = self._create_request_test_data
        self.assertEqual(
            User.objects.filter(email=data["requester_email"]).exists(), False
        )
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            User.objects.filter(email=data["requester_email"]).exists(), True
        )

        req = Request.objects.get(pk=response.data["id"])
        self.assertEqual(req.requester.email, data["requester_email"])
        self.assertEqual(req.requested_by, self.user)
        self.assertEqual(
            req.additional_data["external"]["sch_events_callback_url"],
            data["callback_url"],
        )

    def test_external_request_creation_existing_user(self):
        existing_user = create_user()
        data = self._create_request_test_data | {
            "requester_email": existing_user.email,
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        req = Request.objects.get(pk=response.data["id"])
        self.assertEqual(req.requester, existing_user)
        self.assertEqual(req.requested_by, self.user)
        self.assertEqual(
            req.additional_data["external"]["sch_events_callback_url"],
            data["callback_url"],
        )
        self.assertEqual(
            req.additional_data["requester"]["first_name"], data["requester_first_name"]
        )
        self.assertEqual(
            req.additional_data["requester"]["last_name"], data["requester_last_name"]
        )
        self.assertEqual(
            req.additional_data["requester"]["phone_number"], data["requester_mobile"]
        )

    def test_external_request_creation_with_comment(self):
        data = self._create_request_test_data | {
            "comment_text": "Additional information about the request.",
        }
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["comments"][0]["author"]["username"],
            data["requester_email"],
        )
        self.assertEqual(response.data["comments"][0]["text"], data["comment_text"])

    def test_external_request_creation_unusable_for_other_users(self):
        data = self._create_request_test_data
        admin_user = create_user(is_admin=True)
        self.authorize_user(admin_user)
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        staff_user = create_user(is_staff=True)
        self.authorize_user(staff_user)
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        user = create_user()
        self.authorize_user(user)
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.credentials()
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_external_request_retrieve_success(self):
        user = create_user()
        request = create_request(100, user, requested_by=self.user)
        response = self.client.get(f"{self.url}/{request.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_external_request_retrieve_fail(self):
        response = self.client.get(f"{self.url}/{INVALID_ID}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        user = create_user()
        request = create_request(100, user, requested_by=user)
        response = self.client.get(f"{self.url}/{request.id}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_external_request_retrieve_unusable_for_other_users(self):
        user = create_user()
        request = create_request(100, user, requested_by=self.user)

        admin_user = create_user(is_admin=True)
        self.authorize_user(admin_user)
        response = self.client.get(f"{self.url}/{request.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        staff_user = create_user(is_staff=True)
        self.authorize_user(staff_user)
        response = self.client.get(f"{self.url}/{request.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.authorize_user(user)
        response = self.client.get(f"{self.url}/{request.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.credentials()
        response = self.client.get(f"{self.url}/{request.id}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @property
    def _create_comment_test_data(self):
        return {
            "text": "New information and changes.",
        }

    def test_external_comment_creation_success(self):
        data = self._create_comment_test_data
        user = create_user()
        request = create_request(100, user, requested_by=self.user)

        response = self.client.post(f"{self.url}/{request.id}/comments", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        req = Request.objects.get(pk=request.id)
        self.assertEqual(req.comments.all()[0].author, self.user)
        self.assertEqual(req.comments.all()[0].text, data["text"])

    def test_external_comment_creation_fail(self):
        data = self._create_comment_test_data

        response = self.client.post(f"{self.url}/{INVALID_ID}/comments", data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        user = create_user()
        request = create_request(100, user, requested_by=user)
        response = self.client.post(f"{self.url}/{request.id}/comments", data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_external_comment_creation_unusable_for_other_users(self):
        data = self._create_comment_test_data
        user = create_user()
        request = create_request(100, user, requested_by=self.user)

        admin_user = create_user(is_admin=True)
        self.authorize_user(admin_user)
        response = self.client.post(f"{self.url}/{request.id}/comments", data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        staff_user = create_user(is_staff=True)
        self.authorize_user(staff_user)
        response = self.client.post(f"{self.url}/{request.id}/comments", data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.authorize_user(user)
        response = self.client.post(f"{self.url}/{request.id}/comments", data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.credentials()
        response = self.client.post(f"{self.url}/{request.id}/comments", data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    @patch(
        "video_requests.utilities.notify_sch_event_management_system.delay",
    )
    def test_external_callback_for_status_change_works(
        self, mock_notify_sch_event_management_system
    ):
        data = self._create_request_test_data
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id1 = response.data["id"]
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id2 = response.data["id"]

        admin_user = create_user(is_admin=True)
        self.authorize_user(admin_user)

        # Request changed from Requested to Accepted
        self.client.patch(
            f"{self.admin_url}/{request_id1}", {"additional_data": {"accepted": True}}
        )
        mock_notify_sch_event_management_system.assert_called()
        self.assertTrue(mock_notify_sch_event_management_system.call_args.args[1])

        # Request changed from Requested to Denied
        self.client.patch(
            f"{self.admin_url}/{request_id2}", {"additional_data": {"accepted": False}}
        )
        mock_notify_sch_event_management_system.assert_called()
        self.assertFalse(mock_notify_sch_event_management_system.call_args.args[1])

        # Request changed from Accepted to Denied
        self.client.patch(
            f"{self.admin_url}/{request_id1}", {"additional_data": {"accepted": False}}
        )
        mock_notify_sch_event_management_system.assert_called()
        self.assertFalse(mock_notify_sch_event_management_system.call_args.args[1])

        # Request changed from Denied to Accepted
        self.client.patch(
            f"{self.admin_url}/{request_id2}", {"additional_data": {"accepted": True}}
        )
        mock_notify_sch_event_management_system.assert_called()
        self.assertTrue(mock_notify_sch_event_management_system.call_args.args[1])

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    @patch("video_requests.utilities.requests.post")
    @patch("video_requests.utilities.requests.head")
    def test_external_callback_for_status_change_redirect_and_result_works(
        self, mock_requests_head, mock_requests_post
    ):
        data = self._create_request_test_data
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id = response.data["id"]

        def mock_head_redirect_response():
            r = requests.Response()
            r.status_code = 504
            r.url = "https://redirected.example.com/api/callback/123"
            return r

        def mock_post_response():
            r = requests.Response()
            r.status_code = 200
            r.json = lambda: {"status": "ok"}
            return r

        mock_requests_head.return_value = mock_head_redirect_response()
        mock_requests_post.return_value = mock_post_response()

        admin_user = create_user(is_admin=True)
        self.authorize_user(admin_user)
        self.client.patch(
            f"{self.admin_url}/{request_id}", {"additional_data": {"accepted": True}}
        )

        mock_requests_head.assert_called_once()
        mock_requests_post.assert_called_once()
        mock_requests_post.assert_called_with(
            mock_head_redirect_response().url,
            data={"accept": True},
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {settings.SCH_EVENTS_TOKEN}",
            },
            allow_redirects=False,
        )
        self.assertDictEqual(
            json.loads(
                TaskResult.objects.get(task_args__contains="api/callback/123").result
            ),
            {"status": "ok"},
        )

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    @patch("video_requests.utilities.requests.post")
    def test_external_callback_for_status_change_retry_works(self, mock_requests_post):
        data = self._create_request_test_data
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        request_id = response.data["id"]

        def mock_response():
            r = requests.Response()
            r.status_code = 500
            return r

        mock_requests_post.return_value = mock_response()

        admin_user = create_user(is_admin=True)
        self.authorize_user(admin_user)
        self.client.patch(
            f"{self.admin_url}/{request_id}", {"additional_data": {"accepted": True}}
        )
        self.assertEqual(mock_requests_post.call_count, 11)

    def test_service_account_should_not_access_other_endpoints(self):
        request = create_request(100, self.user)
        video = create_video(200, request)
        comment = create_comment(300, request, self.user, False)
        rating = create_rating(400, video, self.user)

        # Default API
        # Create Request
        response = self.client.post(self.default_url, self._create_request_test_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # List Requests
        response = self.client.get(self.default_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Retrieve Request
        response = self.client.get(f"{self.default_url}/{request.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # List Videos
        response = self.client.get(f"{self.default_url}/{request.id}/videos")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Retrieve Video
        response = self.client.get(f"{self.default_url}/{request.id}/videos/{video.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Create Comment
        response = self.client.post(
            f"{self.default_url}/{request.id}/comments", {"text": "Test"}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # List Comments
        response = self.client.get(f"{self.default_url}/{request.id}/comments")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Retrieve Comment
        response = self.client.get(
            f"{self.default_url}/{request.id}/comments/{comment.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Modify Comment
        response = self.client.patch(
            f"{self.default_url}/{request.id}/comments/{comment.id}", {"text": "Test"}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Delete Comment
        response = self.client.delete(
            f"{self.default_url}/{request.id}/comments/{comment.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Create Rating
        response = self.client.post(
            f"{self.default_url}/{request.id}/videos/{video.id}/ratings", {"rating": 5}
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # List Ratings
        response = self.client.get(
            f"{self.default_url}/{request.id}/videos/{video.id}/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Retrieve Rating
        response = self.client.get(
            f"{self.default_url}/{request.id}/videos/{video.id}/ratings/{rating.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Modify Rating
        response = self.client.patch(
            f"{self.default_url}/{request.id}/videos/{video.id}/ratings/{rating.id}",
            {"rating": 5},
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Delete Rating
        response = self.client.delete(
            f"{self.default_url}/{request.id}/videos/{video.id}/ratings/{rating.id}"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

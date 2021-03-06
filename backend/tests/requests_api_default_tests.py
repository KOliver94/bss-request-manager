from datetime import timedelta

from django.contrib.auth.models import User
from django.test import override_settings
from django.utils.timezone import localtime
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from tests.helpers.users_test_utils import create_user, get_default_password
from tests.helpers.video_requests_test_utils import (
    create_comment,
    create_rating,
    create_request,
    create_video,
)
from video_requests.models import Request, Video

BASE_URL = "/api/v1/requests/"
NOT_EXISTING_ID = 9000


class RequestsAPIDefaultTestCase(APITestCase):
    def authorize_user(self, user):
        url = reverse("login_obtain_jwt_pair")
        resp = self.client.post(
            url,
            {"username": user.username, "password": get_default_password()},
            format="json",
        )
        token = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

    def setUp(self):
        # Create normal user
        self.normal_user = create_user()

        # Create staff user
        self.staff_user = create_user(is_staff=True)

        # Create admin user
        self.admin_user = create_user(is_admin=True)

        # Create 3 sample Request objects (1 for each user type)
        self.request1 = create_request(101, self.normal_user)
        self.request2 = create_request(102, self.staff_user)
        self.request3 = create_request(103, self.admin_user)

        # Create 6 sample Video object (2-2 for the first 3 Requests)
        # The videos 2, 4, 6 have no Ratings (used to test Rating creation)
        self.video1 = create_video(301, self.request1)
        self.video2 = create_video(302, self.request1)
        self.video3 = create_video(303, self.request2)
        self.video4 = create_video(304, self.request2)
        self.video5 = create_video(305, self.request3)
        self.video6 = create_video(306, self.request3)

        # Create 15 sample Comment objects (5-5 for each Requests)
        # There are some unreal comments (eg: user should not comment to Requests where he is not the requester)
        self.comment1 = create_comment(501, self.request1, self.normal_user, False)
        self.comment2 = create_comment(502, self.request1, self.staff_user, True)
        self.comment3 = create_comment(503, self.request1, self.admin_user, True)
        self.comment4 = create_comment(504, self.request1, self.staff_user, False)
        self.comment5 = create_comment(505, self.request1, self.admin_user, False)
        self.comment6 = create_comment(506, self.request2, self.normal_user, False)
        self.comment7 = create_comment(507, self.request2, self.staff_user, True)
        self.comment8 = create_comment(508, self.request2, self.admin_user, True)
        self.comment9 = create_comment(509, self.request2, self.staff_user, False)
        self.comment10 = create_comment(510, self.request2, self.admin_user, False)
        self.comment11 = create_comment(511, self.request3, self.normal_user, False)
        self.comment12 = create_comment(512, self.request3, self.staff_user, True)
        self.comment13 = create_comment(513, self.request3, self.admin_user, True)
        self.comment14 = create_comment(514, self.request3, self.staff_user, False)
        self.comment15 = create_comment(515, self.request3, self.admin_user, False)

        # Create 9 Ratings
        # 3-3 for videos 1, 3 and 5
        # There are some unreal ratings (eg: user should not rate videos which are not related to their Requests)
        self.rating1 = create_rating(701, self.video1, self.normal_user)
        self.rating2 = create_rating(702, self.video1, self.staff_user)
        self.rating3 = create_rating(703, self.video1, self.admin_user)
        self.rating4 = create_rating(704, self.video3, self.normal_user)
        self.rating5 = create_rating(705, self.video3, self.staff_user)
        self.rating6 = create_rating(706, self.video3, self.admin_user)
        self.rating7 = create_rating(707, self.video5, self.normal_user)
        self.rating8 = create_rating(708, self.video5, self.staff_user)
        self.rating9 = create_rating(709, self.video5, self.admin_user)

    def assertNotFound(self, method, uri, data):
        if method == "GET":
            response = self.client.get(uri)
        elif method == "POST":
            response = self.client.post(uri, data)
        elif method == "PATCH":
            response = self.client.put(uri, data)
        elif method == "PUT":
            response = self.client.patch(uri, data)
        elif method == "DELETE":
            response = self.client.delete(uri)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def assertUnauthorized(self, response):
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def assertForbidden(self, method, uri, data):
        if method == "PATCH":
            response = self.client.put(uri, data)
        elif method == "PUT":
            response = self.client.patch(uri, data)
        elif method == "DELETE":
            response = self.client.delete(uri)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    """
    --------------------------------------------------
                         REQUESTS
    --------------------------------------------------
    """
    """
    GET /api/v1/requests
    """

    def test_admin_can_get_own_requests(self):
        self.authorize_user(self.admin_user)
        response = self.client.get("/api/v1/requests")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        response = self.client.get(
            "/api/v1/requests/" + str(response.data["results"][0]["id"])
        )
        self.assertEqual(
            response.data["requester"]["username"], self.admin_user.username
        )

    def test_staff_can_get_own_requests(self):
        self.authorize_user(self.staff_user)
        response = self.client.get("/api/v1/requests")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        response = self.client.get(
            "/api/v1/requests/" + str(response.data["results"][0]["id"])
        )
        self.assertEqual(
            response.data["requester"]["username"], self.staff_user.username
        )

    def test_user_can_get_own_requests(self):
        self.authorize_user(self.normal_user)
        response = self.client.get("/api/v1/requests")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        response = self.client.get(
            "/api/v1/requests/" + str(response.data["results"][0]["id"])
        )
        self.assertEqual(
            response.data["requester"]["username"], self.normal_user.username
        )

    def test_anonymous_cannot_get_requests(self):
        self.assertUnauthorized(self.client.get("/api/v1/requests"))

    """
    GET /api/v1/requests/:id
    """

    def test_admin_can_get_only_own_request_detail(self):
        self.authorize_user(self.admin_user)
        # Try to access other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request1.id), None)
        self.assertNotFound("GET", BASE_URL + str(self.request2.id), None)
        # Try to access not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID), None)
        # Try to access own request
        response = self.client.get(BASE_URL + str(self.request3.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["requester"]["username"], self.admin_user.username
        )
        # Check if user can only see non internal comments
        self.assertEqual(len(response.data["comments"]), 3)
        for comment in response.data["comments"]:
            self.assertNotIn("True", comment["text"])

    def test_staff_can_get_only_own_request_detail(self):
        self.authorize_user(self.staff_user)
        # Try to access other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request1.id), None)
        self.assertNotFound("GET", BASE_URL + str(self.request3.id), None)
        # Try to access not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID), None)
        # Try to access own request
        response = self.client.get(BASE_URL + str(self.request2.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["requester"]["username"], self.staff_user.username
        )
        # Check if user can only see non internal comments
        self.assertEqual(len(response.data["comments"]), 3)
        for comment in response.data["comments"]:
            self.assertNotIn("True", comment["text"])

    def test_user_can_get_only_own_request_detail(self):
        self.authorize_user(self.normal_user)
        # Try to access other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request2.id), None)
        self.assertNotFound("GET", BASE_URL + str(self.request3.id), None)
        # Try to access not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID), None)
        # Try to access own request
        response = self.client.get(BASE_URL + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["requester"]["username"], self.normal_user.username
        )
        # Check if user can only see non internal comments
        self.assertEqual(len(response.data["comments"]), 3)
        for comment in response.data["comments"]:
            self.assertNotIn("True", comment["text"])

    def test_anonymous_cannot_get_request_detail(self):
        # Try to access other user's requests
        self.assertUnauthorized(self.client.get(BASE_URL + str(self.request1.id)))
        self.assertUnauthorized(self.client.get(BASE_URL + str(self.request2.id)))
        self.assertUnauthorized(self.client.get(BASE_URL + str(self.request3.id)))
        # Try to access not existing request
        self.assertUnauthorized(self.client.get(BASE_URL + str(NOT_EXISTING_ID)))

    """
    POST /api/v1/requests/
    """

    def create_request(self):
        data = {
            "title": "Test Request",
            "start_datetime": "2020-03-05T10:30",
            "end_datetime": "2020-03-06T10:30",
            "place": "Test place",
            "type": "Test type",
        }
        return self.client.post("/api/v1/requests", data)

    def check_request_created_and_remove(self, request_id):
        response = self.client.get("/api/v1/requests")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        Request.objects.get(id=request_id).delete()

    def test_admin_can_create_requests(self):
        self.authorize_user(self.admin_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.admin_user.username
        )
        self.check_request_created_and_remove(response.data["id"])

    def test_staff_can_create_requests(self):
        self.authorize_user(self.staff_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.staff_user.username
        )
        self.check_request_created_and_remove(response.data["id"])

    def test_user_can_create_requests(self):
        self.authorize_user(self.normal_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.normal_user.username
        )
        self.check_request_created_and_remove(response.data["id"])

    def test_adding_initial_comment_to_request(self):
        self.authorize_user(self.normal_user)
        data = {
            "title": "Test Request",
            "start_datetime": "2020-03-05T10:30",
            "end_datetime": "2020-03-06T10:30",
            "place": "Test place",
            "type": "Test type",
            "comment_text": "Test comment",
        }
        response = self.client.post("/api/v1/requests", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["comments"][0]["author"]["username"],
            self.normal_user.username,
        )
        self.assertEqual(response.data["comments"][0]["text"], "Test comment")

    @override_settings(DRF_RECAPTCHA_TESTING_PASS=True)
    def test_anonymous_can_create_requests(self):
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
            "recaptcha": "randomReCaptchaResponseToken",
        }
        self.assertEqual(
            User.objects.filter(email=data["requester_email"]).exists(), False
        )
        response = self.client.post("/api/v1/requests", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            User.objects.filter(email=data["requester_email"]).exists(), True
        )
        self.assertEqual(
            response.data["comments"][0]["author"]["username"], "test.user@example.com"
        )
        self.assertEqual(response.data["comments"][0]["text"], "Additional information")

    @override_settings(DRF_RECAPTCHA_TESTING_PASS=True)
    def test_anonymous_can_create_requests_and_get_connected_to_existing_user(self):
        data = {
            "title": "Anonymous Test Request",
            "start_datetime": "2020-03-05T10:30",
            "end_datetime": "2020-03-06T10:30",
            "place": "Test place",
            "type": "Test type",
            "requester_first_name": "Anonymous",
            "requester_last_name": "Tester",
            "requester_email": self.normal_user.email,
            "requester_mobile": "+36701234567",
            "recaptcha": "randomReCaptchaResponseToken",
        }
        response = self.client.post("/api/v1/requests", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.authorize_user(self.normal_user)
        response = self.client.get(BASE_URL + str(response.data["id"]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Anonymous Test Request")
        self.assertEqual(
            response.data["requester"]["username"], self.normal_user.username
        )

        # Check if data was saved to additional_data
        req = Request.objects.get(pk=response.data["id"])
        self.assertEqual(
            req.additional_data["requester"]["first_name"], data["requester_first_name"]
        )
        self.assertEqual(
            req.additional_data["requester"]["last_name"], data["requester_last_name"]
        )
        self.assertEqual(
            req.additional_data["requester"]["phone_number"], data["requester_mobile"]
        )

    def test_request_date_relation_validation_user(self):
        self.authorize_user(self.normal_user)
        data = {
            "title": "Test Request",
            "start_datetime": localtime(),
            "place": "Test place",
            "type": "Test type",
            "comment_text": "Test comment",
        }
        data["end_datetime"] = data["start_datetime"] - timedelta(hours=2)
        response = self.client.post("/api/v1/requests", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["non_field_errors"][0], "Start time must be earlier than end."
        )

    @override_settings(DRF_RECAPTCHA_TESTING_PASS=True)
    def test_request_date_relation_validation_anonymous(self):
        data = {
            "title": "Test Request",
            "start_datetime": localtime(),
            "place": "Test place",
            "type": "Test type",
            "requester_first_name": "Test",
            "requester_last_name": "User",
            "requester_email": "test.user@example.com",
            "requester_mobile": "+36509999999",
            "comment_text": "Additional information",
            "recaptcha": "randomReCaptchaResponseToken",
        }
        data["end_datetime"] = data["start_datetime"] - timedelta(hours=2)
        response = self.client.post("/api/v1/requests", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["non_field_errors"][0], "Start time must be earlier than end."
        )

    @override_settings(DRF_RECAPTCHA_TESTING_PASS=False)
    def test_anonymous_fail_to_create_request_invalid_captcha(self):
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
            "recaptcha": "randomReCaptchaResponseToken",
        }
        response = self.client.post("/api/v1/requests", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["recaptcha"][0],
            "Error verifying reCAPTCHA, please try again.",
        )

    """
    --------------------------------------------------
                          VIDEOS
    --------------------------------------------------
    """
    """
    GET /api/v1/requests/:id/videos
    """

    def test_admin_can_get_videos_only_related_to_own_requests(self):
        self.authorize_user(self.admin_user)
        # Try to access videos on other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request1.id) + "/videos", None)
        self.assertNotFound("GET", BASE_URL + str(self.request2.id) + "/videos", None)
        # Try to access videos on not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID) + "/videos", None)
        # Try to access videos on own request
        response = self.client.get(BASE_URL + str(self.request3.id) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_staff_can_get_videos_only_related_to_own_requests(self):
        self.authorize_user(self.staff_user)
        # Try to access videos on other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request1.id) + "/videos", None)
        self.assertNotFound("GET", BASE_URL + str(self.request3.id) + "/videos", None)
        # Try to access videos on not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID) + "/videos", None)
        # Try to access videos on own request
        response = self.client.get(BASE_URL + str(self.request2.id) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_user_can_get_videos_only_related_to_own_requests(self):
        self.authorize_user(self.normal_user)
        # Try to access videos on other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request2.id) + "/videos", None)
        self.assertNotFound("GET", BASE_URL + str(self.request3.id) + "/videos", None)
        # Try to access videos on not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID) + "/videos", None)
        # Try to access videos on own request
        response = self.client.get(BASE_URL + str(self.request1.id) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_anonymous_cannot_get_videos(self):
        # Try to access videos on other user's requests
        self.assertUnauthorized(
            self.client.get(BASE_URL + str(self.request1.id) + "/videos")
        )
        self.assertUnauthorized(
            self.client.get(BASE_URL + str(self.request2.id) + "/videos")
        )
        self.assertUnauthorized(
            self.client.get(BASE_URL + str(self.request3.id) + "/videos")
        )
        # Try to access videos on not existing request
        self.assertUnauthorized(
            self.client.get(BASE_URL + str(NOT_EXISTING_ID) + "/videos")
        )

    """
    GET /api/v1/requests/:id/videos/:id
    """

    def test_admin_can_get_video_detail_only_related_to_own_requests(self):
        self.authorize_user(self.admin_user)
        # Try to access videos related to other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video2.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video3.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video4.id),
            None,
        )
        # Try to access videos related to other user's requests but on own request
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video3.id),
            None,
        )
        # Try to access videos related to own requests but on other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video5.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video6.id),
            None,
        )
        # Try to access not existing videos
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.video5.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to access own video
        response = self.client.get(
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video6.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video5.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if user can only see own rating
        self.assertEqual(len(response.data["ratings"]), 1)
        for rating in response.data["ratings"]:
            self.assertEqual(rating["author"]["username"], self.admin_user.username)

    def test_staff_can_get_video_detail_only_related_to_own_requests(self):
        self.authorize_user(self.staff_user)
        # Try to access videos related to other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video2.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video5.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video6.id),
            None,
        )
        # Try to access videos related to other user's requests but on own request
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video5.id),
            None,
        )
        # Try to access videos related to own requests but on other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video3.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video4.id),
            None,
        )
        # Try to access not existing videos
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.video3.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to access own video
        response = self.client.get(
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video4.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if user can only see own rating
        self.assertEqual(len(response.data["ratings"]), 1)
        for rating in response.data["ratings"]:
            self.assertEqual(rating["author"]["username"], self.staff_user.username)

    def test_user_can_get_video_detail_only_related_to_own_requests(self):
        self.authorize_user(self.normal_user)
        # Try to access videos related to other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video3.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video4.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video5.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video6.id),
            None,
        )
        # Try to access videos related to other user's requests but on own request
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video3.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video5.id),
            None,
        )
        # Try to access videos related to own requests but on other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/videos/" + str(self.video1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/videos/" + str(self.video2.id),
            None,
        )
        # Try to access not existing videos
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.video1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to access own video
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if user can only see own rating
        self.assertEqual(len(response.data["ratings"]), 1)
        for rating in response.data["ratings"]:
            self.assertEqual(rating["author"]["username"], self.normal_user.username)

    def test_anonymous_cannot_get_video_detail(self):
        # Try to access videos related to other user's requests
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request1.id) + "/videos/" + str(self.video2.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request2.id) + "/videos/" + str(self.video3.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request2.id) + "/videos/" + str(self.video4.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request3.id) + "/videos/" + str(self.video5.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request3.id) + "/videos/" + str(self.video6.id)
            )
        )
        # Try to access not existing videos
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.video1.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID)
            )
        )

    def test_user_can_get_video_url_after_certain_status(self):
        test_request = create_request(104, self.normal_user)
        test_video = create_video(307, test_request, Video.Statuses.PENDING)
        test_video.additional_data.update(
            {"publishing": {"website": "https://example.com"}}
        )
        test_video.save()

        # Login
        self.authorize_user(self.normal_user)

        # Check if it works for all statuses
        for stat in Video.Statuses:
            # Change status
            test_video.status = stat
            test_video.save()

            # Get video details and check if video_url is present as key
            response = self.client.get(
                BASE_URL + str(test_request.id) + "/videos/" + str(test_video.id)
            )
            self.assertIn("video_url", response.data)

            # If status is below 4 no url should be visible
            if stat >= Video.Statuses.PUBLISHED:
                self.assertEqual(response.data["video_url"], "https://example.com")
            else:
                self.assertIsNone(response.data["video_url"])

    """
    --------------------------------------------------
                         COMMENTS
    --------------------------------------------------
    """
    """
    GET /api/v1/requests/:id/comments
    """

    def test_admin_can_get_comments_only_related_to_own_requests_and_not_internal(self):
        self.authorize_user(self.admin_user)
        # Try to access videos on other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request1.id) + "/comments", None)
        self.assertNotFound("GET", BASE_URL + str(self.request2.id) + "/comments", None)
        # Try to access videos on not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID) + "/comments", None)
        # Try to access videos on own request
        response = self.client.get(BASE_URL + str(self.request3.id) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        # Sample comment is the following: Sample text - USERNAME (INTERNAL?)
        # No comment should contain True because that would be an internal comment
        for comment in response.data:
            self.assertNotIn("True", comment["text"])

    def test_staff_can_get_comments_only_related_to_own_requests_and_not_internal(self):
        self.authorize_user(self.staff_user)
        # Try to access videos on other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request1.id) + "/comments", None)
        self.assertNotFound("GET", BASE_URL + str(self.request3.id) + "/comments", None)
        # Try to access videos on not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID) + "/comments", None)
        # Try to access videos on own request
        response = self.client.get(BASE_URL + str(self.request2.id) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        # Sample comment is the following: Sample text - USERNAME (INTERNAL?)
        # No comment should contain True because that would be an internal comment
        for comment in response.data:
            self.assertNotIn("True", comment["text"])

    def test_user_can_get_comments_only_related_to_own_requests_and_not_internal(self):
        self.authorize_user(self.normal_user)
        # Try to access videos on other user's requests
        self.assertNotFound("GET", BASE_URL + str(self.request2.id) + "/comments", None)
        self.assertNotFound("GET", BASE_URL + str(self.request3.id) + "/comments", None)
        # Try to access videos on not existing request
        self.assertNotFound("GET", BASE_URL + str(NOT_EXISTING_ID) + "/comments", None)
        # Try to access videos on own request
        response = self.client.get(BASE_URL + str(self.request1.id) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        # Sample comment is the following: Sample text - USERNAME (INTERNAL?)
        # No comment should contain True because that would be an internal comment
        for comment in response.data:
            self.assertNotIn("True", comment["text"])

    def test_anonymous_cannot_get_comments(self):
        # Try to access videos on other user's requests
        self.assertUnauthorized(
            self.client.get(BASE_URL + str(self.request1.id) + "/comments")
        )
        self.assertUnauthorized(
            self.client.get(BASE_URL + str(self.request2.id) + "/comments")
        )
        self.assertUnauthorized(
            self.client.get(BASE_URL + str(self.request3.id) + "/comments")
        )
        # Try to access videos on not existing request
        self.assertUnauthorized(
            self.client.get(BASE_URL + str(NOT_EXISTING_ID) + "/comments")
        )

    """
    GET /api/v1/requests/:id/comments/:id
    """

    def test_admin_can_get_comment_detail_only_related_to_own_requests_and_not_internal(
        self,
    ):
        self.authorize_user(self.admin_user)
        # Try to access internal comments
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment12.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment13.id),
            None,
        )
        # Try to access comments related to other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        # Try to access comments related to other user's requests but on own request
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        # Try to access comments related to own requests but on other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment14.id),
            None,
        )
        # Try to access not existing comments
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment11.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to access comments related to own request
        response = self.client.get(
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment14.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment15.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_can_get_comment_detail_only_related_to_own_requests_and_not_internal(
        self,
    ):
        self.authorize_user(self.staff_user)
        # Try to access internal comments
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment7.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment8.id),
            None,
        )
        # Try to access comments related to other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        # Try to access comments related to other user's requests but on own request
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        # Try to access comments related to own requests but on other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment9.id),
            None,
        )
        # Try to access not existing comments
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment9.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to access comments related to own request
        response = self.client.get(
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment9.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment10.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_can_get_comment_detail_only_related_to_own_requests_and_not_internal(
        self,
    ):
        self.authorize_user(self.normal_user)
        # Try to access internal comments
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            None,
        )
        # Try to access comments related to other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        # Try to access comments related to other user's requests but on own request
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        # Try to access comments related to own requests but on other user's requests
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment4.id),
            None,
        )
        # Try to access not existing comments
        self.assertNotFound(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to access comments related to own request
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment4.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment5.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anonymous_cannot_get_comment_detail(self):
        # Try to access comments
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment7.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment12.id)
            )
        )
        # Try to access not existing comment
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment1.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID)
            )
        )

    """
    PATCH /api/v1/requests/:id/comments/:id
    PUT /api/v1/requests/:id/comments/:id
    """

    def modify_comment(self, request_id, comment_id):
        data_patch = {"text": "Patch modified text"}
        data_put = {"text": "Put modified text"}

        response = self.client.patch(
            BASE_URL + str(request_id) + "/comments/" + str(comment_id), data_patch
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = self.client.get(
            BASE_URL + str(request_id) + "/comments/" + str(comment_id)
        ).json()
        self.assertIn("Patch modified text", data["text"])

        response = self.client.put(
            BASE_URL + str(request_id) + "/comments/" + str(comment_id), data_put
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = self.client.get(
            BASE_URL + str(request_id) + "/comments/" + str(comment_id)
        ).json()
        self.assertIn("Put modified text", data["text"])

    def test_admin_can_modify_only_own_comments_on_own_request(self):
        self.authorize_user(self.admin_user)
        # Try to modify other user's comments
        self.assertForbidden(
            "PATCH",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        self.assertForbidden(
            "PUT",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment14.id),
            None,
        )
        # Try to modify internal comments
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment12.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment13.id),
            None,
        )
        # Try to modify own comments related to other user's requests
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment5.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment10.id),
            None,
        )
        # Try to modify comments related to other user's requests but on own request
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment5.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment10.id),
            None,
        )
        # Try to modify own comments but on other user's requests
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment15.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment15.id),
            None,
        )
        # Try to modify not existing comments
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request3.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment15.id),
            None,
        )
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to modify own comment
        self.modify_comment(self.request3.id, self.comment15.id)

    def test_staff_can_modify_only_own_comments_on_own_request(self):
        self.authorize_user(self.staff_user)
        # Try to modify other user's comments
        self.assertForbidden(
            "PATCH",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertForbidden(
            "PUT",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment10.id),
            None,
        )
        # Try to modify internal comments
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment7.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment8.id),
            None,
        )
        # Try to modify own comments related to other user's requests
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment4.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment14.id),
            None,
        )
        # Try to modify comments related to other user's requests but on own request
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment4.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment14.id),
            None,
        )
        # Try to modify own comments but on other user's requests
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment9.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment9.id),
            None,
        )
        # Try to modify not existing comments
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request2.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment9.id),
            None,
        )
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to modify own comment
        self.modify_comment(self.request2.id, self.comment9.id)

    def test_user_can_modify_only_own_comments_on_own_request(self):
        self.authorize_user(self.normal_user)
        # Try to modify other user's comments
        self.assertForbidden(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment4.id),
            None,
        )
        self.assertForbidden(
            "PUT",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment5.id),
            None,
        )
        # Try to modify internal comments
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            None,
        )
        # Try to modify own comments related to other user's requests
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        # Try to modify comments related to other user's requests but on own request
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        # Try to modify own comments but on other user's requests
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        # Try to modify not existing comments
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        # Try to modify own comment
        self.modify_comment(self.request1.id, self.comment1.id)

    def test_anonymous_cannot_modify_comment(self):
        # Try to modify comments
        self.assertUnauthorized(
            self.client.patch(
                BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
                None,
            )
        )
        self.assertUnauthorized(
            self.client.put(
                BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
                None,
            )
        )
        self.assertUnauthorized(
            self.client.patch(
                BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id),
                None,
            )
        )
        self.assertUnauthorized(
            self.client.put(
                BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment7.id),
                None,
            )
        )
        self.assertUnauthorized(
            self.client.patch(
                BASE_URL
                + str(self.request3.id)
                + "/comments/"
                + str(self.comment11.id),
                None,
            )
        )
        self.assertUnauthorized(
            self.client.put(
                BASE_URL
                + str(self.request3.id)
                + "/comments/"
                + str(self.comment12.id),
                None,
            )
        )
        # Try to modify not existing comments
        self.assertUnauthorized(
            self.client.patch(
                BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
                None,
            )
        )
        self.assertUnauthorized(
            self.client.put(
                BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment1.id),
                None,
            )
        )
        self.assertUnauthorized(
            self.client.patch(
                BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
                None,
            )
        )

    """
    POST /api/v1/requests/:id/comments
    DELETE /api/v1/requests/:id/comments/:id
    """

    def check_count_of_comments_on_request(self, request_id, count):
        response = self.client.get(BASE_URL + str(request_id) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), count)

    def test_admin_can_create_comments_only_on_own_request_and_delete_only_own_comment(
        self,
    ):
        data = {"text": "New comment"}
        self.authorize_user(self.admin_user)

        # Create comment on own request
        response = self.client.post(
            BASE_URL + str(self.request3.id) + "/comments", data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.admin_user.username)
        self.check_count_of_comments_on_request(self.request3.id, 4)

        # Delete own comment
        response = self.client.delete(
            BASE_URL + str(self.request3.id) + "/comments/" + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.check_count_of_comments_on_request(self.request3.id, 3)

        # Try to post comment to unrelated request
        self.assertNotFound(
            "POST", BASE_URL + str(self.request1.id) + "/comments", data
        )
        self.assertNotFound(
            "POST", BASE_URL + str(self.request2.id) + "/comments", data
        )
        # Try to post comment to not existing request
        self.assertNotFound("POST", BASE_URL + str(NOT_EXISTING_ID) + "/comments", data)

        # Try to delete other user's comments
        self.assertForbidden(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        self.assertForbidden(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment14.id),
            None,
        )
        # Try to delete internal comments
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment12.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment13.id),
            None,
        )
        # Try to delete own comments related to other user's requests
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment5.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment10.id),
            None,
        )
        # Try to delete comments related to other user's requests but on own request
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment5.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment10.id),
            None,
        )
        # Try to delete own comments but on other user's requests
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment15.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment15.id),
            None,
        )
        # Try to delete not existing comments
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment15.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )

    def test_staff_can_create_comments_only_on_own_request_and_delete_only_own_comment(
        self,
    ):
        data = {"text": "New comment"}
        self.authorize_user(self.staff_user)

        # Create comment on own request
        response = self.client.post(
            BASE_URL + str(self.request2.id) + "/comments", data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.staff_user.username)
        self.check_count_of_comments_on_request(self.request2.id, 4)

        # Delete own comment
        response = self.client.delete(
            BASE_URL + str(self.request2.id) + "/comments/" + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.check_count_of_comments_on_request(self.request2.id, 3)

        # Try to post comment to unrelated request
        self.assertNotFound(
            "POST", BASE_URL + str(self.request1.id) + "/comments", data
        )
        self.assertNotFound(
            "POST", BASE_URL + str(self.request3.id) + "/comments", data
        )
        # Try to post comment to not existing request
        self.assertNotFound("POST", BASE_URL + str(NOT_EXISTING_ID) + "/comments", data)

        # Try to delete other user's comments
        self.assertForbidden(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertForbidden(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment10.id),
            None,
        )
        # Try to delete internal comments
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment7.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment8.id),
            None,
        )
        # Try to delete own comments related to other user's requests
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment4.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment14.id),
            None,
        )
        # Try to delete comments related to other user's requests but on own request
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment4.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment14.id),
            None,
        )
        # Try to delete own comments but on other user's requests
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment9.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment9.id),
            None,
        )
        # Try to delete not existing comments
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment9.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )

    def test_user_can_create_comments_only_on_own_request_and_delete_only_own_comment(
        self,
    ):
        data = {"text": "New comment"}
        self.authorize_user(self.normal_user)

        # Create comment on own request
        response = self.client.post(
            BASE_URL + str(self.request1.id) + "/comments", data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.normal_user.username)
        self.check_count_of_comments_on_request(self.request1.id, 4)

        # Delete own comment
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.check_count_of_comments_on_request(self.request1.id, 3)

        # Try to post comment to unrelated request
        self.assertNotFound(
            "POST", BASE_URL + str(self.request2.id) + "/comments", data
        )
        self.assertNotFound(
            "POST", BASE_URL + str(self.request3.id) + "/comments", data
        )
        # Try to post comment to not existing request
        self.assertNotFound("POST", BASE_URL + str(NOT_EXISTING_ID) + "/comments", data)

        # Try to delete other user's comments
        self.assertForbidden(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment4.id),
            None,
        )
        self.assertForbidden(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment5.id),
            None,
        )
        # Try to delete internal comments
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            None,
        )
        # Try to delete own comments related to other user's requests
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        # Try to delete comments related to other user's requests but on own request
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment6.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment11.id),
            None,
        )
        # Try to delete own comments but on other user's requests
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment1.id),
            None,
        )
        # Try to delete not existing comments
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment1.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )

    def test_anonymous_cannot_create_or_delete_comment(self):
        data = {"text": "New comment"}

        # Try to post comment to any request
        self.assertUnauthorized(
            self.client.post(BASE_URL + str(self.request1.id) + "/comments", data)
        )
        self.assertUnauthorized(
            self.client.post(BASE_URL + str(self.request2.id) + "/comments", data)
        )
        self.assertUnauthorized(
            self.client.post(BASE_URL + str(self.request3.id) + "/comments", data)
        )
        # Try to post comment to not existing request
        self.assertUnauthorized(
            self.client.post(BASE_URL + str(NOT_EXISTING_ID) + "/comments", data)
        )

        # Try to delete comments
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
            )
        )
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
            )
        )
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment6.id)
            )
        )
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment7.id)
            )
        )
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment11.id)
            )
        )
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(self.request3.id) + "/comments/" + str(self.comment12.id)
            )
        )
        # Try to delete not existing comments
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID)
            )
        )
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment1.id)
            )
        )
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID)
            )
        )

    """
    --------------------------------------------------
                         RATINGS
    --------------------------------------------------
    """
    """
    GET /api/v1/requests/:id/videos/:id/ratings
    """

    def test_admin_can_get_ratings_only_on_own_requests_and_videos(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        for rating in response.data:
            self.assertEqual(rating["author"]["username"], self.admin_user.username)

        # Try to access ratings on other users requests and videos
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings",
            None,
        )

        # Try to access ratings on not existing requests and videos
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )

    def test_staff_can_get_ratings_only_on_own_requests_and_videos(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        for rating in response.data:
            self.assertEqual(rating["author"]["username"], self.staff_user.username)

        # Try to access ratings on other users requests and videos
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings",
            None,
        )

        # Try to access ratings on not existing requests and videos
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )

    def test_user_can_get_ratings_only_on_own_requests_and_videos(self):
        self.authorize_user(self.normal_user)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        for rating in response.data:
            self.assertEqual(rating["author"]["username"], self.normal_user.username)

        # Try to access ratings on other users requests and videos
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            None,
        )

        # Try to access ratings on not existing requests and videos
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )

    def test_anonymous_cannot_get_ratings(self):
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings"
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request2.id)
                + "/videos/"
                + str(self.video3.id)
                + "/ratings"
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request3.id)
                + "/videos/"
                + str(self.video5.id)
                + "/ratings"
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(NOT_EXISTING_ID)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings"
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(NOT_EXISTING_ID)
                + "/ratings"
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(NOT_EXISTING_ID)
                + "/videos/"
                + str(NOT_EXISTING_ID)
                + "/ratings"
            )
        )

    """
    GET /api/v1/requests/:id/videos/:id/ratings/:id
    """

    def test_admin_can_get_rating_detail(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Try to access other users ratings on own request
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating7.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating8.id),
            None,
        )

        # Try to access own rating on other users request
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating6.id),
            None,
        )

        # Try to access other users rating on other their requests
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating4.id),
            None,
        )

        # Try to access not existing rating
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

    def test_staff_can_get_rating_detail(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Try to access other users ratings on own request
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating4.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating6.id),
            None,
        )

        # Try to access own rating on other users request
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating5.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating8.id),
            None,
        )

        # Try to access other users rating on other their requests
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id),
            None,
        )

        # Try to access not existing rating
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

    def test_user_can_get_rating_detail(self):
        self.authorize_user(self.normal_user)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Try to access other users ratings on own request
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            None,
        )

        # Try to access own rating on other users request
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating4.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating7.id),
            None,
        )

        # Try to access other users rating on other their requests
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video2.id)
            + "/ratings/"
            + str(self.rating5.id),
            None,
        )
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id),
            None,
        )

        # Try to access not existing rating
        self.assertNotFound(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

    def test_anonymous_cannot_get_rating_detail(self):
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings/"
                + str(self.rating1.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request2.id)
                + "/videos/"
                + str(self.video3.id)
                + "/ratings/"
                + str(self.rating5.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request3.id)
                + "/videos/"
                + str(self.video5.id)
                + "/ratings/"
                + str(self.rating9.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(NOT_EXISTING_ID)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings/"
                + str(self.rating1.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(NOT_EXISTING_ID)
                + "/ratings/"
                + str(self.rating1.id)
            )
        )
        self.assertUnauthorized(
            self.client.get(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings/"
                + str(NOT_EXISTING_ID)
            )
        )

    """
    POST /api/v1/admin/requests/:id/videos/:id/ratings
    DELETE /api/v1/admin/requests/:id/videos/:id/ratings/:id
    """

    def create_rating(self, request_id, video_id):
        data = {"rating": 5, "review": "Great video"}
        return self.client.post(
            BASE_URL + str(request_id) + "/videos/" + str(video_id) + "/ratings", data
        )

    def test_admin_can_create_only_one_rating_to_own_video_and_delete_only_own_rating(
        self,
    ):
        self.authorize_user(self.admin_user)
        response = self.create_rating(self.request3.id, self.video6.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.admin_user.username)

        response = self.client.delete(
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video6.id)
            + "/ratings/"
            + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.create_rating(self.request3.id, self.video5.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[0], "You have already posted a rating to this video."
        )

        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video4.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video6.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            {"rating": 5},
        )

        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating6.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id),
            None,
        )

        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating9.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

    def test_staff_can_create_only_one_rating_to_own_video_and_delete_only_own_rating(
        self,
    ):
        self.authorize_user(self.staff_user)
        response = self.create_rating(self.request2.id, self.video4.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.staff_user.username)

        response = self.client.delete(
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video4.id)
            + "/ratings/"
            + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.create_rating(self.request2.id, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[0], "You have already posted a rating to this video."
        )

        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video6.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video4.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            {"rating": 5},
        )

        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating8.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id),
            None,
        )

        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating5.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

    def test_user_can_create_only_one_rating_to_own_video_and_delete_only_own_rating(
        self,
    ):
        self.authorize_user(self.normal_user)
        response = self.create_rating(self.request1.id, self.video2.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.normal_user.username)

        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video2.id)
            + "/ratings/"
            + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.create_rating(self.request1.id, self.video1.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data[0], "You have already posted a rating to this video."
        )

        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video4.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video6.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video2.id)
            + "/ratings",
            {"rating": 5},
        )
        self.assertNotFound(
            "POST",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            {"rating": 5},
        )

        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating4.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating7.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id),
            None,
        )

        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.assertNotFound(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

    def test_anonymous_cannot_create_and_delete_rating(self):
        data = {"rating": 5, "review": "Great video"}

        self.assertUnauthorized(
            self.client.post(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings",
                data,
            )
        )
        self.assertUnauthorized(
            self.client.post(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(self.video2.id)
                + "/ratings",
                data,
            )
        )
        self.assertUnauthorized(
            self.client.post(
                BASE_URL
                + str(NOT_EXISTING_ID)
                + "/videos/"
                + str(self.video2.id)
                + "/ratings",
                data,
            )
        )
        self.assertUnauthorized(
            self.client.post(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(NOT_EXISTING_ID)
                + "/ratings",
                data,
            )
        )
        self.assertUnauthorized(
            self.client.post(
                BASE_URL
                + str(NOT_EXISTING_ID)
                + "/videos/"
                + str(NOT_EXISTING_ID)
                + "/ratings",
                data,
            )
        )

        self.assertUnauthorized(
            self.client.delete(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings/"
                + str(self.rating1.id)
            )
        )
        self.assertUnauthorized(
            self.client.delete(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings/"
                + str(NOT_EXISTING_ID)
            )
        )

    def test_user_cannot_rate_video_before_certain_status(self):
        unfinished_video = create_video(307, self.request1, Video.Statuses.EDITED)
        self.authorize_user(self.normal_user)
        response = self.create_rating(self.request1.id, unfinished_video.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "The video has not been published yet.")

    """
    PUT, PATCH /api/v1/requests/:id/ratings/:id
    """

    def test_admin_can_modify_only_own_rating(self):
        self.authorize_user(self.admin_user)
        data_patch = {"review": "Modified by admin"}
        data_put = {"review": "Modified by admin (PUT)", "rating": 5}
        # Try to modify own rating on own request/video
        response = self.client.patch(
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id),
            data_patch,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if modify was successful
        response = self.client.get(
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id)
        ).json()
        self.assertIn("Modified by admin", response["review"])

        # Try to modify other users rating on own request/video
        self.assertNotFound(
            "PATCH",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating7.id),
            data_patch,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating8.id),
            data_put,
        )
        # Try to modify other users rating on his request/video
        self.assertNotFound(
            "PATCH",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id),
            data_put,
        )

        # Try to modify own rating on own request/video
        response = self.client.put(
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id),
            data_put,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if modify was successful
        response = self.client.get(
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video5.id)
            + "/ratings/"
            + str(self.rating9.id)
        ).json()
        self.assertIn("Modified by admin (PUT)", response["review"])

    def test_staff_can_modify_only_own_rating(self):
        self.authorize_user(self.staff_user)
        data_patch = {"review": "Modified by staff"}
        data_put = {"review": "Modified by staff (PUT)", "rating": 5}
        # Try to modify own rating on own request/video
        response = self.client.patch(
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id),
            data_patch,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if modify was successful
        response = self.client.get(
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id)
        ).json()
        self.assertIn("Modified by staff", response["review"])

        # Try to modify other users rating on own request/video
        self.assertNotFound(
            "PATCH",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating4.id),
            data_patch,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating6.id),
            data_put,
        )
        # Try to modify other users rating on his request/video
        self.assertNotFound(
            "PATCH",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video6.id)
            + "/ratings/"
            + str(self.rating9.id),
            data_put,
        )

        # Try to modify own rating on own request/video
        response = self.client.put(
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id),
            data_put,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if modify was successful
        response = self.client.get(
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id)
        ).json()
        self.assertIn("Modified by staff (PUT)", response["review"])

    def test_user_can_modify_only_own_rating(self):
        self.authorize_user(self.normal_user)
        data_patch = {"review": "Modified by user"}
        data_put = {"review": "Modified by user (PUT)", "rating": 5}
        # Try to modify own rating on own request/video
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if modify was successful
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        ).json()
        self.assertIn("Modified by user", response["review"])

        # Try to modify other users rating on own request/video
        self.assertNotFound(
            "PATCH",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data_patch,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data_put,
        )
        # Try to modify other users rating on his request/video
        self.assertNotFound(
            "PATCH",
            BASE_URL
            + str(self.request2.id)
            + "/videos/"
            + str(self.video3.id)
            + "/ratings/"
            + str(self.rating5.id),
            data_patch,
        )
        self.assertNotFound(
            "PUT",
            BASE_URL
            + str(self.request3.id)
            + "/videos/"
            + str(self.video6.id)
            + "/ratings/"
            + str(self.rating9.id),
            data_put,
        )

        # Try to modify own rating on own request/video
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data_put,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if modify was successful
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        ).json()
        self.assertIn("Modified by user (PUT)", response["review"])

    def test_anonymous_cannot_modify_ratings(self):
        self.assertUnauthorized(
            self.client.patch(
                BASE_URL
                + str(self.request1.id)
                + "/videos/"
                + str(self.video1.id)
                + "/ratings/"
                + str(self.rating1.id),
                {"review": "Modified"},
            )
        )
        self.assertUnauthorized(
            self.client.patch(
                BASE_URL
                + str(self.request2.id)
                + "/videos/"
                + str(self.video3.id)
                + "/ratings/"
                + str(self.rating5.id),
                {"review": "Modified"},
            )
        )
        self.assertUnauthorized(
            self.client.put(
                BASE_URL
                + str(self.request3.id)
                + "/videos/"
                + str(self.video6.id)
                + "/ratings/"
                + str(self.rating9.id),
                {"review": "Modified"},
            )
        )
        self.assertUnauthorized(
            self.client.put(
                BASE_URL
                + str(self.request2.id)
                + "/videos/"
                + str(self.video3.id)
                + "/ratings/"
                + str(NOT_EXISTING_ID),
                {"review": "Modified"},
            )
        )

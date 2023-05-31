from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from tests.helpers.users_test_utils import create_user, get_default_password
from tests.helpers.video_requests_test_utils import (
    create_comment,
    create_crew,
    create_rating,
    create_request,
    create_video,
)

BASE_URL = "/api/v1/admin/requests/"
NOT_EXISTING_ID = 9000


class RequestsAPIAdminTestCase(APITestCase):
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

        # Create 2 sample Request objects
        # Request 2 is used to delete the comments from
        self.request1 = create_request(101, self.normal_user)
        self.request2 = create_request(102, self.admin_user)

        # Create 2 sample CrewMember objects
        self.crew1 = create_crew(301, self.request1, self.staff_user, "Cameraman")
        self.crew1 = create_crew(302, self.request1, self.admin_user, "Reporter")

        # Create 3 sample Video objects
        # Video 1 has ratings from all users
        # Video 2 is used to delete the ratings from
        # Video 3 has no ratings (used to post ratings to)
        self.video1 = create_video(501, self.request1)
        self.video2 = create_video(502, self.request1)
        self.video3 = create_video(503, self.request1)

        # Create 5 sample Comment objects with different authors
        # Comment 4 & 5 are used to test comment delete and related to Request 2
        self.comment1 = create_comment(701, self.request1, self.normal_user, False)
        self.comment2 = create_comment(702, self.request1, self.staff_user, True)
        self.comment3 = create_comment(703, self.request1, self.admin_user, False)
        self.comment4 = create_comment(704, self.request2, self.staff_user, True)
        self.comment5 = create_comment(705, self.request2, self.staff_user, False)

        # Create 5 sample Rating objects with different authors
        # Rating 4 & 5 are used to test comment delete and related to Video 2
        self.rating1 = create_rating(901, self.video1, self.normal_user)
        self.rating2 = create_rating(902, self.video1, self.staff_user)
        self.rating3 = create_rating(903, self.video1, self.admin_user)
        self.rating4 = create_rating(904, self.video2, self.staff_user)
        self.rating5 = create_rating(905, self.video2, self.staff_user)

    def should_not_found(self, method, uri, data):
        if method == "GET":
            response = self.client.get(uri)
        elif method == "PATCH":
            response = self.client.put(uri, data)
        elif method == "PUT":
            response = self.client.patch(uri, data)
        elif method == "DELETE":
            response = self.client.delete(uri)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def access_history(self, uri):
        response = self.client.get(uri + "/history")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    """
    --------------------------------------------------
                         VIDEOS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/videos
    """

    def test_admin_can_get_videos(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(BASE_URL + "videos")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)

    def test_staff_can_get_videos(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(BASE_URL + "videos")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)

    def test_user_should_not_get_videos(self):
        self.authorize_user(self.normal_user)
        response = self.client.get(BASE_URL + "videos")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_videos(self):
        response = self.client.get(BASE_URL + "videos")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

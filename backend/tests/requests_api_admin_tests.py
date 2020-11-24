from datetime import timedelta

from django.utils.timezone import localtime
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
from video_requests.models import Video

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
                         REQUESTS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests
    """

    def test_admin_can_get_requests(self):
        self.authorize_user(self.admin_user)
        response = self.client.get("/api/v1/admin/requests")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_staff_can_get_requests(self):
        self.authorize_user(self.staff_user)
        response = self.client.get("/api/v1/admin/requests")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_user_should_not_get_requests(self):
        self.authorize_user(self.normal_user)
        response = self.client.get("/api/v1/admin/requests")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_requests(self):
        response = self.client.get("/api/v1/admin/requests")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    """
    GET /api/v1/admin/requests/:id
    """

    def test_admin_can_get_request_detail(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(BASE_URL + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_history(BASE_URL + str(self.request1.id))

    def test_staff_can_get_request_detail(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(BASE_URL + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_history(BASE_URL + str(self.request1.id))

    def test_user_should_not_get_request_detail(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.client.get(BASE_URL + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(BASE_URL + str(NOT_EXISTING_ID))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_request_detail(self):
        # Test error for existing object
        response = self.client.get(BASE_URL + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(BASE_URL + str(NOT_EXISTING_ID))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_not_existing_request_detail(self):
        self.authorize_user(self.admin_user)
        self.should_not_found("GET", BASE_URL + str(NOT_EXISTING_ID), None)

        self.authorize_user(self.staff_user)
        self.should_not_found("GET", BASE_URL + str(NOT_EXISTING_ID), None)

    """
    PUT, PATCH /api/v1/admin/requests/:id
    """

    def modify_request(self):
        data = {"responsible_id": self.staff_user.id}
        response = self.client.patch(BASE_URL + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(BASE_URL + str(self.request1.id)).json()
        self.assertEqual(data["responsible"]["username"], self.staff_user.username)

        data["place"] = "Test place - Modified"
        response = self.client.put(BASE_URL + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(BASE_URL + str(self.request1.id)).json()
        self.assertIn("Modified", data["place"])

    def test_admin_can_modify_requests(self):
        self.authorize_user(self.admin_user)
        self.modify_request()

    def test_staff_can_modify_requests(self):
        self.authorize_user(self.staff_user)
        self.modify_request()

    def test_user_should_not_modify_requests(self):
        self.authorize_user(self.normal_user)
        data = {"title": "Test Request - Modified"}
        # Test error for existing object
        response = self.client.patch(BASE_URL + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(BASE_URL + str(NOT_EXISTING_ID), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {
            "title": "Test Request",
            "start_datetime": "2020-03-05T10:30:00+01:00",
            "end_datetime": "2020-03-06T10:30:00+01:00",
            "place": "Test place - Modified",
            "type": "Test type",
        }
        # Test error for existing object
        response = self.client.put(BASE_URL + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.put(BASE_URL + str(NOT_EXISTING_ID), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_modify_requests(self):
        data = {"title": "Test Request - Modified"}
        # Test error for existing object
        response = self.client.patch(BASE_URL + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(BASE_URL + str(NOT_EXISTING_ID), data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        data = {
            "title": "Test Request",
            "start_datetime": "2020-03-05T10:30:00+01:00",
            "end_datetime": "2020-03-06T10:30:00+01:00",
            "place": "Test place - Modified",
            "type": "Test type",
        }
        # Test error for existing object
        response = self.client.put(BASE_URL + str(self.request1.id), data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.put(BASE_URL + str(NOT_EXISTING_ID), data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_modifying_not_existing_request(self):
        data_patch = {"title": "Test Request - Modified"}
        data_put = {
            "title": "Test Request",
            "start_datetime": "2020-03-05T10:30:00+01:00",
            "end_datetime": "2020-03-06T10:30:00+01:00",
            "place": "Test place - Modified",
            "type": "Test type",
        }
        self.authorize_user(self.admin_user)
        self.should_not_found("PATCH", BASE_URL + str(NOT_EXISTING_ID), data_patch)
        self.should_not_found("PUT", BASE_URL + str(NOT_EXISTING_ID), data_put)

        self.authorize_user(self.staff_user)
        self.should_not_found("PATCH", BASE_URL + str(NOT_EXISTING_ID), data_patch)
        self.should_not_found("PUT", BASE_URL + str(NOT_EXISTING_ID), data_put)

    def test_request_add_modify_remove_responsible(self):
        request = create_request(103, self.normal_user)
        self.authorize_user(self.admin_user)

        response = self.client.get(f"{BASE_URL}{request.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("responsible", response.data)
        self.assertIsNone(response.data["responsible"])

        response = self.client.patch(
            f"{BASE_URL}{request.id}", {"responsible_id": NOT_EXISTING_ID}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["responsible_id"], "Not found user with the provided ID."
        )

        response = self.client.patch(
            f"{BASE_URL}{request.id}", {"responsible_id": self.staff_user.id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("responsible", response.data)
        self.assertEqual(
            response.data["responsible"]["username"], self.staff_user.username
        )

        response = self.client.patch(
            f"{BASE_URL}{request.id}", {"responsible_id": None}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("responsible", response.data)
        self.assertIsNone(response.data["responsible"])

    """
    POST /api/v1/admin/requests
    DELETE /api/v1/admin/requests/:id
    """

    def create_request(self):
        data = {
            "title": "Test Request",
            "start_datetime": "2020-03-05T10:30:00+01:00",
            "end_datetime": "2020-03-06T10:30:00+01:00",
            "place": "Test place",
            "type": "Test type",
            "responsible_id": self.admin_user.id,
        }
        return self.client.post("/api/v1/admin/requests", data)

    def test_admin_can_create_and_delete_requests(self):
        self.authorize_user(self.admin_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.admin_user.username
        )
        self.assertEqual(
            response.data["responsible"]["username"], self.admin_user.username
        )

        response = self.client.delete(BASE_URL + str(response.data["id"]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_create_and_delete_requests(self):
        self.authorize_user(self.staff_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.staff_user.username
        )
        self.assertEqual(
            response.data["responsible"]["username"], self.admin_user.username
        )

        response = self.client.delete(BASE_URL + str(response.data["id"]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_create_or_delete_requests(self):
        self.authorize_user(self.normal_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for existing object
        response = self.client.delete(BASE_URL + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.delete(BASE_URL + str(NOT_EXISTING_ID))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_create_or_delete_requests(self):
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for existing object
        response = self.client.delete(BASE_URL + str(self.request1.id))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.delete(BASE_URL + str(NOT_EXISTING_ID))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_deleting_not_existing_request(self):
        self.authorize_user(self.admin_user)
        self.should_not_found("DELETE", BASE_URL + str(NOT_EXISTING_ID), None)

        self.authorize_user(self.staff_user)
        self.should_not_found("DELETE", BASE_URL + str(NOT_EXISTING_ID), None)

    def test_adding_initial_comment_to_request(self):
        self.authorize_user(self.admin_user)
        data = {
            "title": "Test Request",
            "start_datetime": "2020-03-05T10:30:00+01:00",
            "end_datetime": "2020-03-06T10:30:00+01:00",
            "place": "Test place",
            "type": "Test type",
            "comment_text": "Test comment",
        }
        response = self.client.post("/api/v1/admin/requests", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["comments"][0]["author"]["username"], self.admin_user.username
        )
        self.assertEqual(response.data["comments"][0]["text"], "Test comment")

    @staticmethod
    def get_test_data():
        return {
            "title": "Test Request",
            "start_datetime": localtime(),
            "end_datetime": localtime() + timedelta(hours=4),
            "place": "Test place",
            "type": "Test type",
        }

    def test_request_date_relation_validation(self):
        self.authorize_user(self.admin_user)
        url = "/api/v1/admin/requests"

        data = self.get_test_data()
        data["end_datetime"] = data["start_datetime"] - timedelta(hours=2)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["non_field_errors"][0], "Start time must be earlier than end."
        )

        data = self.get_test_data()
        data["deadline"] = data["end_datetime"].date()
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["non_field_errors"][0],
            "Deadline must be later than end of the event.",
        )

        data = self.get_test_data()
        data["deadline"] = data["end_datetime"].date() + timedelta(days=1)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["deadline"], str(data["deadline"]))

    """
    --------------------------------------------------
                         COMMENTS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/:id/comments
    """

    def test_admin_can_get_comments(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(BASE_URL + str(self.request1.id) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_staff_can_get_comments(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(BASE_URL + str(self.request1.id) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_user_should_not_get_comments(self):
        self.authorize_user(self.normal_user)
        # Test error for existing object
        response = self.client.get(BASE_URL + str(self.request1.id) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(BASE_URL + str(NOT_EXISTING_ID) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_comments(self):
        # Test error for existing object
        response = self.client.get(BASE_URL + str(self.request1.id) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(BASE_URL + str(NOT_EXISTING_ID) + "/comments")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_comments_on_not_existing_request(self):
        self.authorize_user(self.admin_user)
        self.should_not_found(
            "GET", BASE_URL + str(NOT_EXISTING_ID) + "/comments", None
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "GET", BASE_URL + str(NOT_EXISTING_ID) + "/comments", None
        )

    """
    GET /api/v1/admin/requests/:id/comments/:id
    """

    def test_admin_can_get_comment_detail(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_history(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )

    def test_staff_can_get_comment_detail(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_history(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )

    def test_user_should_not_get_comment_detail(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_comment_detail(self):
        # Test error for existing object
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_comment_detail_on_not_existing_request_or_comment(
        self,
    ):
        self.authorize_user(self.admin_user)
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )

    """
    PUT, PATCH /api/v1/admin/requests/:id/comments/:id
    """

    def test_admin_can_modify_any_comments(self):
        self.authorize_user(self.admin_user)
        data = {"text": "Modified by admin"}
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        ).json()
        self.assertIn("Modified by admin", data["text"])
        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        ).json()
        self.assertIn("Modified by admin", data["text"])
        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        ).json()
        self.assertIn("Modified by admin", data["text"])

        data["text"] = "Modified by admin (PUT)"
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        ).json()
        self.assertIn("Modified by admin (PUT)", data["text"])
        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        ).json()
        self.assertIn("Modified by admin (PUT)", data["text"])
        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        ).json()
        self.assertIn("Modified by admin (PUT)", data["text"])

    def test_staff_can_modify_only_own_comments(self):
        self.authorize_user(self.staff_user)
        data = {"text": "Modified by staff"}
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        ).json()
        self.assertIn("Modified by staff", data["text"])

        data["text"] = "Modified by staff (PUT)"
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        ).json()
        self.assertIn("Modified by staff (PUT)", data["text"])

    def test_user_should_not_modify_comments(self):
        self.authorize_user(self.normal_user)
        data = {"text": "Modified by user"}

        # Test error for existing object
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {"text": "Modified by user", "internal": True}

        # Test error for existing object
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_modify_comments(self):
        data = {"text": "Modified by anonymous"}
        # Test error for existing object
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for existing object
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_modifying_comment_on_not_existing_request_or_comment(
        self,
    ):
        data_patch = {"text": "Modified"}
        data_put = {"text": "Modified", "internal": True}

        self.authorize_user(self.admin_user)
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            data_put,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            data_put,
        )

    """
    POST /api/v1/admin/requests/:id/comments
    """

    def create_comment(self, request_id):
        data = {"text": "New Comment", "internal": True}
        return self.client.post(BASE_URL + str(request_id) + "/comments", data)

    def test_admin_can_create_comments(self):
        self.authorize_user(self.admin_user)
        response = self.create_comment(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.admin_user.username)
        self.assertEqual(response.data["internal"], True)

    def test_staff_can_create_comment(self):
        self.authorize_user(self.staff_user)
        response = self.create_comment(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.staff_user.username)
        self.assertEqual(response.data["internal"], True)

    def test_user_should_not_create_comments(self):
        self.authorize_user(self.normal_user)
        response = self.create_comment(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.create_comment(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_create_comments(self):
        response = self.create_comment(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.create_comment(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_posting_comment_on_not_existing_request(self):
        self.authorize_user(self.admin_user)
        response = self.create_comment(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.authorize_user(self.staff_user)
        response = self.create_comment(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    """
    DELETE /api/v1/admin/requests/:id/comments/:id
    """

    def test_admin_can_delete_any_comments(self):
        self.authorize_user(self.admin_user)
        # Try to delete one comment created by staff user
        response = self.client.delete(
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment5.id)
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_delete_only_own_comments(self):
        self.authorize_user(self.staff_user)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request2.id) + "/comments/" + str(self.comment4.id)
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_delete_comments(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_delete_comments(self):
        # Test error for existing object
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_deleting_comment_on_not_existing_request_or_comment(
        self,
    ):
        self.authorize_user(self.admin_user)
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(self.comment3.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/comments/" + str(NOT_EXISTING_ID),
            None,
        )

    """
    --------------------------------------------------
                           CREW
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/:id/crew
    """

    def test_admin_can_get_crew(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(BASE_URL + str(self.request1.id) + "/crew")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_staff_can_get_crew(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(BASE_URL + str(self.request1.id) + "/crew")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_user_should_not_get_crew(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.client.get(BASE_URL + str(self.request1.id) + "/crew")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(BASE_URL + str(NOT_EXISTING_ID) + "/crew")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_crew(self):
        # Test error for existing object
        response = self.client.get(BASE_URL + str(self.request1.id) + "/crew")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(BASE_URL + str(NOT_EXISTING_ID) + "/crew")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_crew_on_not_existing_request(self):
        self.authorize_user(self.admin_user)
        self.should_not_found("GET", BASE_URL + str(NOT_EXISTING_ID) + "/crew", None)

        self.authorize_user(self.staff_user)
        self.should_not_found("GET", BASE_URL + str(NOT_EXISTING_ID) + "/crew", None)

    """
    GET /api/v1/admin/requests/:id/crew/:id
    """

    def test_admin_can_get_crew_detail(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_staff_can_get_crew_detail(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_user_should_not_get_crew_detail(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_crew_detail(self):
        # Test error for existing object
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_crew_detail_on_not_existing_request_or_crew(
        self,
    ):
        self.authorize_user(self.admin_user)
        self.should_not_found(
            "GET",
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET", BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id), None
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID),
            None,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "GET",
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET", BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id), None
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID),
            None,
        )

    """
    PUT, PATCH /api/v1/admin/requests/:id/crew/:id
    """

    def modify_crew(self):
        data = {"position": "Modified position", "member_id": self.admin_user.id}
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["member"]["username"], self.admin_user.username)

        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id)
        ).json()
        self.assertIn("Modified", data["position"])

        data["position"] = "PUT Modified"
        data.update(member_id=data["member"]["id"])
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id)
        ).json()
        self.assertIn("PUT Modified", data["position"])

    def test_admin_can_modify_crew(self):
        self.authorize_user(self.admin_user)
        self.modify_crew()

    def test_staff_can_modify_crew(self):
        self.authorize_user(self.staff_user)
        self.modify_crew()

    def test_user_should_not_modify_crew(self):
        self.authorize_user(self.normal_user)
        data = {"position": "Modified position"}
        # Test error for existing object
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {"position": "new position", "member_id": self.admin_user.id}
        # Test error for existing object
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_modify_crew(self):
        data = {"position": "Modified position"}
        # Test error for existing object
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        data = {"position": "new position", "member_id": self.admin_user.id}
        # Test error for existing object
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_modifying_crew_on_not_existing_request_or_crew(
        self,
    ):
        data_patch = {"position": "Modified position"}
        data_put = {"position": "new position", "member_id": self.admin_user.id}

        self.authorize_user(self.admin_user)
        self.should_not_found(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID),
            data_put,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID),
            data_put,
        )

    def test_crew_add_modify_remove_member(self):
        request = create_request(103, self.normal_user)
        crew_member = create_crew(303, request, self.admin_user, "Test")
        self.authorize_user(self.admin_user)

        response = self.client.get(f"{BASE_URL}{request.id}/crew/{crew_member.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("member", response.data)
        self.assertEqual(response.data["member"]["username"], self.admin_user.username)

        response = self.client.patch(
            f"{BASE_URL}{request.id}/crew/{crew_member.id}",
            {"member_id": NOT_EXISTING_ID},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["member_id"], "Not found user with the provided ID."
        )

        response = self.client.patch(
            f"{BASE_URL}{request.id}/crew/{crew_member.id}",
            {"member_id": self.staff_user.id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("member", response.data)
        self.assertEqual(response.data["member"]["username"], self.staff_user.username)

        response = self.client.patch(
            f"{BASE_URL}{request.id}/crew/{crew_member.id}", {"member_id": None}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["member_id"][0], "This field may not be null.")

    """
    POST /api/v1/admin/requests/:id/crew
    DELETE /api/v1/admin/requests/:id/crew/:id
    """

    def create_crew(self, request_id):
        data = {"member_id": self.admin_user.id, "position": "new position"}
        return self.client.post(BASE_URL + str(request_id) + "/crew", data)

    def test_admin_can_create_and_delete_crew(self):
        self.authorize_user(self.admin_user)
        response = self.create_crew(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/crew/" + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_create_and_delete_crew(self):
        self.authorize_user(self.staff_user)
        response = self.create_crew(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/crew/" + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_create_or_delete_crew(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.create_crew(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.create_crew(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_create_or_delete_crew(self):
        # Test error for existing object
        response = self.create_crew(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.create_crew(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_posting_and_deleting_crew_on_not_existing_request_or_crew(
        self,
    ):
        self.authorize_user(self.admin_user)
        response = self.create_crew(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.should_not_found(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID),
            None,
        )

        self.authorize_user(self.staff_user)
        response = self.create_crew(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.should_not_found(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/crew/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(self.crew1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/crew/" + str(NOT_EXISTING_ID),
            None,
        )

    """
    --------------------------------------------------
                          VIDEOS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/:id/videos
    """

    def test_admin_can_get_videos_on_request(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(BASE_URL + str(self.request1.id) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_staff_can_get_videos_on_request(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(BASE_URL + str(self.request1.id) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_user_should_not_get_videos_on_request(self):
        self.authorize_user(self.normal_user)
        # Test error for existing object
        response = self.client.get(BASE_URL + str(self.request1.id) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(BASE_URL + str(NOT_EXISTING_ID) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_videos_on_request(self):
        # Test error for existing object
        response = self.client.get(BASE_URL + str(self.request1.id) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(BASE_URL + str(NOT_EXISTING_ID) + "/videos")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_videos_on_not_existing_request(self):
        self.authorize_user(self.admin_user)
        self.should_not_found("GET", BASE_URL + str(NOT_EXISTING_ID) + "/videos", None)

        self.authorize_user(self.staff_user)
        self.should_not_found("GET", BASE_URL + str(NOT_EXISTING_ID) + "/videos", None)

    """
    GET /api/v1/admin/requests/:id/videos/:id
    """

    def test_admin_can_get_video_detail(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_history(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id)
        )

    def test_staff_can_get_video_detail(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_history(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id)
        )

    def test_user_should_not_get_video_detail(self):
        self.authorize_user(self.normal_user)
        # Test error for existing object
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_video_detail(self):
        # Test error for existing object
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_video_detail_on_not_existing_request_or_video(
        self,
    ):
        self.authorize_user(self.admin_user)
        self.should_not_found(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "GET",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )

    """
    PUT, PATCH /api/v1/admin/requests/:id/videos/:id
    """

    def modify_video(self):
        data = {"editor_id": self.staff_user.id}
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id)
        ).json()
        self.assertEqual(data["editor"]["username"], self.staff_user.username)

        data["title"] = data["title"] + " - Modified"
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.video1.id)
        ).json()
        self.assertIn("Modified", data["title"])

    def test_admin_can_modify_video(self):
        self.authorize_user(self.admin_user)
        self.modify_video()

    def test_staff_can_modify_video(self):
        self.authorize_user(self.staff_user)
        self.modify_video()

    def test_user_should_not_modify_video(self):
        self.authorize_user(self.normal_user)
        data = {"editor_id": self.staff_user.id}
        # Test error for existing object
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {"title": "Modified title", "editor_id": self.staff_user.id}
        # Test error for existing object
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_modify_video(self):
        data = {"editor_id": self.staff_user.id}
        # Test error for existing object
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        data = {"title": "Modified title", "editor_id": self.staff_user.id}
        # Test error for existing object
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.put(
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID), data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_modifying_video_on_not_existing_request_or_video(
        self,
    ):
        data_patch = {"editor_id": self.staff_user.id}
        data_put = {"title": "Modified title", "editor_id": self.staff_user.id}

        self.authorize_user(self.admin_user)
        self.should_not_found(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            data_put,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "PATCH",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            data_put,
        )

    def test_video_add_modify_remove_editor(self):
        request = create_request(103, self.normal_user)
        video = create_video(504, request)
        self.authorize_user(self.admin_user)

        response = self.client.get(f"{BASE_URL}{request.id}/videos/{video.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("editor", response.data)
        self.assertIsNone(response.data["editor"])

        response = self.client.patch(
            f"{BASE_URL}{request.id}/videos/{video.id}", {"editor_id": NOT_EXISTING_ID}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["editor_id"], "Not found user with the provided ID."
        )

        response = self.client.patch(
            f"{BASE_URL}{request.id}/videos/{video.id}",
            {"editor_id": self.staff_user.id},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("editor", response.data)
        self.assertEqual(response.data["editor"]["username"], self.staff_user.username)

        response = self.client.patch(
            f"{BASE_URL}{request.id}/videos/{video.id}", {"editor_id": None}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("editor", response.data)
        self.assertIsNone(response.data["editor"])

    """
    POST /api/v1/admin/requests/:id/videos
    DELETE /api/v1/admin/requests/:id/videos/:id
    """

    def create_video(self, request_id):
        data = {"title": "New video", "editor_id": self.admin_user.id}
        return self.client.post(BASE_URL + str(request_id) + "/videos", data)

    def test_admin_can_create_and_delete_videos(self):
        self.authorize_user(self.admin_user)
        response = self.create_video(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["editor"]["username"], self.admin_user.username)

        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/videos/" + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_create_and_delete_videos(self):
        self.authorize_user(self.staff_user)
        response = self.create_video(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["editor"]["username"], self.admin_user.username)

        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/videos/" + str(response.data["id"])
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_create_or_delete_videos(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.create_video(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.create_video(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_create_or_delete_videos(self):
        # Test error for existing object
        response = self.create_video(self.request1.id)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/videos/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.create_video(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_posting_and_deleting_video_on_not_existing_request_or_video(
        self,
    ):
        self.authorize_user(self.admin_user)
        response = self.create_video(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.should_not_found(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )

        self.authorize_user(self.staff_user)
        response = self.create_video(NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.should_not_found(
            "DELETE",
            BASE_URL + str(self.request1.id) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(self.crew1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL + str(NOT_EXISTING_ID) + "/videos/" + str(NOT_EXISTING_ID),
            None,
        )

    """
    --------------------------------------------------
                         RATINGS
    --------------------------------------------------
    """
    """
    GET /api/v1/admin/requests/:id/videos/:id/ratings
    """

    def test_admin_can_get_ratings(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_staff_can_get_ratings(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_user_should_not_get_ratings(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_ratings(self):
        # Test error for existing object
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_ratings_on_not_existing_request_or_video(
        self,
    ):
        self.authorize_user(self.admin_user)
        self.should_not_found(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings",
            None,
        )

    """
    GET /api/v1/admin/requests/:id/videos/:id/ratings/:id
    """

    def test_admin_can_get_rating_detail(self):
        self.authorize_user(self.admin_user)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_history(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )

    def test_staff_can_get_rating_detail(self):
        self.authorize_user(self.staff_user)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.access_history(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )

    def test_user_should_not_get_rating_detail(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_rating_detail(self):
        # Test error for existing object
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_getting_rating_detail_on_not_existing_request_video_or_rating(
        self,
    ):
        self.authorize_user(self.admin_user)
        self.should_not_found(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "GET",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

    """
    POST /api/v1/admin/requests/:id/videos/:id/ratings
    """

    def create_rating(self, request_id, video_id):
        data = {"rating": 5, "review": "Great video"}
        return self.client.post(
            BASE_URL + str(request_id) + "/videos/" + str(video_id) + "/ratings", data
        )

    def test_admin_can_only_create_one_rating_to_a_video(self):
        self.authorize_user(self.admin_user)
        response = self.create_rating(self.request1.id, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.admin_user.username)

        response = self.create_rating(self.request1.id, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "You have already posted a rating.")

    def test_staff_can_only_create_one_rating_to_a_video(self):
        self.authorize_user(self.staff_user)
        response = self.create_rating(self.request1.id, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["author"]["username"], self.staff_user.username)

        response = self.create_rating(self.request1.id, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "You have already posted a rating.")

    def test_user_should_not_create_ratings(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.create_rating(self.request1.id, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.create_rating(self.request1.id, NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.create_rating(NOT_EXISTING_ID, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.create_rating(NOT_EXISTING_ID, NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_create_ratings(self):
        # Test error for existing object
        response = self.create_rating(self.request1.id, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.create_rating(self.request1.id, NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.create_rating(NOT_EXISTING_ID, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.create_rating(NOT_EXISTING_ID, NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_posting_rating_on_not_existing_request_or_video(
        self,
    ):
        self.authorize_user(self.admin_user)
        response = self.create_rating(self.request1.id, NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.create_rating(NOT_EXISTING_ID, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.create_rating(NOT_EXISTING_ID, NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.authorize_user(self.staff_user)
        response = self.create_rating(self.request1.id, NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.create_rating(NOT_EXISTING_ID, self.video3.id)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        response = self.create_rating(NOT_EXISTING_ID, NOT_EXISTING_ID)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_rating_validator(self):
        self.authorize_user(self.admin_user)
        data = {
            "rating": 50,
        }
        response = self.client.post(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["rating"][0], "Ensure this value is less than or equal to 5."
        )

        data["rating"] = -100
        response = self.client.post(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings",
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["rating"][0],
            "Ensure this value is greater than or equal to 1.",
        )

    def test_user_cannot_rate_video_before_certain_status(self):
        unedited_video = create_video(504, self.request1, Video.Statuses.IN_PROGRESS)
        self.authorize_user(self.admin_user)
        response = self.create_rating(self.request1.id, unedited_video.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "The video has not been edited yet.")

    """
    PUT, PATCH /api/v1/admin/requests/:id/ratings/:id
    """

    def test_admin_can_modify_any_ratings(self):
        self.authorize_user(self.admin_user)
        data = {"review": "Modified by admin"}
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        ).json()
        self.assertIn("Modified by admin", data["review"])
        data = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        ).json()
        self.assertIn("Modified by admin", data["review"])
        data = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        ).json()
        self.assertIn("Modified by admin", data["review"])

        data["review"] = "Modified by admin (PUT)"
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        ).json()
        self.assertIn("Modified by admin (PUT)", data["review"])
        data = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        ).json()
        self.assertIn("Modified by admin (PUT)", data["review"])
        data = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        ).json()
        self.assertIn("Modified by admin (PUT)", data["review"])

    def test_staff_can_modify_only_own_ratings(self):
        self.authorize_user(self.staff_user)
        data = {"review": "Modified by staff"}
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        ).json()
        self.assertIn("Modified by staff", data["review"])

        data["review"] = "Modified by staff (PUT)"
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = self.client.get(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        ).json()
        self.assertIn("Modified by staff (PUT)", data["review"])

    def test_user_should_not_modify_ratings(self):
        self.authorize_user(self.normal_user)
        data = {"review": "Modified by user"}
        # Test error for existing object
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.patch(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        data = {"review": "Modified by user", "rating": 5}
        # Test error for existing object
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.put(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_modify_rating(self):
        data = {"review": "Modified by anonymous"}
        # Test error for existing object
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        data = {"review": "Modified by anonymous", "rating": 5}
        # Test error for existing object
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data,
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_modifying_rating_on_not_existing_request_video_or_rating(
        self,
    ):
        data_patch = {"review": "Modified by anonymous"}
        data_put = {"review": "Modified", "rating": 5}

        self.authorize_user(self.admin_user)
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_patch,
        )

        self.should_not_found(
            "PUT",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_put,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data_patch,
        )
        self.should_not_found(
            "PATCH",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_patch,
        )

        self.should_not_found(
            "PUT",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            data_put,
        )
        self.should_not_found(
            "PUT",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            data_put,
        )

    """
    DELETE /api/v1/admin/requests/:id/videos/:id/ratings/:id
    """

    def test_admin_can_delete_any_ratings(self):
        self.authorize_user(self.admin_user)
        # Try to delete one rating created by staff user
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video2.id)
            + "/ratings/"
            + str(self.rating5.id)
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_delete_only_own_ratings(self):
        self.authorize_user(self.staff_user)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video2.id)
            + "/ratings/"
            + str(self.rating4.id)
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_should_not_delete_ratings(self):
        self.authorize_user(self.normal_user)

        # Test error for existing object
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Test error for not existing object - Error should be the same
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.delete(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_delete_ratings(self):
        # Test error for existing object
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating2.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating3.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Test error for not existing object - Error should be the same
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.delete(
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID)
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_and_staff_error_for_deleting_rating_on_not_existing_request_video_or_rating(
        self,
    ):
        self.authorize_user(self.admin_user)
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

        self.authorize_user(self.staff_user)
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(self.request1.id)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(self.video1.id)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(self.rating1.id),
            None,
        )
        self.should_not_found(
            "DELETE",
            BASE_URL
            + str(NOT_EXISTING_ID)
            + "/videos/"
            + str(NOT_EXISTING_ID)
            + "/ratings/"
            + str(NOT_EXISTING_ID),
            None,
        )

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

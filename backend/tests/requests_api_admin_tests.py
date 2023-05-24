import itertools
from datetime import timedelta

from django.contrib.auth.models import User
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

    def test_add_modify_remove_responsible(self):
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

    def test_modify_requester(self):
        request = create_request(104, self.admin_user)
        self.authorize_user(self.admin_user)

        response = self.client.get(f"{BASE_URL}{request.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["requester"]["username"], self.admin_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        response = self.client.patch(
            f"{BASE_URL}{request.id}", {"requester_id": NOT_EXISTING_ID}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["requester_id"], "Not found user with the provided ID."
        )

        response = self.client.patch(
            f"{BASE_URL}{request.id}", {"requester_id": self.staff_user.id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["requester"]["username"], self.staff_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        new_user_data = {
            "requester_first_name": "Test",
            "requester_last_name": "User",
            "requester_email": "test.user@example.com",
            "requester_mobile": "+36509999999",
        }

        self.assertEqual(
            User.objects.filter(email=new_user_data["requester_email"]).exists(), False
        )
        response = self.client.patch(f"{BASE_URL}{request.id}", new_user_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            User.objects.filter(email=new_user_data["requester_email"]).exists(), True
        )
        self.assertEqual(
            response.data["requester"]["username"], "test.user@example.com"
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        existing_user_data = {
            "requester_first_name": "Anonymous",
            "requester_last_name": "Tester",
            "requester_email": self.normal_user.email,
            "requester_mobile": "+36701234567",
        }

        response = self.client.patch(f"{BASE_URL}{request.id}", existing_user_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["requester"]["username"], self.normal_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        # Check if data was saved to additional_data
        self.assertEqual(
            response.data["additional_data"]["requester"]["first_name"],
            existing_user_data["requester_first_name"],
        )
        self.assertEqual(
            response.data["additional_data"]["requester"]["last_name"],
            existing_user_data["requester_last_name"],
        )
        self.assertEqual(
            response.data["additional_data"]["requester"]["phone_number"],
            existing_user_data["requester_mobile"],
        )

    """
    POST /api/v1/admin/requests
    DELETE /api/v1/admin/requests/:id
    """

    def create_request(self, extra_data=None):
        if extra_data is None:
            extra_data = {}
        data = {
            "title": "Test Request",
            "start_datetime": "2020-03-05T10:30:00+01:00",
            "end_datetime": "2020-03-06T10:30:00+01:00",
            "place": "Test place",
            "type": "Test type",
            "responsible_id": self.admin_user.id,
        } | extra_data
        return self.client.post("/api/v1/admin/requests", data)

    def test_admin_can_create_and_delete_requests(self):
        self.authorize_user(self.admin_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.admin_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
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
            response.data["requested_by"]["username"], self.staff_user.username
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

    def test_admin_can_delete_any_requests(self):
        self.authorize_user(self.staff_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.staff_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.staff_user.username
        )

        self.authorize_user(self.admin_user)
        response = self.client.delete(BASE_URL + str(response.data["id"]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_cannot_delete_any_request(self):
        self.authorize_user(self.admin_user)
        response = self.create_request()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.admin_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        self.authorize_user(self.staff_user)
        response = self.client.delete(BASE_URL + str(response.data["id"]))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_can_delete_request_requested_by_them(self):
        self.authorize_user(self.staff_user)
        response = self.create_request({"requester_id": self.admin_user.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.admin_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.staff_user.username
        )

        response = self.client.delete(BASE_URL + str(response.data["id"]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_can_delete_request_when_requester_is_them(self):
        self.authorize_user(self.admin_user)
        response = self.create_request({"requester_id": self.staff_user.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.staff_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        self.authorize_user(self.staff_user)
        response = self.client.delete(BASE_URL + str(response.data["id"]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

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
            response.data["start_datetime"][0], "Must be earlier than end_datetime."
        )

        data = self.get_test_data()
        data["deadline"] = data["end_datetime"].date()
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["deadline"][0],
            "Must be later than end of the event.",
        )

        data = self.get_test_data()
        data["deadline"] = data["end_datetime"].date() + timedelta(days=1)
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["deadline"], str(data["deadline"]))

    def test_create_request_with_different_requester(self):
        self.authorize_user(self.admin_user)

        response = self.create_request({"requester_id": NOT_EXISTING_ID})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["requester_id"], "Not found user with the provided ID."
        )

        response = self.create_request({"requester_id": self.staff_user.id})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.staff_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        new_user_data = {
            "requester_first_name": "Test",
            "requester_last_name": "User",
            "requester_email": "test.user@example.com",
            "requester_mobile": "+36509999999",
        }

        self.assertEqual(
            User.objects.filter(email=new_user_data["requester_email"]).exists(), False
        )
        response = self.create_request(new_user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            User.objects.filter(email=new_user_data["requester_email"]).exists(), True
        )
        self.assertEqual(
            response.data["requester"]["username"], "test.user@example.com"
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        existing_user_data = {
            "requester_first_name": "Anonymous",
            "requester_last_name": "Tester",
            "requester_email": self.normal_user.email,
            "requester_mobile": "+36701234567",
        }

        response = self.create_request(existing_user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["requester"]["username"], self.normal_user.username
        )
        self.assertEqual(
            response.data["requested_by"]["username"], self.admin_user.username
        )

        # Check if data was saved to additional_data
        self.assertEqual(
            response.data["additional_data"]["requester"]["first_name"],
            existing_user_data["requester_first_name"],
        )
        self.assertEqual(
            response.data["additional_data"]["requester"]["last_name"],
            existing_user_data["requester_last_name"],
        )
        self.assertEqual(
            response.data["additional_data"]["requester"]["phone_number"],
            existing_user_data["requester_mobile"],
        )

    def test_requester_validation(self):
        self.authorize_user(self.admin_user)
        url = "/api/v1/admin/requests"
        user_data = [
            {"requester_first_name": "Test"},
            {"requester_last_name": "User"},
            {"requester_email": "test.user@example.com"},
            {"requester_mobile": "+36509999999"},
        ]

        for r in range(1, len(user_data) + 1):
            for selected in list(itertools.combinations(user_data, r)):
                data = self.get_test_data()
                for item in selected:
                    data |= item
                if r == len(user_data):
                    data |= {"requester_id": self.staff_user.id}
                    response = self.client.post(url, data)
                    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                    self.assertEqual(
                        response.data["non_field_errors"][0],
                        "Either define the requester by its id or its details but not both.",
                    )
                else:
                    response = self.client.post(url, data)
                    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                    self.assertEqual(
                        response.data["non_field_errors"][0],
                        "All requester data fields must be present if one is present.",
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

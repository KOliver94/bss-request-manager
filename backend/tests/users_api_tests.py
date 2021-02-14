from django.contrib.auth.models import User
from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from tests.helpers.users_test_utils import create_user, get_default_password
from tests.helpers.video_requests_test_utils import (
    create_crew,
    create_request,
    create_video,
)

NOT_EXISTING_ID = 9000


@freeze_time("2020-12-01 12:00:00", tz_offset=+1)
class UsersAPITestCase(APITestCase):
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
        self.url = "/api/v1/users"
        self.admin = create_user(is_admin=True)
        self.staff = create_user(is_staff=True)
        self.user = create_user()

        # Worked on Requests
        # 20 weeks before today
        self.request1 = create_request(
            100, self.user, start="2020-07-07T20:00:00+0100", responsible=self.admin
        )
        self.request2 = create_request(
            101, self.user, start="2020-07-13T20:00:00+0100", responsible=self.staff
        )
        create_crew(200, self.request1, self.admin, "Cameraman")
        create_crew(201, self.request2, self.admin, "Technician")
        create_crew(202, self.request1, self.staff, "Reporter")
        create_video(300, self.request1, editor=self.admin)
        create_video(301, self.request1, editor=self.staff)

        # Before 2020-11-01
        self.request3 = create_request(
            102, self.user, start="2020-10-10T20:00:00+0100", responsible=self.admin
        )
        self.request4 = create_request(
            103, self.user, start="2020-10-25T20:00:00+0100", responsible=self.staff
        )
        create_crew(203, self.request3, self.admin, "Cameraman")
        create_crew(204, self.request4, self.admin, "Technician")
        create_crew(205, self.request3, self.staff, "Reporter")
        create_video(302, self.request3, editor=self.admin)
        create_video(303, self.request3, editor=self.staff)

        # Between 2020-11-01 and 2020-12-01
        self.request5 = create_request(
            104, self.user, start="2020-11-10T20:00:00+0100", responsible=self.admin
        )
        self.request6 = create_request(
            105, self.user, start="2020-11-25T20:00:00+0100", responsible=self.staff
        )
        create_crew(206, self.request5, self.admin, "Cameraman")
        create_crew(207, self.request5, self.admin, "Technician")
        create_crew(208, self.request5, self.staff, "Reporter")
        create_crew(209, self.request6, self.staff, "Technician")
        create_video(304, self.request5, editor=self.staff)
        create_video(305, self.request6, editor=self.staff)

        # After 2020-12-01
        self.request7 = create_request(
            106, self.user, start="2020-12-10T20:00:00+0100", responsible=self.admin
        )
        self.request8 = create_request(
            107, self.user, start="2020-12-25T20:00:00+0100", responsible=self.staff
        )
        create_crew(210, self.request8, self.admin, "Cameraman")
        create_crew(211, self.request7, self.staff, "Reporter")
        create_crew(212, self.request8, self.staff, "Technician")
        create_video(306, self.request7, editor=self.admin)
        create_video(307, self.request8, editor=self.admin)
        create_video(308, self.request7, editor=self.staff)
        create_video(309, self.request8, editor=self.staff)

    """
    GET /api/v1/users/me OR /api/v1/users/:id
    """

    def assert_user_response(self, response, user):
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("profile", response.data)
        self.assertIn("groups", response.data)
        self.assertEqual(response.data["username"], user.username)
        self.assertEqual(response.data["email"], user.email)
        self.assertEqual(
            response.data["profile"]["phone_number"], user.userprofile.phone_number
        )
        self.assertEqual(
            response.data["profile"]["avatar_url"], user.userprofile.avatar_url
        )

    def test_admin_can_get_own_user_details(self):
        self.authorize_user(self.admin)
        self.assert_user_response(self.client.get(f"{self.url}/me"), self.admin)
        self.assert_user_response(
            self.client.get(f"{self.url}/{self.admin.id}"), self.admin
        )

    def test_staff_can_get_own_user_details(self):
        self.authorize_user(self.staff)
        self.assert_user_response(self.client.get(f"{self.url}/me"), self.staff)
        self.assert_user_response(
            self.client.get(f"{self.url}/{self.staff.id}"), self.staff
        )

    def test_user_can_get_own_user_details(self):
        self.authorize_user(self.user)
        self.assert_user_response(self.client.get(f"{self.url}/me"), self.user)
        self.assert_user_response(
            self.client.get(f"{self.url}/{self.user.id}"), self.user
        )

    def test_admin_can_get_other_users_details(self):
        self.authorize_user(self.admin)
        self.assert_user_response(
            self.client.get(f"{self.url}/{self.user.id}"), self.user
        )

        # Not existing user - Not found
        response = self.client.get(f"{self.url}/{NOT_EXISTING_ID}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_can_get_other_users_details(self):
        self.authorize_user(self.staff)
        self.assert_user_response(
            self.client.get(f"{self.url}/{self.user.id}"), self.user
        )

        # Not existing user - Not found
        response = self.client.get(f"{self.url}/{NOT_EXISTING_ID}")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_should_not_get_other_users_details(self):
        self.authorize_user(self.user)
        response = self.client.get(f"{self.url}/{self.admin.id}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # For simple user return Forbidden to everything other than his own user
        response = self.client.get(f"{self.url}/{NOT_EXISTING_ID}")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_user_details(self):
        response = self.client.get(f"{self.url}/me")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get(f"{self.url}/{self.user.id}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get(f"{self.url}/{NOT_EXISTING_ID}")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    """
    PUT/PATCH /api/v1/users/me OR /api/v1/users/:id
    """
    user_details_data = {
        "first_name": "Test_123",
        "last_name": "Test_456",
        "email": "test.user@exmaple.com",
        "phone_number": "+36501234567",
        "avatar_provider": "facebook",
    }

    def change_phone_number_and_assert_response(self, user):
        data1 = {"phone_number": "+36209876543"}
        data2 = {"phone_number": "+36309876543"}
        data3 = {"phone_number": "+36509876543"}
        data4 = {"phone_number": "+36709876543"}

        response = self.client.patch(f"{self.url}/me", data1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["profile"]["phone_number"], data1["phone_number"]
        )
        response = self.client.patch(f"{self.url}/{user.id}", data2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["profile"]["phone_number"], data2["phone_number"]
        )

        response = self.client.put(f"{self.url}/me", data3)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["profile"]["phone_number"], data3["phone_number"]
        )
        response = self.client.put(f"{self.url}/{user.id}", data4)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["profile"]["phone_number"], data4["phone_number"]
        )

    def change_name_and_assert_response(self, user):
        data1 = {"first_name": f"{user.first_name}_mod"}
        data2 = {"last_name": f"{user.last_name}_mod"}

        response = self.client.patch(f"{self.url}/me", data1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], data1["first_name"])

        response = self.client.put(f"{self.url}/{user.id}", data2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["last_name"], data2["last_name"])

    def change_email_and_assert_response(self, user):
        data1 = {"email": f"{user.username}234@example.com"}
        data2 = {"email": f"{user.username}567@example.com"}

        response = self.client.patch(f"{self.url}/me", data1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], data1["email"])

        response = self.client.put(f"{self.url}/{user.id}", data2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], data2["email"])

    def change_avatar_provider_and_assert_response(self, user):
        data1 = {"avatar_provider": "facebook"}
        data2 = {"avatar_provider": "gravatar"}
        data3 = {"avatar_provider": "google-oauth2"}
        data4 = {"avatar_provider": "not_existing"}

        response = self.client.patch(f"{self.url}/me", data1)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["profile"]["avatar_url"], user.userprofile.avatar["facebook"]
        )
        response_new = self.client.patch(f"{self.url}/{user.id}", data3)
        self.assertEqual(response_new.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, response_new.data)
        response = self.client.patch(f"{self.url}/{user.id}", data4)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["avatar_provider"][0].code, "invalid_choice")

        response = self.client.put(f"{self.url}/me", data2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["profile"]["avatar_url"], user.userprofile.avatar["gravatar"]
        )
        response_new = self.client.put(f"{self.url}/{user.id}", data3)
        self.assertEqual(response_new.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, response_new.data)
        response = self.client.put(f"{self.url}/{user.id}", data4)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["avatar_provider"][0].code, "invalid_choice")

    def test_admin_can_change_own_user_details(self):
        self.authorize_user(self.admin)
        self.change_phone_number_and_assert_response(self.admin)
        self.change_name_and_assert_response(self.admin)
        self.change_email_and_assert_response(self.admin)
        self.change_avatar_provider_and_assert_response(self.admin)

    def test_staff_can_change_own_user_details(self):
        self.authorize_user(self.staff)
        self.change_phone_number_and_assert_response(self.staff)
        self.change_name_and_assert_response(self.staff)
        self.change_email_and_assert_response(self.staff)
        self.change_avatar_provider_and_assert_response(self.staff)

    def test_user_can_change_own_user_details(self):
        self.authorize_user(self.user)
        self.change_phone_number_and_assert_response(self.user)
        self.change_name_and_assert_response(self.user)
        self.change_email_and_assert_response(self.user)
        self.change_avatar_provider_and_assert_response(self.user)

    def test_admin_can_change_other_users_user_details(self):
        self.authorize_user(self.admin)

        response = self.client.patch(
            f"{self.url}/{self.user.id}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["first_name"], self.user_details_data["first_name"]
        )
        self.assertEqual(
            response.data["last_name"], self.user_details_data["last_name"]
        )
        self.assertEqual(response.data["email"], self.user_details_data["email"])
        self.assertEqual(
            response.data["profile"]["phone_number"],
            self.user_details_data["phone_number"],
        )
        self.assertEqual(
            response.data["profile"]["avatar_url"],
            self.user.userprofile.avatar["facebook"],
        )

        response = self.client.put(
            f"{self.url}/{self.staff.id}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["first_name"], self.user_details_data["first_name"]
        )
        self.assertEqual(
            response.data["last_name"], self.user_details_data["last_name"]
        )
        self.assertEqual(response.data["email"], self.user_details_data["email"])
        self.assertEqual(
            response.data["profile"]["phone_number"],
            self.user_details_data["phone_number"],
        )
        self.assertEqual(
            response.data["profile"]["avatar_url"],
            self.staff.userprofile.avatar["facebook"],
        )

        response = self.client.patch(
            f"{self.url}/{NOT_EXISTING_ID}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.put(
            f"{self.url}/{NOT_EXISTING_ID}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_staff_should_not_change_other_users_user_details(self):
        self.authorize_user(self.staff)

        response = self.client.patch(
            f"{self.url}/{self.user.id}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(
            f"{self.url}/{self.admin.id}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.patch(
            f"{self.url}/{NOT_EXISTING_ID}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response = self.client.put(
            f"{self.url}/{NOT_EXISTING_ID}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_should_not_change_other_users_user_details(self):
        self.authorize_user(self.user)

        response = self.client.patch(
            f"{self.url}/{self.staff.id}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(
            f"{self.url}/{self.admin.id}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.patch(
            f"{self.url}/{NOT_EXISTING_ID}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(
            f"{self.url}/{NOT_EXISTING_ID}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_change_user_details(self):
        response = self.client.patch(f"{self.url}/me", self.user_details_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            f"{self.url}/{self.user.id}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.patch(
            f"{self.url}/{NOT_EXISTING_ID}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.put(f"{self.url}/me", self.user_details_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(f"{self.url}/{self.user.id}", self.user_details_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.put(
            f"{self.url}/{NOT_EXISTING_ID}", self.user_details_data
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_should_not_provide_empty_name_or_email(self):
        self.authorize_user(self.admin)
        data1 = {"first_name": "", "last_name": "", "email": ""}
        data2 = {"first_name": None, "last_name": None, "email": None}

        response = self.client.patch(f"{self.url}/me", data1)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["first_name"][0]), "This field may not be blank."
        )
        self.assertEqual(
            str(response.data["last_name"][0]), "This field may not be blank."
        )
        self.assertEqual(str(response.data["email"][0]), "This field may not be blank.")

        response = self.client.put(f"{self.url}/me", data2)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            str(response.data["first_name"][0]), "This field may not be null."
        )
        self.assertEqual(
            str(response.data["last_name"][0]), "This field may not be null."
        )
        self.assertEqual(str(response.data["email"][0]), "This field may not be null.")

    """
    GET /api/v1/users
    """

    def test_admin_can_list_users(self):
        self.authorize_user(self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 3)

    def test_staff_should_not_list_users(self):
        self.authorize_user(self.staff)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_should_not_list_users(self):
        self.authorize_user(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_list_users(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_users_filters_works(self):
        # Create a user that has admin right but not staff
        only_admin_user = create_user()
        only_admin_user.is_superuser = True
        only_admin_user.save()

        self.authorize_user(self.admin)

        response = self.client.get(f"{self.url}?staff=False")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertIn(
            response.data["results"][0]["username"],
            [self.user.username, only_admin_user.username],
        )
        self.assertIn(
            response.data["results"][1]["username"],
            [self.user.username, only_admin_user.username],
        )

        response = self.client.get(f"{self.url}?staff=True")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertIn(
            response.data["results"][0]["username"],
            [self.staff.username, self.admin.username],
        )
        self.assertIn(
            response.data["results"][1]["username"],
            [self.staff.username, self.admin.username],
        )

        response = self.client.get(f"{self.url}?admin=False")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertIn(
            response.data["results"][0]["username"],
            [self.user.username, self.staff.username],
        )
        self.assertIn(
            response.data["results"][1]["username"],
            [self.user.username, self.staff.username],
        )

        response = self.client.get(f"{self.url}?admin=True")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertIn(
            response.data["results"][0]["username"],
            [only_admin_user.username, self.admin.username],
        )
        self.assertIn(
            response.data["results"][1]["username"],
            [only_admin_user.username, self.admin.username],
        )

        response = self.client.get(f"{self.url}?admin=False&staff=False")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(self.user.username, response.data["results"][0]["username"])

        response = self.client.get(f"{self.url}?admin=True&staff=False")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            only_admin_user.username, response.data["results"][0]["username"]
        )

        response = self.client.get(f"{self.url}?staff=True&admin=False")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(self.staff.username, response.data["results"][0]["username"])

        response = self.client.get(f"{self.url}?staff=True&admin=True")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(self.admin.username, response.data["results"][0]["username"])

    def test_list_users_invalid_filters(self):
        self.authorize_user(self.admin)

        response = self.client.get(f"{self.url}?staff=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(f"{self.url}?admin=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(f"{self.url}?staff=randomText&admin=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(f"{self.url}?staff=True&admin=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(f"{self.url}?staff=randomText&admin=True")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

    """
    GET /api/v1/users/staff
    """

    @staticmethod
    def create_inactive_staff_user():
        user = create_user(is_staff=True)
        user.is_active = False
        user.save()

    def list_and_assert_staff_users(self, response):
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn(
            response.data[0]["username"], [self.staff.username, self.admin.username]
        )
        self.assertIn(
            response.data[1]["username"], [self.staff.username, self.admin.username]
        )

    def test_admin_can_list_staff_users(self):
        self.create_inactive_staff_user()
        self.authorize_user(self.admin)
        self.list_and_assert_staff_users(self.client.get(f"{self.url}/staff"))

    def test_staff_can_list_staff_users(self):
        self.create_inactive_staff_user()
        self.authorize_user(self.staff)
        self.list_and_assert_staff_users(self.client.get(f"{self.url}/staff"))

    def test_user_should_not_list_staff_users(self):
        self.authorize_user(self.user)
        response = self.client.get(f"{self.url}/staff")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_list_staff_users(self):
        response = self.client.get(f"{self.url}/staff")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    """
    PUT/PATCH /api/v1/users/:id/ban
    """

    def check_login_failed_when_banned(self, user):
        url = reverse("login_obtain_jwt_pair")
        response = self.client.post(
            url,
            {"username": user.username, "password": get_default_password()},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            str(response.data["detail"]),
            "No active account found with the given credentials",
        )

    def check_if_user_is_banned(self, user_id, banned):
        user = User.objects.get(pk=user_id)
        response = self.client.get(f"{self.url}/{user_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        if banned:
            self.assertFalse(user.is_active)
            self.assertIn("Banned", response.data["groups"])
            self.check_login_failed_when_banned(user)
        else:
            self.assertTrue(user.is_active)
            self.assertNotIn("Banned", response.data["groups"])

    def test_admin_can_ban_and_unban_user(self):
        user = create_user()
        ban = {"ban": True}
        unban = {"ban": False}
        self.authorize_user(self.admin)

        response = self.client.patch(f"{self.url}/{user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, True)

        response = self.client.patch(f"{self.url}/{user.id}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, False)

        response = self.client.put(f"{self.url}/{user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, True)

        response = self.client.put(f"{self.url}/{user.id}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, False)

    def test_staff_should_not_ban_and_unban_user(self):
        ban = {"ban": True}
        unban = {"ban": False}
        self.authorize_user(self.staff)

        response = self.client.patch(f"{self.url}/{self.staff.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.patch(f"{self.url}/{self.admin.id}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(f"{self.url}/{self.user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(f"{self.url}/{NOT_EXISTING_ID}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_should_not_ban_and_unban_user(self):
        ban = {"ban": True}
        unban = {"ban": False}
        self.authorize_user(self.user)

        response = self.client.patch(f"{self.url}/{self.staff.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.patch(f"{self.url}/{self.admin.id}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(f"{self.url}/{self.user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.put(f"{self.url}/{NOT_EXISTING_ID}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_ban_and_unban_user(self):
        ban = {"ban": True}
        unban = {"ban": False}

        response = self.client.patch(f"{self.url}/{self.staff.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.patch(f"{self.url}/{self.admin.id}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.put(f"{self.url}/{self.user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.put(f"{self.url}/{NOT_EXISTING_ID}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_ban_unban_edge_cases(self):
        user = create_user()
        ban = {"ban": True}
        unban = {"ban": False}
        self.authorize_user(self.admin)

        # Call ban multiple times
        response = self.client.patch(f"{self.url}/{user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, True)

        response = self.client.put(f"{self.url}/{user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, True)

        response = self.client.patch(f"{self.url}/{user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, True)

        # Call unban multiple times
        response = self.client.put(f"{self.url}/{user.id}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, False)

        response = self.client.patch(f"{self.url}/{user.id}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, False)

        response = self.client.put(f"{self.url}/{user.id}/ban", unban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, False)

        # Call endpoint with empty body
        response = self.client.patch(f"{self.url}/{user.id}/ban", {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["ban"][0], "This field is required.")

        response = self.client.put(f"{self.url}/{user.id}/ban", {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["ban"][0], "This field is required.")

    def test_refresh_token_after_ban(self):
        user = create_user()
        login_url = reverse("login_obtain_jwt_pair")
        refresh_url = reverse("login_refresh_jwt_token")

        response = self.client.post(
            login_url,
            {"username": user.username, "password": get_default_password()},
            format="json",
        )
        access_token = response.data["access"]
        refresh_token = response.data["refresh"]

        ban = {"ban": True}
        self.authorize_user(self.admin)

        response = self.client.patch(f"{self.url}/{user.id}/ban", ban)
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.check_if_user_is_banned(user.id, True)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        response = self.client.post(
            refresh_url, {"refresh": refresh_token}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(str(response.data["detail"]), "Token is blacklisted")

    """
    GET /api/v1/users/me/worked OR /api/v1/users/:id/worked
    """

    def test_admin_can_get_own_worked_on(self):
        self.authorize_user(self.admin)
        response = self.client.get(f"{self.url}/me/worked")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response2 = self.client.get(f"{self.url}/{self.admin.id}/worked")
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertJSONEqual(
            str(response.content, encoding="utf8"),
            str(response2.content, encoding="utf8"),
        )

        self.assertEqual(len(response.data), 7)
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Felelős" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request4.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request3.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Felelős" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )

    def test_staff_can_get_own_worked_on(self):
        self.authorize_user(self.staff)
        response = self.client.get(f"{self.url}/me/worked")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response2 = self.client.get(f"{self.url}/{self.staff.id}/worked")
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertJSONEqual(
            str(response.content, encoding="utf8"),
            str(response2.content, encoding="utf8"),
        )

        self.assertEqual(len(response.data), 8)
        self.assertTrue(
            any(
                (
                    self.request4.title == d.get("title")
                    and "Felelős" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Reporter" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request3.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request6.title == d.get("title")
                    and "Felelős" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Reporter" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request6.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request5.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request5.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )

    def test_staff_should_not_get_other_users_worked_on(self):
        self.authorize_user(self.staff)
        response = self.client.get(f"{self.url}/{self.admin.id}/worked")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(f"{self.url}/{NOT_EXISTING_ID}/worked")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_should_not_get_user_worked_on(self):
        self.authorize_user(self.user)
        response = self.client.get(f"{self.url}/me/worked")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(f"{self.url}/{self.user.id}/worked")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(f"{self.url}/{self.staff.id}/worked")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        response = self.client.get(f"{self.url}/{NOT_EXISTING_ID}/worked")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_should_not_get_user_worked_on(self):
        response = self.client.get(f"{self.url}/me/worked")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(f"{self.url}/{self.user.id}/worked")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(f"{self.url}/{self.staff.id}/worked")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.client.get(f"{self.url}/{NOT_EXISTING_ID}/worked")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_worked_on_filters_works(self):
        self.authorize_user(self.admin)

        # From 2020-11-01 until now (2020-12-01)
        response = self.client.get(f"{self.url}/me/worked?from_date=2020-11-01")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Felelős" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )

        # From 20 weeks before until 2020-11-01
        response = self.client.get(f"{self.url}/me/worked?to_date=2020-11-01")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 8)
        self.assertTrue(
            any(
                (
                    self.request1.title == d.get("title")
                    and "Felelős" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request1.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request2.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request1.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Felelős" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request4.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request3.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )

        # Between 2020-10-01 and 2020-11-01
        response = self.client.get(
            f"{self.url}/me/worked?from_date=2020-10-01&to_date=2020-11-01"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Felelős" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request4.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request3.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )

        # From 20 weeks before until now (2020-12-01) without responsible
        response = self.client.get(f"{self.url}/me/worked?responsible=False")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request4.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request3.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )

        # From 2020-11-01 until now (2020-12-01) without responsible
        response = self.client.get(
            f"{self.url}/me/worked?from_date=2020-11-01&responsible=False"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request5.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )

        # From 20 weeks before until 2020-11-01 without responsible
        response = self.client.get(
            f"{self.url}/me/worked?to_date=2020-11-01&responsible=False"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 6)
        self.assertTrue(
            any(
                (
                    self.request1.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request2.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request1.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request4.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request3.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )

        # Between 2020-10-01 and 2020-11-01 without responsible
        response = self.client.get(
            f"{self.url}/me/worked?from_date=2020-10-01&to_date=2020-11-01&responsible=False"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)
        self.assertTrue(
            any(
                (
                    self.request3.title == d.get("title")
                    and "Cameraman" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (
                    self.request4.title == d.get("title")
                    and "Technician" == d.get("position")
                )
                for d in response.data
            )
        )
        self.assertTrue(
            any(
                (self.request3.title == d.get("title") and "Vágó" == d.get("position"))
                for d in response.data
            )
        )

    def test_user_worked_on_invalid_filters(self):
        self.authorize_user(self.admin)

        response = self.client.get(f"{self.url}/me/worked?to_date=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(f"{self.url}/me/worked?from_date=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(f"{self.url}/me/worked?responsible=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(
            f"{self.url}/me/worked?from_date=2020-12-01&to_date=2020-11-01"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "From date must be earlier than to date.")

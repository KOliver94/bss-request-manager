from datetime import timedelta
from io import StringIO

from django.core.management import call_command
from django.test import override_settings
from django.utils.timezone import localtime
from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from tests.helpers.users_test_utils import create_user, get_default_password
from tests.helpers.video_requests_test_utils import create_request, create_video


def get_test_data():
    return {
        "title": "Test Request",
        "start_datetime": localtime(),
        "end_datetime": localtime() + timedelta(hours=4),
        "place": "Test place",
        "type": "Test type",
    }


class RequestsUtilitiesTestCase(APITestCase):
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
        self.url = "/api/v1/admin/requests"
        self.user = create_user(is_admin=True)
        self.authorize_user(self.user)

    @freeze_time("2020-11-21 10:20:30", tz_offset=+1, as_kwarg="frozen_time")
    def test_request_and_video_status_changes(self, frozen_time):
        # 1. Create Request
        response = self.client.post(self.url, get_test_data())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], 1)
        request_id = response.data["id"]

        # 2. Accept the Request
        response = self.client.patch(
            f"{self.url}/{request_id}", {"additional_data": {"accepted": True}}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 2)

        # 3. Change time to the end of the event and update status
        frozen_time.move_to("2020-11-21 14:30:20")
        with StringIO() as out:
            call_command("update_request_status", stdout=out)
            self.assertEquals(
                out.getvalue(), "1 requests was checked for valid status.\n"
            )
        response = self.client.get(f"{self.url}/{request_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 3)

        # 4. Add recording information
        response = self.client.patch(
            f"{self.url}/{request_id}",
            {"additional_data": {"recording": {"path": "N:/20201121_test"}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 4)

        # 5./1 Add a video
        response = self.client.post(
            f"{self.url}/{request_id}/videos", {"title": "New video"}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], 1)
        video_id = response.data["id"]

        # 5./2 Assign editor to the video
        response = self.client.patch(
            f"{self.url}/{request_id}/videos/{video_id}", {"editor_id": self.user.id}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 2)

        # 5./3 Finish the editing of the video
        response = self.client.patch(
            f"{self.url}/{request_id}/videos/{video_id}",
            {"additional_data": {"editing_done": True}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 3)
        # Request status should also change
        response = self.client.get(f"{self.url}/{request_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 5)

        # 6./1 Copy raw materials to Google Drive
        response = self.client.patch(
            f"{self.url}/{request_id}",
            {"additional_data": {"recording": {"copied_to_gdrive": True}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 6./2 Encode the video to the website
        response = self.client.patch(
            f"{self.url}/{request_id}/videos/{video_id}",
            {"additional_data": {"coding": {"website": True}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 4)

        # 6./3 Publish the video on the website
        response = self.client.patch(
            f"{self.url}/{request_id}/videos/{video_id}",
            {"additional_data": {"publishing": {"website": "https://example.com"}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 5)

        # 6./4 Archive the HQ export
        response = self.client.patch(
            f"{self.url}/{request_id}/videos/{video_id}",
            {"additional_data": {"archiving": {"hq_archive": True}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 6)
        # Request status should also change
        response = self.client.get(f"{self.url}/{request_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 6)

        # 7. Remove raw files
        response = self.client.patch(
            f"{self.url}/{request_id}",
            {"additional_data": {"recording": {"removed": True}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 7)

        # 8. Remove video
        response = self.client.delete(f"{self.url}/{request_id}/videos/{video_id}")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        # Request status should also change
        response = self.client.get(f"{self.url}/{request_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 4)

        # 10. Cancel the Request
        response = self.client.patch(
            f"{self.url}/{request_id}", {"additional_data": {"canceled": True}}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 9)
        self.client.patch(
            f"{self.url}/{request_id}", {"additional_data": {"canceled": False}}
        )

        # 11. Fail the Request
        response = self.client.patch(
            f"{self.url}/{request_id}", {"additional_data": {"failed": True}}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 10)

        # 12. Decline the Request
        response = self.client.patch(
            f"{self.url}/{request_id}", {"additional_data": {"accepted": False}}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 0)

    def test_request_and_video_status_changes_set_by_admin(self):
        # 1. Create Request
        response = self.client.post(self.url, get_test_data())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], 1)
        request_id = response.data["id"]

        # 2. Set status by admin
        response = self.client.patch(
            f"{self.url}/{request_id}",
            {"additional_data": {"status_by_admin": {"status": 6, "admin_id": 123}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 6)
        self.assertEqual(
            response.data["additional_data"]["status_by_admin"]["admin_id"],
            self.user.id,
        )

        # 3. Add a video
        response = self.client.post(
            f"{self.url}/{request_id}/videos", {"title": "New video"}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], 1)
        video_id = response.data["id"]

        # 4. Set status by admin
        response = self.client.patch(
            f"{self.url}/{request_id}/videos/{video_id}",
            {"additional_data": {"status_by_admin": {"status": 6, "admin_id": 123}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 6)
        self.assertEqual(
            response.data["additional_data"]["status_by_admin"]["admin_id"],
            self.user.id,
        )

        # 5. Check the Request again
        response = self.client.get(f"{self.url}/{request_id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 6)

    def patch_additional_data_to_request(self, request_id):
        data = {
            "additional_data": {
                "status_by_admin": {"status": 6, "admin_id": 123},
                "accepted": True,
                "failed": True,
                "canceled": True,
                "calendar_id": "123456789abcdefg",
                "requester": {
                    "first_name": "Test",
                    "last_name": "User",
                    "phone_number": "+36701234567",
                },
                "recording": {
                    "path": "N:/test_path",
                    "copied_to_gdrive": True,
                    "removed": False,
                },
            }
        }
        return self.client.patch(f"{self.url}/{request_id}", data)

    def test_check_and_remove_unauthorized_additional_data_for_request_from_staff(self):
        staff_member = create_user(is_staff=True)
        self.authorize_user(staff_member)

        # Create Request
        response = self.client.post(self.url, get_test_data())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], 1)
        request_id = response.data["id"]

        # Try to add unauthorized additional_data parts
        response = self.patch_additional_data_to_request(request_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("recording", response.data["additional_data"])
        self.assertIn("path", response.data["additional_data"]["recording"])
        self.assertIn("copied_to_gdrive", response.data["additional_data"]["recording"])
        self.assertIn("removed", response.data["additional_data"]["recording"])
        self.assertNotIn("status_by_admin", response.data["additional_data"])
        self.assertNotIn("accepted", response.data["additional_data"])
        self.assertNotIn("canceled", response.data["additional_data"])
        self.assertNotIn("failed", response.data["additional_data"])
        self.assertNotIn("calendar_id", response.data["additional_data"])
        self.assertNotIn("requester", response.data["additional_data"])

    def test_check_and_remove_unauthorized_additional_data_for_request_from_admin(self):
        # Create Request
        response = self.client.post(self.url, get_test_data())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], 1)
        request_id = response.data["id"]

        # Try to add unauthorized additional_data parts
        response = self.patch_additional_data_to_request(request_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("recording", response.data["additional_data"])
        self.assertIn("path", response.data["additional_data"]["recording"])
        self.assertIn("copied_to_gdrive", response.data["additional_data"]["recording"])
        self.assertIn("removed", response.data["additional_data"]["recording"])
        self.assertIn("status_by_admin", response.data["additional_data"])
        self.assertIn("status", response.data["additional_data"]["status_by_admin"])
        self.assertIn("admin_id", response.data["additional_data"]["status_by_admin"])
        self.assertEqual(
            response.data["additional_data"]["status_by_admin"]["admin_id"],
            self.user.id,
        )
        self.assertIn("accepted", response.data["additional_data"])
        self.assertIn("canceled", response.data["additional_data"])
        self.assertIn("failed", response.data["additional_data"])
        self.assertIn("calendar_id", response.data["additional_data"])
        self.assertNotIn("requester", response.data["additional_data"])

    def test_status_by_admin_admin_id_should_not_update_incorrectly(self):
        # Create Request
        response = self.client.post(self.url, get_test_data())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], 1)
        request_id = response.data["id"]

        # Change the status by admin
        response = self.patch_additional_data_to_request(request_id)
        self.assertIn("status_by_admin", response.data["additional_data"])
        self.assertIn("status", response.data["additional_data"]["status_by_admin"])
        self.assertIn("admin_id", response.data["additional_data"]["status_by_admin"])
        self.assertEqual(
            response.data["additional_data"]["status_by_admin"]["admin_id"],
            self.user.id,
        )

        # Create a new admin user
        new_admin = create_user(is_admin=True)
        self.authorize_user(new_admin)

        # Send a patch in with same data  --> admin_id should NOT change
        response = self.patch_additional_data_to_request(request_id)
        self.assertIn("status_by_admin", response.data["additional_data"])
        self.assertIn("status", response.data["additional_data"]["status_by_admin"])
        self.assertEqual(
            response.data["additional_data"]["status_by_admin"]["status"], 6
        )
        self.assertIn("admin_id", response.data["additional_data"]["status_by_admin"])
        self.assertEqual(
            response.data["additional_data"]["status_by_admin"]["admin_id"],
            self.user.id,
        )
        self.assertNotEqual(
            response.data["additional_data"]["status_by_admin"]["admin_id"],
            new_admin.id,
        )

        # Change the status_by_admin with the new admin --> admin_id should change
        response = self.client.patch(
            f"{self.url}/{request_id}",
            {"additional_data": {"status_by_admin": {"status": 4, "admin_id": 123}}},
        )
        self.assertIn("status_by_admin", response.data["additional_data"])
        self.assertIn("status", response.data["additional_data"]["status_by_admin"])
        self.assertEqual(
            response.data["additional_data"]["status_by_admin"]["status"], 4
        )
        self.assertIn("admin_id", response.data["additional_data"]["status_by_admin"])
        self.assertNotEqual(
            response.data["additional_data"]["status_by_admin"]["admin_id"],
            self.user.id,
        )
        self.assertEqual(
            response.data["additional_data"]["status_by_admin"]["admin_id"],
            new_admin.id,
        )

    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_publishing_email_sent_to_user_in_video_additional_data_should_not_be_overwritten(
        self,
    ):
        request = create_request(100, self.user, 4)
        staff = create_user(is_staff=True)

        # Add a video with some data
        video_data = {
            "title": "New video",
            "editor_id": self.user.id,
            "additional_data": {
                "editing_done": True,
                "coding": {"website": True},
            },
        }
        response = self.client.post(f"{self.url}/{request.id}/videos", video_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], 4)
        video_id = response.data["id"]

        # Try to add email_sent_to_user before defined with admin user
        self.authorize_user(self.user)
        response = self.client.patch(
            f"{self.url}/{request.id}/videos/{video_id}",
            {"additional_data": {"publishing": {"email_sent_to_user": False}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("publishing", response.data["additional_data"])
        self.assertNotIn(
            "email_sent_to_user", response.data["additional_data"]["publishing"]
        )

        # Try with staff
        self.authorize_user(staff)
        response = self.client.patch(
            f"{self.url}/{request.id}/videos/{video_id}",
            {"additional_data": {"publishing": {"email_sent_to_user": False}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("publishing", response.data["additional_data"])
        self.assertNotIn(
            "email_sent_to_user", response.data["additional_data"]["publishing"]
        )

        # Request was updated due to changes is video so the forced status was changed. Change again
        request.status = 4
        request.save()

        # Publish video
        response = self.client.patch(
            f"{self.url}/{request.id}/videos/{video_id}",
            {"additional_data": {"publishing": {"website": "https://example.com"}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], 5)

        # Because of the async tasks the email_sent_to_user might not be in the response. Get the video again and check
        response = self.client.get(f"{self.url}/{request.id}/videos/{video_id}")
        self.assertIn("publishing", response.data["additional_data"])
        self.assertIn(
            "email_sent_to_user", response.data["additional_data"]["publishing"]
        )
        self.assertEqual(
            response.data["additional_data"]["publishing"]["email_sent_to_user"], True
        )

        # Try to modify email_sent_to_user with admin user
        self.authorize_user(self.user)
        response = self.client.patch(
            f"{self.url}/{request.id}/videos/{video_id}",
            {"additional_data": {"publishing": {"email_sent_to_user": False}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["additional_data"]["publishing"]["email_sent_to_user"], True
        )
        self.assertNotEqual(
            response.data["additional_data"]["publishing"]["email_sent_to_user"], False
        )

        # Try with staff
        self.authorize_user(staff)
        response = self.client.patch(
            f"{self.url}/{request.id}/videos/{video_id}",
            {"additional_data": {"publishing": {"email_sent_to_user": False}}},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["additional_data"]["publishing"]["email_sent_to_user"], True
        )
        self.assertNotEqual(
            response.data["additional_data"]["publishing"]["email_sent_to_user"], False
        )

    def test_video_additional_data_aired_get_sorted_by_date(self):
        request = create_request(100, self.user)
        video = create_video(200, request)

        data = {
            "additional_data": {
                "aired": [
                    "2020-01-12",
                    "2019-11-25",
                    "2020-10-25",
                    "2018-05-19",
                    "2020-07-14",
                ]
            }
        }

        response = self.client.patch(f"{self.url}/{request.id}/videos/{video.id}", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(
            response.data["additional_data"]["aired"],
            ["2020-10-25", "2020-07-14", "2020-01-12", "2019-11-25", "2018-05-19"],
        )

    def test_request_deadline_get_automatically_generated(self):
        response = self.client.post(self.url, get_test_data())
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            response.data["deadline"],
            str((get_test_data()["end_datetime"] + timedelta(weeks=3)).date()),
        )

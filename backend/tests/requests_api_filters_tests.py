from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase

from tests.helpers.users_test_utils import create_user, get_default_password
from tests.helpers.video_requests_test_utils import create_request, create_video


class RequestsAPIFiltersTestCase(APITestCase):
    def setUp(self):
        self.url = "/api/v1/admin/requests"
        self.user = create_user(is_admin=True)
        url = reverse("login_obtain_jwt_pair")
        resp = self.client.post(
            url,
            {"username": self.user.username, "password": get_default_password()},
            format="json",
        )
        token = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        self.request1 = create_request(100, self.user, start="2020-03-10T19:30:00+0100")
        self.request2 = create_request(101, self.user, start="2020-07-07T19:30:00+0100")
        self.request3 = create_request(102, self.user, start="2020-12-24T19:30:00+0100")

        self.video1 = create_video(200, self.request1)
        self.video2 = create_video(201, self.request2)
        self.video2.additional_data = {
            "aired": [
                "2020-01-12",
                "2019-11-25",
                "2020-10-25",
                "2018-05-19",
                "2020-07-14",
            ]
        }
        self.video2.save()
        self.video3 = create_video(202, self.request3)
        self.video3.additional_data = {
            "aired": [
                "2019-03-03",
                "2020-04-04",
                "2018-02-02",
            ],
            "length": 152,
        }
        self.video3.save()

    def test_request_filtering_by_date(self):
        response = self.client.get(f"{self.url}?from_date=2020-07-07")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["results"][0]["title"], self.request2.title)
        self.assertEqual(response.data["results"][1]["title"], self.request3.title)

        response = self.client.get(f"{self.url}?to_date=2020-12-23")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["results"][0]["title"], self.request1.title)
        self.assertEqual(response.data["results"][1]["title"], self.request2.title)

        response = self.client.get(
            f"{self.url}?from_date=2020-07-07&to_date=2020-12-23"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], self.request2.title)

    def test_video_filtering_by_date(self):
        # Note: Videos are sorted descending on Request start_datetime
        response = self.client.get(f"{self.url}/videos?from_date=2020-07-07")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["results"][0]["title"], self.video3.title)
        self.assertEqual(response.data["results"][1]["title"], self.video2.title)

        response = self.client.get(f"{self.url}/videos?to_date=2020-12-23")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["results"][0]["title"], self.video2.title)
        self.assertEqual(response.data["results"][1]["title"], self.video1.title)

        response = self.client.get(
            f"{self.url}/videos?from_date=2020-07-07&to_date=2020-12-23"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], self.video2.title)

    def test_video_filtering_by_length(self):
        response = self.client.get(f"{self.url}/videos?length=152")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], self.video3.title)

        response = self.client.get(f"{self.url}/videos?length=60")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_video_filtering_by_last_aired_date(self):
        response = self.client.get(f"{self.url}/videos?last_aired=never")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], self.video1.title)

        response = self.client.get(f"{self.url}/videos?last_aired=2020-05-10")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], self.video3.title)

        response = self.client.get(f"{self.url}/videos?last_aired=2020-11-01")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["results"][0]["title"], self.video3.title)
        self.assertEqual(response.data["results"][1]["title"], self.video2.title)

    def test_video_filtering_by_last_aired_date_invalid_filter(self):
        response = self.client.get(f"{self.url}/videos?last_aired=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data["last_aired"][0], "Invalid filter.")

from freezegun import freeze_time
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from tests.helpers.users_test_utils import create_user, get_default_password
from tests.helpers.video_requests_test_utils import (
    create_rating,
    create_request,
    create_video,
)
from video_requests.models import Request


@freeze_time("2020-11-21 18:30:00", tz_offset=+1)
class StatisticsAPITestCase(APITestCase):
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
        self.url = "/api/v1/admin/statistics/requests"

        self.admin = create_user(is_admin=True)
        self.staff = create_user(is_staff=True)
        self.user = create_user()

        # Requests before 2020-11-01
        # Requested status
        create_request(
            100, self.user, Request.Statuses.REQUESTED, start="2020-10-16T20:00:00+0100"
        )
        create_request(
            101, self.user, Request.Statuses.REQUESTED, start="2020-10-22T20:00:00+0100"
        )
        # In progress (between Accepted and Archived)
        create_request(
            102, self.user, Request.Statuses.UPLOADED, start="2020-10-05T20:00:00+0100"
        )
        # Completed (Done)
        create_request(
            103, self.user, Request.Statuses.DONE, start="2020-10-10T20:00:00+0100"
        )
        create_request(
            104, self.user, Request.Statuses.DONE, start="2020-10-30T20:00:00+0100"
        )
        create_request(
            105, self.user, Request.Statuses.DONE, start="2020-10-08T20:00:00+0100"
        )
        # Upcoming (Accepted)
        self.upcoming1 = create_request(
            106, self.user, Request.Statuses.ACCEPTED, start="2020-10-29T20:00:00+0100"
        )
        self.upcoming2 = create_request(
            107, self.user, Request.Statuses.ACCEPTED, start="2020-10-02T20:00:00+0100"
        )

        # Requests between 2020-11-01 and 2020-12-01
        # Requested status
        create_request(
            200, self.user, Request.Statuses.REQUESTED, start="2020-11-16T20:00:00+0100"
        )
        create_request(
            201, self.user, Request.Statuses.REQUESTED, start="2020-11-22T20:00:00+0100"
        )
        # In progress (between Accepted and Archived)
        create_request(
            202, self.user, Request.Statuses.UPLOADED, start="2020-11-05T20:00:00+0100"
        )
        create_request(
            203, self.user, Request.Statuses.RECORDED, start="2020-11-10T20:00:00+0100"
        )
        create_request(
            204, self.user, Request.Statuses.ARCHIVED, start="2020-11-30T20:00:00+0100"
        )
        # Completed (Done)
        create_request(
            205, self.user, Request.Statuses.DONE, start="2020-11-08T20:00:00+0100"
        )
        # Upcoming (Accepted)
        self.upcoming3 = create_request(
            206, self.user, Request.Statuses.ACCEPTED, start="2020-11-29T20:00:00+0100"
        )
        self.upcoming4 = create_request(
            207, self.user, Request.Statuses.ACCEPTED, start="2020-11-02T20:00:00+0100"
        )

        # Requests after 2020-12-01
        # Requested status
        create_request(
            300, self.user, Request.Statuses.REQUESTED, start="2020-12-16T20:00:00+0100"
        )
        create_request(
            301, self.user, Request.Statuses.REQUESTED, start="2020-12-22T20:00:00+0100"
        )
        create_request(
            302, self.user, Request.Statuses.REQUESTED, start="2020-12-05T20:00:00+0100"
        )
        # In progress (between Accepted and Archived)
        create_request(
            303, self.user, Request.Statuses.RECORDED, start="2020-12-10T20:00:00+0100"
        )
        create_request(
            304, self.user, Request.Statuses.ARCHIVED, start="2020-12-30T20:00:00+0100"
        )
        # Completed (Done)
        create_request(
            305, self.user, Request.Statuses.DONE, start="2020-12-08T20:00:00+0100"
        )
        # Upcoming (Accepted)
        self.upcoming5 = create_request(
            306, self.user, Request.Statuses.ACCEPTED, start="2020-12-29T20:00:00+0100"
        )
        self.upcoming6 = create_request(
            307, self.user, Request.Statuses.ACCEPTED, start="2020-12-02T20:00:00+0100"
        )

        # Videos before 2020-11-01
        self.video1 = create_video(400, self.upcoming2)
        self.video2 = create_video(401, self.upcoming2)
        self.video3 = create_video(402, self.upcoming2)  # No related rating

        # Video1 ratings - Avg: 4.3
        create_rating(500, self.video1, self.user, 5)
        create_rating(501, self.video1, self.staff, 4)
        create_rating(502, self.video1, self.admin, 4)

        # Video2 ratings - Avg: 3.3
        create_rating(503, self.video2, self.user, 3)
        create_rating(504, self.video2, self.staff, 3)
        create_rating(505, self.video2, self.admin, 4)

        # Videos between 2020-11-01 and 2020-12-01
        self.video4 = create_video(403, self.upcoming4)
        self.video5 = create_video(404, self.upcoming4)
        self.video6 = create_video(405, self.upcoming4)  # No related rating

        # Video4 ratings - Avg: 5.0
        create_rating(506, self.video4, self.user, 5)
        create_rating(507, self.video4, self.staff, 5)
        create_rating(508, self.video4, self.admin, 5)

        # Video5 ratings - Avg: 2.0
        create_rating(509, self.video5, self.user, 2)
        create_rating(510, self.video5, self.staff, 1)
        create_rating(511, self.video5, self.admin, 3)

        # Videos after 2020-12-01
        self.video7 = create_video(406, self.upcoming6)
        self.video8 = create_video(407, self.upcoming6)
        self.video9 = create_video(408, self.upcoming6)  # No related rating

        # Video7 ratings - Avg: 4.0
        create_rating(512, self.video7, self.user, 4)
        create_rating(513, self.video7, self.staff, 4)
        create_rating(514, self.video7, self.admin, 4)

        # Video8 ratings - Avg: 3.6
        create_rating(515, self.video8, self.user, 5)
        create_rating(516, self.video8, self.staff, 3)
        create_rating(517, self.video8, self.admin, 3)

    def assert_all_fields_present(self, response):
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("new_requests", response.data)
        self.assertIn("in_progress_requests", response.data)
        self.assertIn("completed_requests", response.data)
        self.assertIn("upcoming_requests", response.data)
        self.assertIn("best_videos", response.data)

    def assert_all_values_right(self, response):
        self.assertEqual(response.data["new_requests"], 4)
        self.assertEqual(response.data["in_progress_requests"], 6)
        self.assertEqual(response.data["completed_requests"], 4)
        self.assertLessEqual(len(response.data["upcoming_requests"]), 5)
        self.assertLessEqual(len(response.data["best_videos"]), 5)

        # Upcoming requests should be ordered by start_datetime
        self.assertEqual(len(response.data["upcoming_requests"]), 3)
        self.assertEqual(
            response.data["upcoming_requests"][0]["title"], self.upcoming3.title
        )
        self.assertEqual(
            response.data["upcoming_requests"][1]["title"], self.upcoming6.title
        )
        self.assertEqual(
            response.data["upcoming_requests"][2]["title"], self.upcoming5.title
        )

        # Best videos should be ordered by best average rating
        self.assertEqual(len(response.data["best_videos"]), 4)
        self.assertEqual(response.data["best_videos"][0]["title"], self.video4.title)
        self.assertEqual(response.data["best_videos"][1]["title"], self.video1.title)
        self.assertEqual(response.data["best_videos"][2]["title"], self.video2.title)
        self.assertEqual(response.data["best_videos"][3]["title"], self.video5.title)

    def test_request_statistics_works_for_admin(self):
        self.authorize_user(self.admin)
        response = self.client.get(self.url)
        self.assert_all_fields_present(response)
        self.assert_all_values_right(response)

    def test_request_statistics_works_for_staff(self):
        self.authorize_user(self.staff)
        response = self.client.get(self.url)
        self.assert_all_fields_present(response)
        self.assert_all_values_right(response)

    def test_request_statistics_not_available_for_user(self):
        self.authorize_user(self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_request_statistics_not_available_for_anonymous(self):
        self.client.credentials()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_request_statistics_filter_errors(self):
        self.authorize_user(self.admin)

        response = self.client.get(f"{self.url}?from_date=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(f"{self.url}?to_date=randomText")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "Invalid filter.")

        response = self.client.get(
            f"{self.url}?from_date=2020-11-21&to_date=2020-11-01"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data[0], "From date must be earlier than to date.")

    def test_request_statistics_filter_works(self):
        self.authorize_user(self.admin)

        """
        From filter
        """
        response = self.client.get(f"{self.url}?from_date=2020-11-01")
        self.assert_all_fields_present(response)
        self.assertEqual(response.data["new_requests"], 4)
        self.assertEqual(response.data["in_progress_requests"], 3)
        self.assertEqual(response.data["completed_requests"], 1)
        self.assertLessEqual(len(response.data["upcoming_requests"]), 5)
        self.assertLessEqual(len(response.data["best_videos"]), 5)
        self.assertEqual(len(response.data["upcoming_requests"]), 3)
        self.assertEqual(
            response.data["upcoming_requests"][0]["title"], self.upcoming3.title
        )
        self.assertEqual(
            response.data["upcoming_requests"][1]["title"], self.upcoming6.title
        )
        self.assertEqual(
            response.data["upcoming_requests"][2]["title"], self.upcoming5.title
        )
        self.assertEqual(len(response.data["best_videos"]), 2)
        self.assertEqual(response.data["best_videos"][0]["title"], self.video4.title)
        self.assertEqual(response.data["best_videos"][1]["title"], self.video5.title)

        """
        To filter
        """
        response = self.client.get(f"{self.url}?to_date=2020-11-01")
        self.assert_all_fields_present(response)
        self.assertEqual(response.data["new_requests"], 5)
        self.assertEqual(response.data["in_progress_requests"], 3)
        self.assertEqual(response.data["completed_requests"], 3)
        self.assertLessEqual(len(response.data["upcoming_requests"]), 5)
        self.assertLessEqual(len(response.data["best_videos"]), 5)
        self.assertEqual(len(response.data["upcoming_requests"]), 4)
        self.assertEqual(
            response.data["upcoming_requests"][0]["title"], self.upcoming4.title
        )
        self.assertEqual(
            response.data["upcoming_requests"][1]["title"], self.upcoming3.title
        )
        self.assertEqual(
            response.data["upcoming_requests"][2]["title"], self.upcoming6.title
        )
        self.assertEqual(
            response.data["upcoming_requests"][3]["title"], self.upcoming5.title
        )
        self.assertEqual(len(response.data["best_videos"]), 2)
        self.assertEqual(response.data["best_videos"][0]["title"], self.video1.title)
        self.assertEqual(response.data["best_videos"][1]["title"], self.video2.title)

        """
        From and to filter
        """
        response = self.client.get(
            f"{self.url}?from_date=2020-11-01&to_date=2020-12-31"
        )
        self.assert_all_fields_present(response)
        self.assertEqual(response.data["new_requests"], 0)
        self.assertEqual(response.data["in_progress_requests"], 9)
        self.assertEqual(response.data["completed_requests"], 2)
        self.assertLessEqual(len(response.data["upcoming_requests"]), 5)
        self.assertLessEqual(len(response.data["best_videos"]), 5)
        self.assertEqual(len(response.data["upcoming_requests"]), 0)
        self.assertEqual(len(response.data["best_videos"]), 4)
        self.assertEqual(response.data["best_videos"][0]["title"], self.video4.title)
        self.assertEqual(response.data["best_videos"][1]["title"], self.video7.title)
        self.assertEqual(response.data["best_videos"][2]["title"], self.video8.title)
        self.assertEqual(response.data["best_videos"][3]["title"], self.video5.title)

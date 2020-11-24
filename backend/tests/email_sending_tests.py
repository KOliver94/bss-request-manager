from io import StringIO
from unittest.mock import patch

from django.conf import settings
from django.core import mail
from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse
from freezegun import freeze_time
from rest_framework import status
from rest_framework.test import APITestCase
from tests.helpers.users_test_utils import create_user, get_default_password
from tests.helpers.video_requests_test_utils import (
    create_crew,
    create_request,
    create_video,
)
from video_requests.emails import (
    email_crew_daily_reminder,
    email_production_manager_unfinished_requests,
    email_responsible_overdue_request,
    email_staff_weekly_tasks,
)
from video_requests.models import Request, Video


@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class EmailSendingTestCase(APITestCase):
    """
    IMPORTANT: You need to run "python manage.py collectstatic" before running this test case!
    """

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

        # Create special users
        self.editor_in_chief = create_user(is_staff=True, groups=["FOSZERKESZTO"])
        self.production_manager = create_user(is_staff=True, groups=["GYARTASVEZETO"])
        self.pr_responsible = create_user(is_staff=True, groups=["PR"])

    def test_new_request_confirmation_email_sent_to_logged_in_user(self):
        # Create a Request with logged in user
        self.authorize_user(self.normal_user)
        data = {
            "title": "Test Request",
            "start_datetime": "2020-11-08T10:30:00+01:00",
            "end_datetime": "2020-11-09T10:30:00+01:00",
            "place": "Test place",
            "type": "Test type",
        }
        response = self.client.post("/api/v1/requests", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(self.normal_user.email, mail.outbox[0].to)
        self.assertIn(self.editor_in_chief.email, mail.outbox[0].bcc)
        self.assertIn(settings.DEFAULT_REPLY_EMAIL, mail.outbox[0].reply_to)
        self.assertEqual(
            mail.outbox[0].subject, f"{data['title']} | Forgatási felkérésedet fogadtuk"
        )

    def test_new_request_confirmation_email_sent_to_anonymous(self):
        # Create a Request without login
        data = {
            "title": "Test Request",
            "start_datetime": "2020-11-08T10:30:00+01:00",
            "end_datetime": "2020-11-09T10:30:00+01:00",
            "place": "Test place",
            "type": "Test type",
            "requester_first_name": "Test",
            "requester_last_name": "User",
            "requester_email": "test.user@example.com",
            "requester_mobile": "+36509999999",
            "comment_text": "Additional information",
        }
        response = self.client.post("/api/v1/requests", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(data["requester_email"], mail.outbox[0].to)
        self.assertIn(self.editor_in_chief.email, mail.outbox[0].bcc)
        self.assertIn(settings.DEFAULT_REPLY_EMAIL, mail.outbox[0].reply_to)
        self.assertEqual(
            mail.outbox[0].subject, f"{data['title']} | Forgatási felkérésedet fogadtuk"
        )

    def test_video_published_email_sent_to_user(self):
        # Setup data - Create a Request with status 4, and a video
        request = create_request(100, self.normal_user, Request.Statuses.UPLOADED)
        video = create_video(300, request, Video.Statuses.PENDING)

        # Video data to be patched
        data = {
            "editor_id": self.staff_user.id,
            "additional_data": {
                "editing_done": True,
                "coding": {"website": True},
                "publishing": {"website": "https://example.com"},
            },
        }

        # Authorized staff user and update video data
        self.authorize_user(self.staff_user)
        response = self.client.patch(
            f"/api/v1/admin/requests/{request.id}/videos/{video.id}", data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(self.normal_user.email, mail.outbox[0].to)
        self.assertIn(self.pr_responsible.email, mail.outbox[0].bcc)
        self.assertIn(settings.DEFAULT_REPLY_EMAIL, mail.outbox[0].reply_to)
        self.assertEqual(
            mail.outbox[0].subject, f"{video.request.title} | Új videót publikáltunk"
        )

    def test_new_comment_email_sent_to_user_and_crew_admin_endpoint_non_internal(self):
        # Setup data - Create a Request, add Crew members and Responsible
        request = create_request(100, self.normal_user)
        crew_member1 = create_user(is_staff=True)
        crew_member2 = create_user(is_staff=True)
        responsible = create_user(is_staff=True)
        create_crew(200, request, crew_member1, "Cameraman")
        create_crew(201, request, crew_member2, "Reporter")
        request.responsible = responsible
        request.save()

        # New comment data
        data = {"text": "New comment", "internal": False}

        # Authorized staff user and create new comment
        self.authorize_user(self.staff_user)
        response = self.client.post(
            f"/api/v1/admin/requests/{request.id}/comments", data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 2)
        # User e-mail
        self.assertIn(self.normal_user.email, mail.outbox[0].to)
        self.assertIn(settings.DEFAULT_REPLY_EMAIL, mail.outbox[0].reply_to)
        self.assertEqual(
            mail.outbox[0].subject, f"{request.title} | Hozzászólás érkezett"
        )
        # Crew e-mail
        self.assertIn(crew_member1.email, mail.outbox[1].to)
        self.assertIn(crew_member2.email, mail.outbox[1].to)
        self.assertIn(responsible.email, mail.outbox[1].cc)
        self.assertIn(self.editor_in_chief.email, mail.outbox[1].cc)
        self.assertEqual(
            mail.outbox[1].subject, f"{request.title} | Hozzászólás érkezett"
        )

    def test_new_comment_email_sent_to_crew_admin_endpoint_internal(self):
        # Setup data - Create a Request, add Crew members and Responsible
        request = create_request(100, self.normal_user)
        crew_member1 = create_user(is_staff=True)
        crew_member2 = create_user(is_staff=True)
        responsible = create_user(is_staff=True)
        create_crew(200, request, crew_member1, "Cameraman")
        create_crew(201, request, crew_member2, "Reporter")
        request.responsible = responsible
        request.save()

        # New comment data
        data = {"text": "New comment", "internal": True}

        # Authorized staff user and create new comment
        self.authorize_user(self.staff_user)
        response = self.client.post(
            f"/api/v1/admin/requests/{request.id}/comments", data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertNotIn(self.normal_user.email, mail.outbox[0].to)
        self.assertNotIn(self.normal_user.email, mail.outbox[0].cc)
        self.assertNotIn(self.normal_user.email, mail.outbox[0].bcc)
        self.assertIn(crew_member1.email, mail.outbox[0].to)
        self.assertIn(crew_member2.email, mail.outbox[0].to)
        self.assertIn(responsible.email, mail.outbox[0].cc)
        self.assertIn(self.editor_in_chief.email, mail.outbox[0].cc)
        self.assertEqual(
            mail.outbox[0].subject, f"{request.title} | Hozzászólás érkezett"
        )

    def test_new_comment_email_not_sent_to_banned_user_admin_endpoint(self):
        # Setup data - Create a Request, add Crew members and Responsible
        banned_user = create_user(groups=["Banned"])
        request = create_request(100, banned_user)

        # New comment data
        data = {"text": "New comment", "internal": False}

        # Authorized staff user and create new comment
        self.authorize_user(self.staff_user)
        response = self.client.post(
            f"/api/v1/admin/requests/{request.id}/comments", data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertNotIn(banned_user.email, mail.outbox[0].to)
        self.assertNotIn(banned_user.email, mail.outbox[0].cc)
        self.assertNotIn(banned_user.email, mail.outbox[0].bcc)

    def test_new_comment_email_sent_to_crew_default_endpoint(self):
        # Setup data - Create a Request, add Crew members and Responsible
        request = create_request(100, self.normal_user)
        crew_member1 = create_user(is_staff=True)
        crew_member2 = create_user(is_staff=True)
        responsible = create_user(is_staff=True)
        create_crew(200, request, crew_member1, "Cameraman")
        create_crew(201, request, crew_member2, "Reporter")
        request.responsible = responsible
        request.save()

        # New comment data
        data = {
            "text": "New comment",
        }

        # Authorized staff user and create new comment
        self.authorize_user(self.normal_user)
        response = self.client.post(f"/api/v1/requests/{request.id}/comments", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertNotIn(self.normal_user.email, mail.outbox[0].to)
        self.assertNotIn(self.normal_user.email, mail.outbox[0].cc)
        self.assertNotIn(self.normal_user.email, mail.outbox[0].bcc)
        self.assertIn(crew_member1.email, mail.outbox[0].to)
        self.assertIn(crew_member2.email, mail.outbox[0].to)
        self.assertIn(responsible.email, mail.outbox[0].cc)
        self.assertIn(self.editor_in_chief.email, mail.outbox[0].cc)
        self.assertEqual(
            mail.outbox[0].subject, f"{request.title} | Hozzászólás érkezett"
        )

    """
    SCHEDULED TASKS
    Management commands will be called manually for the tests.
    In production use it is done by Celery Beat
    """

    @freeze_time("2020-11-19 10:20:30", tz_offset=+1, as_kwarg="frozen_time")
    @patch(
        "video_requests.emails.email_staff_weekly_tasks", wraps=email_staff_weekly_tasks
    )
    def test_weekly_staff_email_sending(
        self, mock_email_staff_weekly_tasks, frozen_time
    ):
        # Create test Requests - Recording
        # Should be included
        rec1 = create_request(100, self.normal_user, start="2020-11-16T04:16:13+0100")
        rec2 = create_request(
            101,
            self.normal_user,
            Request.Statuses.ACCEPTED,
            start="2020-11-21T21:41:57+0100",
        )
        # Should not be included
        rec3 = create_request(
            102, self.normal_user, start="2020-11-15T10:01:24+0100"
        )  # previous week
        rec4 = create_request(
            103, self.normal_user, start="2020-11-24T17:22:05+0100"
        )  # next week
        rec5 = create_request(
            104,
            self.normal_user,
            Request.Statuses.EDITED,
            start="2020-11-20T14:55:45+0100",
        )  # this week but wrong status

        # Create test Requests - Editing
        # Should be included
        edit1 = create_request(110, self.normal_user, Request.Statuses.RECORDED)
        edit2 = create_request(111, self.normal_user, Request.Statuses.UPLOADED)
        create_video(211, edit2, Video.Statuses.PENDING)
        # Should not be included
        edit3 = create_request(
            112, self.normal_user, Request.Statuses.EDITED
        )  # later status
        edit4 = create_request(
            113, self.normal_user, Request.Statuses.RECORDED
        )  # good status but wrong status video
        create_video(213, edit4, Video.Statuses.EDITED)
        edit5 = create_request(
            114, self.normal_user, Request.Statuses.EDITED
        )  # wrong status but good status video
        create_video(214, edit5, Video.Statuses.PENDING)

        """
        Case 1: Successful e-mail sending
        """
        # Call management command
        with StringIO() as out:
            call_command("email_weekly_tasks", stdout=out)
            self.assertEqual(
                out.getvalue(), "Weekly tasks email was sent successfully.\n"
            )

        # Check if fuction was called with correct parameters
        mock_email_staff_weekly_tasks.assert_called_once()

        self.assertEqual(len(mock_email_staff_weekly_tasks.call_args.args[0]), 2)
        self.assertIn(rec1, mock_email_staff_weekly_tasks.call_args.args[0])
        self.assertIn(rec2, mock_email_staff_weekly_tasks.call_args.args[0])
        self.assertNotIn(rec3, mock_email_staff_weekly_tasks.call_args.args[0])
        self.assertNotIn(rec4, mock_email_staff_weekly_tasks.call_args.args[0])
        self.assertNotIn(rec5, mock_email_staff_weekly_tasks.call_args.args[0])

        self.assertEqual(len(mock_email_staff_weekly_tasks.call_args.args[1]), 2)
        self.assertIn(edit1, mock_email_staff_weekly_tasks.call_args.args[1])
        self.assertIn(edit2, mock_email_staff_weekly_tasks.call_args.args[1])
        self.assertNotIn(edit3, mock_email_staff_weekly_tasks.call_args.args[1])
        self.assertNotIn(edit4, mock_email_staff_weekly_tasks.call_args.args[1])
        self.assertNotIn(edit5, mock_email_staff_weekly_tasks.call_args.args[1])

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(settings.WEEKLY_TASK_EMAIL, mail.outbox[0].to)
        self.assertEqual(mail.outbox[0].subject, "Eheti forgatások és vágandó anyagok")

        """
        Case 2: No Request for the week.
        """
        # Change time to next month
        frozen_time.move_to("2020-12-21 10:20:30")

        # Change editing objects
        edit1.status = Request.Statuses.EDITED
        edit1.save()
        edit2.status = Request.Statuses.ARCHIVED
        edit2.save()

        # Call management command
        with StringIO() as out:
            call_command("email_weekly_tasks", stdout=out)
            self.assertEqual(out.getvalue(), "No tasks for this week.\n")

    @freeze_time("2020-11-19 10:20:30", tz_offset=+1, as_kwarg="frozen_time")
    @patch(
        "video_requests.emails.email_crew_daily_reminder",
        wraps=email_crew_daily_reminder,
    )
    def test_daily_reminder_email_sent_to_crew(
        self, mock_email_crew_daily_reminder, frozen_time
    ):
        # Create test Requests
        with_crew = create_request(
            100, self.normal_user, start="2020-11-19T18:00:00+0100"
        )
        without_crew = create_request(
            101, self.normal_user, start="2020-11-19T20:00:00+0100"
        )
        crew1 = create_crew(201, with_crew, self.staff_user, "Cameraman")
        crew2 = create_crew(202, with_crew, self.editor_in_chief, "Reporter")

        """
        Case 1: Successful e-mail sending
        """
        # Call management command
        with StringIO() as out:
            call_command("email_daily_reminders", stdout=out)
            self.assertEqual(
                out.getvalue(),
                "1 reminders were sent to crew members. There are 2 request(s) today.\n",
            )

        # Check if function was called with correct parameters
        mock_email_crew_daily_reminder.assert_called_once()

        self.assertEqual(with_crew, mock_email_crew_daily_reminder.call_args.args[0])
        self.assertNotEquals(
            without_crew, mock_email_crew_daily_reminder.call_args.args[0]
        )

        self.assertIn(crew1, mock_email_crew_daily_reminder.call_args.args[1])
        self.assertIn(crew2, mock_email_crew_daily_reminder.call_args.args[1])

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(crew1.member.email, mail.outbox[0].to)
        self.assertIn(crew2.member.email, mail.outbox[0].to)
        self.assertEqual(
            mail.outbox[0].subject, f"Emlékeztető | {with_crew.title} | Mai forgatás"
        )

        """
        Case 2: No Request for today
        """
        # Change time to next day
        frozen_time.move_to("2020-11-20 10:20:30")

        # Call management command
        with StringIO() as out:
            call_command("email_daily_reminders", stdout=out)
            self.assertEqual(out.getvalue(), "No reminders for today.\n")

    @patch(
        "video_requests.emails.email_production_manager_unfinished_requests",
        wraps=email_production_manager_unfinished_requests,
    )
    def test_unfinished_requests_email_sent_to_production_manager(
        self, mock_email_production_manager_unfinished_requests
    ):
        # Setup test Requests
        not_incl_1 = create_request(100, self.normal_user, Request.Statuses.ACCEPTED)
        not_incl_2 = create_request(101, self.normal_user, Request.Statuses.UPLOADED)
        not_incl_3 = create_request(102, self.normal_user, Request.Statuses.DONE)
        incl_1 = create_request(103, self.normal_user, Request.Statuses.EDITED)
        incl_2 = create_request(104, self.normal_user, Request.Statuses.ARCHIVED)

        """
        Case 1: Some unfinished Requests
        """

        # Call management command
        with StringIO() as out:
            call_command("email_unfinished_requests", stdout=out)
            self.assertEqual(
                out.getvalue(), "Unfinished requests email was sent successfully.\n"
            )

        # Check if function was called with correct parameters
        mock_email_production_manager_unfinished_requests.assert_called_once()

        self.assertEqual(
            len(mock_email_production_manager_unfinished_requests.call_args.args[0]), 2
        )
        self.assertIn(
            incl_1, mock_email_production_manager_unfinished_requests.call_args.args[0]
        )
        self.assertIn(
            incl_2, mock_email_production_manager_unfinished_requests.call_args.args[0]
        )
        self.assertNotIn(
            not_incl_1,
            mock_email_production_manager_unfinished_requests.call_args.args[0],
        )
        self.assertNotIn(
            not_incl_2,
            mock_email_production_manager_unfinished_requests.call_args.args[0],
        )
        self.assertNotIn(
            not_incl_3,
            mock_email_production_manager_unfinished_requests.call_args.args[0],
        )

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(self.production_manager.email, mail.outbox[0].to)
        self.assertEqual(mail.outbox[0].subject, "Lezáratlan anyagok")

        """
        Case 2: No unfinished Request
        """
        # Delete the included Requests
        incl_1.delete()
        incl_2.delete()

        # Reset mock
        mock_email_production_manager_unfinished_requests.reset_mock()

        # Call management command
        with StringIO() as out:
            call_command("email_unfinished_requests", stdout=out)
            self.assertEqual(out.getvalue(), "All requests are finished.\n")

        # Check if function was called with correct parameters
        mock_email_production_manager_unfinished_requests.assert_not_called()

    @freeze_time("2020-11-19 10:20:30", tz_offset=+1)
    @patch(
        "video_requests.emails.email_responsible_overdue_request",
        wraps=email_responsible_overdue_request,
    )
    def test_overdue_requests_email_sent_to_editor_in_chief_and_production_manager(
        self, mock_email_responsible_overdue_request
    ):
        # Setup test objects
        new_staff_member = create_user(is_staff=True)
        overdue1 = create_request(
            100, self.normal_user, start="2020-10-05T18:00:00+0100"
        )
        overdue2 = create_request(
            101,
            self.normal_user,
            Request.Statuses.UPLOADED,
            start="2020-09-29T15:30:00+0100",
        )
        create_request(
            102,
            self.normal_user,
            Request.Statuses.ARCHIVED,
            start="2020-09-29T15:30:00+0100",
        )
        create_request(
            103,
            self.normal_user,
            Request.Statuses.UPLOADED,
            start="2020-11-05T21:00:00+0100",
        )

        # Set responsible for overdue Requests
        overdue1.responsible = self.staff_user
        overdue1.save()
        overdue2.responsible = new_staff_member
        overdue2.save()

        """
        Case 1: Some overdue Requests
        """
        # Call management command
        with StringIO() as out:
            call_command("email_overdue_requests", stdout=out)
            self.assertEqual(
                out.getvalue(),
                f"Overdue request email was sent successfully. ({overdue1.title})\nOverdue request email was sent successfully. ({overdue2.title})\n",
            )

        # Check if function was called with correct parameters
        mock_email_responsible_overdue_request.assert_called()
        self.assertEqual(mock_email_responsible_overdue_request.call_count, 2)

        # Check if e-mail was sent to the right people
        self.assertEqual(len(mail.outbox), 2)
        self.assertIn(self.staff_user.email, mail.outbox[0].to)
        self.assertIn(self.production_manager.email, mail.outbox[0].cc)
        self.assertIn(self.editor_in_chief.email, mail.outbox[0].cc)
        self.assertEqual(
            mail.outbox[0].subject, f"Lejárt határidejű felkérés - {overdue1.title}"
        )

        self.assertIn(new_staff_member.email, mail.outbox[1].to)
        self.assertIn(self.production_manager.email, mail.outbox[1].cc)
        self.assertIn(self.editor_in_chief.email, mail.outbox[1].cc)
        self.assertEqual(
            mail.outbox[1].subject, f"Lejárt határidejű felkérés - {overdue2.title}"
        )

        """
        Case 2: No overdue Request until today
        """
        # Change the previous Request statuses
        overdue1.status = Request.Statuses.EDITED
        overdue1.save()
        overdue2.status = Request.Statuses.DONE
        overdue2.save()

        # Reset mock
        mock_email_responsible_overdue_request.reset_mock()

        # Call management command
        with StringIO() as out:
            call_command("email_overdue_requests", stdout=out)
            self.assertEqual(
                out.getvalue(),
                "No overdue request was found.\n",
            )

        # Check if function was called with correct parameters
        mock_email_responsible_overdue_request.assert_not_called()

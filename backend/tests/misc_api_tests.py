from django.core import mail
from django.test import override_settings
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from tests.helpers.users_test_utils import create_user, get_default_password


class MiscAPITestCase(APITestCase):
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

        # Create staff user
        self.admin_user = create_user(is_admin=True)

    """
    POST /api/v1/misc/contact
    """

    contact_data = {
        "name": "Joe Bloggs",
        "email": "joe@example.com",
        "message": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere tempus nibh et lobortis.",
        "recaptcha": "randomReCaptchaResponseToken",
    }

    def call_contact_api_assert_success(self):
        response = self.client.post("/api/v1/misc/contact", self.contact_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        mail.outbox.clear()

    @override_settings(DRF_RECAPTCHA_TESTING_PASS=True)
    @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
    def test_contact_message_success(self):
        self.call_contact_api_assert_success()

        self.authorize_user(self.normal_user)
        self.call_contact_api_assert_success()

        self.authorize_user(self.staff_user)
        self.call_contact_api_assert_success()

        self.authorize_user(self.admin_user)
        self.call_contact_api_assert_success()

    def call_contact_api_assert_fail(self):
        response = self.client.post("/api/v1/misc/contact", self.contact_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["recaptcha"][0],
            "Error verifying reCAPTCHA, please try again.",
        )

    @override_settings(DRF_RECAPTCHA_TESTING_PASS=False)
    def test_contact_message_fail_invalid_captcha(self):
        self.call_contact_api_assert_fail()

        self.authorize_user(self.normal_user)
        self.call_contact_api_assert_fail()

        self.authorize_user(self.staff_user)
        self.call_contact_api_assert_fail()

        self.authorize_user(self.admin_user)
        self.call_contact_api_assert_fail()

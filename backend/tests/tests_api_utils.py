from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status


@override_settings(
    AUTHENTICATION_BACKENDS=("django.contrib.auth.backends.ModelBackend",)
)
class UtilitiesTestCase(TestCase):
    def test_api_jwt(self):
        url = reverse("login_obtain_jwt_pair")

        # Create inactive user
        u = User.objects.create_user(
            username="user", email="user@foo.com", password="pass"
        )
        u.is_active = False
        u.save()

        # Try login with e-mail - Should return error
        resp = self.client.post(
            url, {"email": "user@foo.com", "password": "pass"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        # Try login with username (still inactive) - Should return error
        resp = self.client.post(
            url, {"username": "user", "password": "pass"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        # Set user to active
        u.is_active = True
        u.save()

        # Try login with active profile - Should return the JWT token
        resp = self.client.post(
            url, {"username": "user", "password": "pass"}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue("access" in resp.data)
        self.assertTrue("refresh" in resp.data)

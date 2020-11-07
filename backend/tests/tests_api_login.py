from time import sleep

from django.contrib.auth.models import Group, User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken
from tests.video_requests_test_utils import create_request

PASSWORD = "password"


class LoginAPITestCase(APITestCase):
    def test_login(self):
        url = reverse("login_obtain_jwt_pair")

        # Create inactive user
        u = User.objects.create_user(
            username="user", email="user@foo.com", password=PASSWORD
        )
        u.is_active = False
        u.save()

        # Try login with e-mail - Should return error
        resp = self.client.post(
            url, {"email": u.email, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        # Try login with username (still inactive) - Should return error
        resp = self.client.post(
            url, {"username": u.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        # Set user to active
        u.is_active = True
        u.save()

        # Try login with active profile - Should return the JWT token
        resp = self.client.post(
            url, {"username": u.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue("access" in resp.data)
        self.assertTrue("refresh" in resp.data)

    def test_token_refresh(self):
        login_url = reverse("login_obtain_jwt_pair")
        refresh_url = reverse("login_refresh_jwt_token")

        # Create a user
        u = User.objects.create_user(
            username="user", email="user@foo.com", password=PASSWORD
        )
        u.save()

        # Create test request for the user
        r = create_request(101, u)

        # Login and check all data is present
        resp = self.client.post(
            login_url, {"username": u.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue("access" in resp.data)
        self.assertTrue("refresh" in resp.data)

        # Set access token
        access_token = resp.data["access"]
        refresh_token = resp.data["refresh"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Check if token works and user can access request
        resp = self.client.get("/api/v1/requests/" + str(r.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Wait for the token to expire
        sleep(10)

        # The user should not be able to get the request because of the expired token
        resp = self.client.get("/api/v1/requests/" + str(r.id))
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resp.data["code"], "token_not_valid")

        # Use the refresh token for new access token
        resp = self.client.post(refresh_url, {"refresh": refresh_token}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue("access" in resp.data)
        self.assertTrue("refresh" in resp.data)
        self.assertNotEqual(resp.data["access"], access_token)
        self.assertNotEqual(resp.data["refresh"], refresh_token)

        # Set the new access token
        access_token = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        # Check if token work and user can access request
        resp = self.client.get("/api/v1/requests/" + str(r.id))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # The previous refresh token should be blacklisted
        resp = self.client.post(refresh_url, {"refresh": refresh_token}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resp.data["detail"], "Token is blacklisted")

    def test_logout(self):
        login_url = reverse("login_obtain_jwt_pair")
        refresh_url = reverse("login_refresh_jwt_token")
        logout_url = reverse("logout")

        # Create a user
        u = User.objects.create_user(
            username="user", email="user@foo.com", password=PASSWORD
        )
        u.save()

        # Login and check all data is present
        resp = self.client.post(
            login_url, {"username": u.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue("access" in resp.data)
        self.assertTrue("refresh" in resp.data)

        # Set tokens
        access_token = resp.data["access"]
        refresh_token = resp.data["refresh"]

        # Try to logout without token in header
        resp = self.client.post(logout_url, {"refresh": refresh_token}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            resp.data["detail"], "Authentication credentials were not provided."
        )

        # Set Header and try again
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        resp = self.client.post(logout_url, {"refresh": refresh_token}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_205_RESET_CONTENT)

        # Try to get new access token with blacklisted refresh token
        resp = self.client.post(refresh_url, {"refresh": refresh_token}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resp.data["detail"], "Token is blacklisted")

    def test_logout_other_account(self):
        login_url = reverse("login_obtain_jwt_pair")
        logout_url = reverse("logout")

        # Create two users
        u1 = User.objects.create_user(
            username="user1", email="user1@foo.com", password=PASSWORD
        )
        u1.save()
        u2 = User.objects.create_user(
            username="user2", email="user2@foo.com", password=PASSWORD
        )
        u2.save()

        # Login to both users
        resp_u1 = self.client.post(
            login_url, {"username": u1.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp_u1.status_code, status.HTTP_200_OK)
        resp_u2 = self.client.post(
            login_url, {"username": u2.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp_u2.status_code, status.HTTP_200_OK)

        # Set tokens
        access_token_u1 = resp_u1.data["access"]
        refresh_token_u2 = resp_u2.data["refresh"]

        # When the user tries to logout using another user's refresh token an error should occur
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token_u1}")
        resp = self.client.post(
            logout_url, {"refresh": refresh_token_u2}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(resp.data["detail"], "Token is invalid or expired")

    def test_custom_jwt_claims(self):
        login_url = reverse("login_obtain_jwt_pair")

        # Create a group
        g = Group.objects.get_or_create(name="Test Group")[0]

        # Create a user
        u = User.objects.create_user(
            username="user",
            email="user@foo.com",
            password=PASSWORD,
            first_name="Test",
            last_name="User",
        )
        u.groups.add(g)
        u.save()
        u.userprofile.avatar_url = "https://via.placeholder.com/150"
        u.save()

        # Login
        resp = self.client.post(
            login_url, {"username": u.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Check if token contains all custom information
        token = AccessToken(resp.data["access"])
        self.assertEqual(token.payload["name"], u.last_name + " " + u.first_name)
        self.assertEqual(token.payload["role"], "user")
        self.assertEqual(token.payload["groups"][0], g.name)
        self.assertEqual(token.payload["avatar"], u.userprofile.avatar_url)

        # Set user as staff member
        u.is_staff = True
        u.save()

        # Get new token with new role
        resp = self.client.post(
            login_url, {"username": u.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Check if token contains all custom information
        token = AccessToken(resp.data["access"])
        self.assertEqual(token.payload["role"], "staff")

        # Set user admin
        u.is_superuser = True
        u.save()

        # Get new token with new role
        resp = self.client.post(
            login_url, {"username": u.username, "password": PASSWORD}, format="json"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Check if token contains all custom information
        token = AccessToken(resp.data["access"])
        self.assertEqual(token.payload["role"], "admin")

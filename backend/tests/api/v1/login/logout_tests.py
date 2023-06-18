import pytest
from rest_framework.exceptions import ErrorDetail
from rest_framework.reverse import reverse
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED

pytestmark = pytest.mark.django_db


def test_logout(api_client, basic_user):
    login_url = reverse("api:v1:login:obtain_jwt_pair")
    refresh_url = reverse("api:v1:login:refresh_jwt_token")
    logout_url = reverse("api:v1:login:logout")

    # Login
    response = api_client.post(
        login_url,
        {"username": basic_user.username, "password": "password"},
        format="json",
    )
    assert response.status_code == HTTP_200_OK

    # Set token
    access_token = response.data["access"]
    refresh_token = response.data["refresh"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Logout
    response = api_client.post(logout_url, {"refresh": refresh_token}, format="json")
    assert response.status_code == HTTP_200_OK

    # Try to get new access token with blacklisted refresh token
    response = api_client.post(refresh_url, {"refresh": refresh_token}, format="json")
    assert response.status_code == HTTP_401_UNAUTHORIZED
    assert response.data["detail"] == ErrorDetail(
        string="Token is blacklisted", code="token_not_valid"
    )


def test_token_blacklist_not_authenticated(api_client, basic_user):
    login_url = reverse("api:v1:login:obtain_jwt_pair")
    logout_url = reverse("api:v1:login:logout")

    # Login
    response = api_client.post(
        login_url,
        {"username": basic_user.username, "password": "password"},
        format="json",
    )
    assert response.status_code == HTTP_200_OK

    refresh_token = response.data["refresh"]

    # Try to log out without token in header (not authenticated user)
    response = api_client.post(logout_url, {"refresh": refresh_token}, format="json")
    assert response.status_code == HTTP_401_UNAUTHORIZED


def test_token_blacklist_other_user(api_client, basic_user, staff_user):
    login_url = reverse("api:v1:login:obtain_jwt_pair")
    logout_url = reverse("api:v1:login:logout")

    # Login as basic user
    response = api_client.post(
        login_url,
        {"username": basic_user.username, "password": "password"},
        format="json",
    )
    assert response.status_code == HTTP_200_OK

    # Save refresh token
    refresh_token = response.data["refresh"]

    # Login as staff user
    response = api_client.post(
        login_url,
        {"username": staff_user.username, "password": "password"},
        format="json",
    )
    assert response.status_code == HTTP_200_OK

    # Set token
    access_token = response.data["access"]
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

    # Try to log out with basic user's refresh token
    response = api_client.post(logout_url, {"refresh": refresh_token}, format="json")
    assert response.status_code == HTTP_401_UNAUTHORIZED
    assert response.data["detail"] == ErrorDetail(
        string="Token is invalid or expired", code="not_authenticated"
    )

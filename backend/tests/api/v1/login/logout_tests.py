import pytest
from rest_framework.exceptions import ErrorDetail
from rest_framework.reverse import reverse
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

pytestmark = pytest.mark.django_db


def test_logout(api_client, basic_user):
    refresh_url = reverse("api:v1:login:refresh_jwt_token")
    logout_url = reverse("api:v1:login:logout")

    # Create and set tokens
    refresh_token = RefreshToken.for_user(basic_user)
    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {str(refresh_token.access_token)}"
    )

    # Logout
    response = api_client.post(
        logout_url, {"refresh": str(refresh_token)}, format="json"
    )
    assert response.status_code == HTTP_200_OK

    # Try to get new access token with blacklisted refresh token
    response = api_client.post(
        refresh_url, {"refresh": str(refresh_token)}, format="json"
    )
    assert response.status_code == HTTP_401_UNAUTHORIZED
    assert response.data["detail"] == ErrorDetail(
        string="Token is blacklisted", code="token_not_valid"
    )


def test_token_blacklist_not_authenticated(api_client, basic_user):
    logout_url = reverse("api:v1:login:logout")

    # Create token
    refresh_token = RefreshToken.for_user(basic_user)

    # Try to log out without token in header (not authenticated user)
    response = api_client.post(
        logout_url, {"refresh": str(refresh_token)}, format="json"
    )
    assert response.status_code == HTTP_401_UNAUTHORIZED


def test_token_blacklist_other_user(api_client, basic_user, staff_user):
    logout_url = reverse("api:v1:login:logout")

    # Create token for basic user
    refresh_token = RefreshToken.for_user(basic_user)

    # Login as staff user
    access_token = AccessToken.for_user(staff_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(access_token)}")

    # Try to log out with basic user's refresh token
    response = api_client.post(
        logout_url, {"refresh": str(refresh_token)}, format="json"
    )
    assert response.status_code == HTTP_401_UNAUTHORIZED
    assert response.data["detail"] == ErrorDetail(
        string="Token is invalid or expired", code="not_authenticated"
    )

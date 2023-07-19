from django.contrib.auth.models import User
from model_bakery import baker
from rest_framework.authtoken.models import Token
from rest_framework.reverse import reverse


def assert_fields_exist(response, expected_fields):
    # Check if all expected fields are in the response and no other
    assert all(field in response for field in expected_fields)
    assert all(field in expected_fields for field in response)


def authorize(client, user):
    token = Token.objects.get_or_create(user=user)[0]
    client.credentials(HTTP_AUTHORIZATION=f"Token {token}")


def do_login(api_client, request, user, token=False):
    if user:
        user = request.getfixturevalue(user)
        if token:
            authorize(api_client, user)
        else:
            login(api_client, user)
    else:
        user = baker.make(User)
    return user


def get_response(api_client, method, url, data):
    if method == "GET":
        return api_client.get(url)
    elif method == "DELETE":
        return api_client.delete(url)
    elif method == "PATCH":
        return api_client.patch(url, data)
    elif method == "POST":
        return api_client.post(url, data)
    else:  # PUT
        return api_client.put(url, data)


def login(client, user):
    url = reverse("api:v1:login:obtain_jwt_pair")
    response = client.post(
        url,
        {"username": user.username, "password": "password"},
        format="json",
    )
    token = response.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

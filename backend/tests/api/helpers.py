from rest_framework.reverse import reverse


def login(client, user):
    url = reverse("login_obtain_jwt_pair")
    resp = client.post(
        url,
        {"username": user.username, "password": "password"},
        format="json",
    )
    token = resp.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

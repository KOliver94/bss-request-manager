from rest_framework.reverse import reverse


def login(client, user):
    url = reverse("api:v1:login_obtain_jwt_pair")
    resp = client.post(
        url,
        {"username": user.username, "password": "password"},
        format="json",
    )
    token = resp.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")


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

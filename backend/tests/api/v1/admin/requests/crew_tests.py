from random import randint

import pytest
from django.contrib.auth.models import User
from model_bakery import baker
from rest_framework.reverse import reverse
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
    is_success,
)

from tests.api.helpers import login
from video_requests.models import CrewMember

pytestmark = pytest.mark.django_db


def assert_response_keys(crew):
    assert "id" in crew
    assert "member" in crew
    assert "position" in crew

    member = crew.get("member")
    assert member is not None
    assert "avatar_url" in member
    assert "full_name" in member
    assert "id" in member


@pytest.fixture
def crew_member_data(staff_user):
    return {"member": staff_user.id, "position": "Tester"}


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_200_OK),
        ("staff_user", HTTP_200_OK),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
def test_list_crew(api_client, expected, request, user):
    video_request = baker.make("video_requests.Request")
    crew = baker.make("video_requests.CrewMember", request=video_request, _quantity=5)

    if user:
        user = request.getfixturevalue(user)
        login(api_client, user)

    url = reverse("admin-crew-list-create", kwargs={"request_id": video_request.id})
    response = api_client.get(url)

    assert response.status_code == expected

    if is_success(response.status_code):
        assert len(response.data) == len(crew)
        for crew_member in response.data:
            assert_response_keys(crew_member)


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_201_CREATED),
        ("staff_user", HTTP_201_CREATED),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
def test_create_crew_member(
    api_client, crew_member_data, expected, request, staff_user, user
):
    video_request = baker.make("video_requests.Request")

    if user:
        user = request.getfixturevalue(user)
        login(api_client, user)

    url = reverse("admin-crew-list-create", kwargs={"request_id": video_request.id})
    response = api_client.post(url, crew_member_data)

    assert response.status_code == expected

    if is_success(response.status_code):
        assert_response_keys(response.data)

        assert (
            response.data["member"]["avatar_url"] == staff_user.userprofile.avatar_url
        )
        assert (
            response.data["member"]["full_name"]
            == staff_user.get_full_name_eastern_order()
        )
        assert response.data["member"]["id"] == staff_user.id

        response = api_client.get(url)

        assert response.status_code == HTTP_200_OK
        assert len(response.data) == 1


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_404_NOT_FOUND),
        ("staff_user", HTTP_404_NOT_FOUND),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
@pytest.mark.parametrize("method", ["GET", "POST"])
def test_list_create_crew_error(
    api_client,
    crew_member_data,
    expected,
    method,
    not_existing_request_id,
    request,
    user,
):
    video_request = baker.make("video_requests.Request")
    baker.make("video_requests.CrewMember", request=video_request, _quantity=5)

    if user:
        user = request.getfixturevalue(user)
        login(api_client, user)

    url = reverse(
        "admin-crew-list-create", kwargs={"request_id": not_existing_request_id}
    )

    if method == "GET":
        response = api_client.get(url)
    else:  # POST
        response = api_client.post(url, crew_member_data)

    assert response.status_code == expected


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_200_OK),
        ("staff_user", HTTP_200_OK),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
def test_detail_crew_member(api_client, expected, request, user):
    video_request = baker.make("video_requests.Request")
    crew = baker.make("video_requests.CrewMember", request=video_request, _quantity=5)

    if user:
        user = request.getfixturevalue(user)
        login(api_client, user)

    url = reverse(
        "admin-crew-detail-update-delete",
        kwargs={"request_id": video_request.id, "pk": crew[0].id},
    )
    response = api_client.get(url)

    assert response.status_code == expected

    if is_success(response.status_code):
        assert_response_keys(response.data)


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_200_OK),
        ("staff_user", HTTP_200_OK),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
@pytest.mark.parametrize("method", ["PATCH", "PUT"])
def test_update_crew_member(
    api_client, crew_member_data, expected, method, request, staff_user, user
):
    video_request = baker.make("video_requests.Request")
    crew_member = baker.make("video_requests.CrewMember", request=video_request)

    if user:
        user = request.getfixturevalue(user)
        login(api_client, user)

    assert crew_member.member != staff_user
    assert crew_member.position != crew_member_data["position"]

    url = reverse(
        "admin-crew-detail-update-delete",
        kwargs={"request_id": video_request.id, "pk": crew_member.id},
    )

    if method == "PATCH":
        response = api_client.patch(url, crew_member_data)
    else:  # PUT
        response = api_client.put(url, crew_member_data)

    assert response.status_code == expected

    if is_success(response.status_code):
        assert_response_keys(response.data)

        assert response.data["member"]["id"] == crew_member_data["member"]
        assert response.data["position"] == crew_member_data["position"]


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_204_NO_CONTENT),
        ("staff_user", HTTP_204_NO_CONTENT),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
def test_delete_crew_member(api_client, expected, request, user):
    video_request = baker.make("video_requests.Request")
    crew = baker.make("video_requests.CrewMember", request=video_request, _quantity=5)

    if user:
        user = request.getfixturevalue(user)
        login(api_client, user)

    url = reverse(
        "admin-crew-detail-update-delete",
        kwargs={"request_id": video_request.id, "pk": crew[0].id},
    )
    response = api_client.delete(url)

    assert response.status_code == expected


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_404_NOT_FOUND),
        ("staff_user", HTTP_404_NOT_FOUND),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
@pytest.mark.parametrize("method", ["GET", "DELETE", "PATCH", "PUT"])
def test_detail_update_delete_crew_member_error(
    api_client,
    crew_member_data,
    expected,
    method,
    not_existing_request_id,
    request,
    user,
):
    def get_response():
        if method == "GET":
            return api_client.get(url)
        elif method == "DELETE":
            return api_client.delete(url)
        elif method == "PATCH":
            return api_client.patch(url, crew_member_data)
        else:  # PUT
            return api_client.put(url, crew_member_data)

    def get_not_existing_crew_member_id():
        while True:
            non_existing_id = randint(1000, 100000)
            if not CrewMember.objects.filter(pk=non_existing_id).exists():
                return non_existing_id

    video_requests = baker.make("video_requests.Request", _quantity=2)
    crew_member = baker.make("video_requests.CrewMember", request=video_requests[0])

    if user:
        user = request.getfixturevalue(user)
        login(api_client, user)

    # Existing request with not existing crew member
    url = reverse(
        "admin-crew-detail-update-delete",
        kwargs={
            "request_id": video_requests[0].id,
            "pk": get_not_existing_crew_member_id(),
        },
    )
    response = get_response()

    assert response.status_code == expected

    # Not existing request with existing crew member
    url = reverse(
        "admin-crew-detail-update-delete",
        kwargs={"request_id": not_existing_request_id, "pk": crew_member.id},
    )
    response = get_response()

    assert response.status_code == expected

    # Not existing request with not existing crew member
    url = reverse(
        "admin-crew-detail-update-delete",
        kwargs={
            "request_id": not_existing_request_id,
            "pk": get_not_existing_crew_member_id(),
        },
    )
    response = get_response()

    assert response.status_code == expected


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_400_BAD_REQUEST),
        ("staff_user", HTTP_400_BAD_REQUEST),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
@pytest.mark.parametrize("method", ["PATCH", "POST", "PUT"])
def test_create_update_crew_member_invalid_member(
    api_client,
    expected,
    method,
    request,
    user,
):
    def get_not_existing_user_id():
        while True:
            non_existing_id = randint(1000, 100000)
            if not User.objects.filter(pk=non_existing_id).exists():
                return non_existing_id

    data = {"member": get_not_existing_user_id(), "position": "Failure"}

    video_request = baker.make("video_requests.Request")
    crew_member = baker.make("video_requests.CrewMember", request=video_request)

    if user:
        user = request.getfixturevalue(user)
        login(api_client, user)

    if method == "POST":
        url = reverse("admin-crew-list-create", kwargs={"request_id": video_request.id})
        response = api_client.post(url, data)
    else:
        url = reverse(
            "admin-crew-detail-update-delete",
            kwargs={"request_id": video_request.id, "pk": crew_member.id},
        )
        if method == "PATCH":
            response = api_client.patch(url, data)
        else:  # PUT
            response = api_client.put(url, data)

    assert response.status_code == expected

    if response.status_code == "401":
        assert response.data["member"][0].code == "does_not_exist"

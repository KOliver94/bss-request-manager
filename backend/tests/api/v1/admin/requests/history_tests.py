from datetime import timedelta, timezone
from time import sleep

import pytest
from django.contrib.auth.models import User
from django.utils.timezone import localtime
from model_bakery import baker
from rest_framework.reverse import reverse
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    is_success,
)

from tests.api.helpers import assert_fields_exist, do_login

pytestmark = pytest.mark.django_db


def assert_response(history, fields_changed, new_values, old_values, user):
    assert_fields_exist(history, ["changes", "date", "user"])

    assert len(history["changes"]) == len(fields_changed)
    assert all(
        field in [change["field"] for change in history["changes"]]
        for field in fields_changed
    )
    assert all(change["field"] in fields_changed for change in history["changes"])

    for change in history["changes"]:
        assert_fields_exist(change, ["field", "new", "old"])

        field = change["field"]
        if field.endswith("datetime"):
            new_value = str(new_values[field].astimezone(timezone.utc))
            old_value = str(old_values[field].astimezone(timezone.utc))
        else:
            new_value = (
                str(new_values[field])
                if new_values[field] is not None
                else new_values[field]
            )
            old_value = (
                str(old_values[field])
                if old_values[field] is not None
                else old_values[field]
            )
        assert change["new"] == new_value
        assert change["old"] == old_value

    if history["user"]:
        assert_fields_exist(history["user"], ["avatar_url", "full_name", "id"])

        assert history["user"]["avatar_url"] == user.userprofile.avatar_url
        assert history["user"]["full_name"] == user.get_full_name_eastern_order()
        assert history["user"]["id"] == user.id


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_200_OK),
        ("staff_user", HTTP_200_OK),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
@pytest.mark.parametrize("scenario", ["api", "model"])
def test_list_comment_history(api_client, expected, request, scenario, user):
    video_request = baker.make("video_requests.Request")
    user = do_login(api_client, request, user)

    if user:
        comment = baker.make(
            "video_requests.Comment", author=user, internal=False, request=video_request
        )
    else:
        comment = baker.make(
            "video_requests.Comment", internal=False, request=video_request
        )

    original_text = comment.text

    url = reverse(
        "api:v1:admin:request:comment-detail",
        kwargs={"request_pk": video_request.id, "pk": comment.id},
    )

    # Change one field
    changes_1 = {"text": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
    if scenario == "api":
        api_client.patch(url, changes_1)
    else:
        comment.text = changes_1["text"]
        comment.save()

    sleep(0.25)

    # Change multiple fields
    changes_2 = {
        "internal": True,
        "text": "Cras purus elit, dictum ut dolor facilisis, ultrices tempus diam.",
    }
    if scenario == "api":
        api_client.patch(url, changes_2)
    else:
        comment.internal = changes_2["internal"]
        comment.text = changes_2["text"]
        comment.save()

    sleep(0.25)

    # Don't change any fields just save/patch with same data
    if scenario == "api":
        api_client.patch(url, changes_2)
    else:
        comment.save()

    url = reverse(
        "api:v1:admin:request:comment-history",
        kwargs={"request_pk": video_request.id, "pk": comment.id},
    )
    response = api_client.get(url)

    assert response.status_code == expected

    if is_success(response.status_code):
        assert len(response.data) == 2

        # Latest history event
        assert_response(
            response.data[0],
            ["internal", "text"],
            changes_2,
            changes_1 | {"internal": False},
            user,
        )

        # Oldest history event
        assert_response(
            response.data[1], ["text"], changes_1, {"text": original_text}, user
        )


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_200_OK),
        ("staff_user", HTTP_200_OK),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
@pytest.mark.parametrize("scenario", ["api", "model"])
def test_list_rating_history(api_client, expected, request, scenario, user):
    video_request = baker.make("video_requests.Request")
    video = baker.make("video_requests.Video", request=video_request)
    user = do_login(api_client, request, user)

    if user:
        rating = baker.make("video_requests.Rating", author=user, rating=1, video=video)
    else:
        rating = baker.make("video_requests.Rating", rating=1, video=video)

    original_review = rating.review

    url = reverse(
        "api:v1:admin:request:video:rating-detail",
        kwargs={"request_pk": video_request.id, "video_pk": video.id, "pk": rating.id},
    )

    # Change one field
    changes_1 = {"review": "Duis hendrerit in ipsum et faucibus."}
    if scenario == "api":
        api_client.patch(url, changes_1)
    else:
        rating.review = changes_1["review"]
        rating.save()

    sleep(0.25)

    # Change multiple fields
    changes_2 = {
        "rating": 5,
        "review": "Praesent a malesuada ligula, a sagittis justo.",
    }
    if scenario == "api":
        api_client.patch(url, changes_2)
    else:
        rating.rating = changes_2["rating"]
        rating.review = changes_2["review"]
        rating.save()

    sleep(0.25)

    # Don't change any fields just save/patch with same data
    if scenario == "api":
        api_client.patch(url, changes_2)
    else:
        rating.save()

    url = reverse(
        "api:v1:admin:request:video:rating-history",
        kwargs={"request_pk": video_request.id, "video_pk": video.id, "pk": rating.id},
    )
    response = api_client.get(url)

    assert response.status_code == expected

    if is_success(response.status_code):
        assert len(response.data) == 2

        # Latest history event
        assert_response(
            response.data[0],
            ["rating", "review"],
            changes_2,
            changes_1 | {"rating": 1},
            user,
        )

        # Oldest history event
        assert_response(
            response.data[1], ["review"], changes_1, {"review": original_review}, user
        )


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_200_OK),
        ("staff_user", HTTP_200_OK),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
@pytest.mark.parametrize("scenario", ["api", "model"])
def test_list_request_history(api_client, expected, request, scenario, user):
    video_request = baker.make("video_requests.Request")
    test_user = baker.make(User, is_staff=True, _fill_optional=["email"])
    user = do_login(api_client, request, user)

    original_data = {
        "additional_data": video_request.additional_data,
        "deadline": video_request.deadline,
        "end_datetime": video_request.end_datetime,
        "place": video_request.place,
        "requester": video_request.requester.id,
        "responsible": video_request.responsible,
        "start_datetime": video_request.start_datetime,
        "title": video_request.title,
        "type": video_request.type,
    }

    url = reverse(
        "api:v1:admin:request-detail",
        kwargs={"pk": video_request.id},
    )

    # Change one field
    changes_1 = {"title": "Phasellus auctor eros id diam venenatis volutpat."}
    if scenario == "api":
        api_client.patch(url, changes_1)
    else:
        video_request.title = changes_1["title"]
        video_request.save()

    sleep(0.25)

    # Change multiple fields
    changes_2 = {
        "additional_data": {"recording": {"path": "example.com"}},
        "deadline": (localtime() + timedelta(days=5)).date(),
        "end_datetime": localtime() + timedelta(days=1, hours=3),
        "place": "Test place",
        "requester": test_user.id,
        "responsible": test_user.id,
        "start_datetime": localtime() + timedelta(days=1),
        "title": "Morbi non augue augue.",
        "type": "Test type",
    }
    if scenario == "api":
        api_client.patch(url, changes_2)
    else:
        video_request.additional_data = changes_2["additional_data"]
        video_request.deadline = changes_2["deadline"]
        video_request.end_datetime = changes_2["end_datetime"]
        video_request.place = changes_2["place"]
        video_request.requester = User.objects.get(pk=changes_2["requester"])
        video_request.responsible = User.objects.get(pk=changes_2["responsible"])
        video_request.start_datetime = changes_2["start_datetime"]
        video_request.title = changes_2["title"]
        video_request.type = changes_2["type"]
        video_request.save()

    sleep(0.25)

    # Remove responsible
    changes_3 = {"responsible": None}
    if scenario == "api":
        api_client.patch(url, changes_3)
    else:
        video_request.responsible = None
        video_request.save()

    sleep(0.25)

    # Don't change any fields just save/patch with same data
    if scenario == "api":
        api_client.patch(url, changes_3)
    else:
        video_request.save()

    url = reverse(
        "api:v1:admin:request-history",
        kwargs={"pk": video_request.id},
    )
    response = api_client.get(url)

    assert response.status_code == expected

    if is_success(response.status_code):
        assert len(response.data) == 3

        # Latest history event
        assert_response(
            response.data[0],
            ["responsible"],
            changes_3,
            {"responsible": changes_2["responsible"]},
            user,
        )

        assert_response(
            response.data[1],
            [
                "additional_data",
                "deadline",
                "end_datetime",
                "place",
                "requester",
                "responsible",
                "start_datetime",
                "title",
                "type",
            ],
            changes_2,
            original_data | changes_1,
            user,
        )

        # Oldest history event
        assert_response(
            response.data[2],
            ["title"],
            changes_1,
            {"title": original_data["title"]},
            user,
        )


@pytest.mark.parametrize(
    "user,expected",
    [
        ("admin_user", HTTP_200_OK),
        ("staff_user", HTTP_200_OK),
        ("basic_user", HTTP_403_FORBIDDEN),
        (None, HTTP_401_UNAUTHORIZED),
    ],
)
@pytest.mark.parametrize("scenario", ["api", "model"])
def test_list_video_history(api_client, expected, request, scenario, user):
    video_request = baker.make("video_requests.Request")
    video = baker.make("video_requests.Video", request=video_request)
    test_user = baker.make(User, is_staff=True, _fill_optional=["email"])
    user = do_login(api_client, request, user)

    original_data = {
        "additional_data": video.additional_data,
        "editor": video.editor,
        "title": video.title,
    }

    url = reverse(
        "api:v1:admin:request:video-detail",
        kwargs={"request_pk": video_request.id, "pk": video.id},
    )

    # Change one field
    changes_1 = {"title": "Aliquam erat volutpat."}
    if scenario == "api":
        api_client.patch(url, changes_1)
    else:
        video.title = changes_1["title"]
        video.save()

    sleep(0.25)

    # Change multiple fields
    changes_2 = {
        "additional_data": {"length": 123},
        "editor": test_user.id,
        "title": "Aenean accumsan, velit vehicula laoreet maximus.",
    }
    if scenario == "api":
        api_client.patch(url, changes_2)
    else:
        video.additional_data = changes_2["additional_data"]
        video.editor = User.objects.get(pk=changes_2["editor"])
        video.title = changes_2["title"]
        video.save()

    sleep(0.25)

    # Remove editor
    changes_3 = {"editor": None}
    if scenario == "api":
        api_client.patch(url, changes_3)
    else:
        video.editor = None
        video.save()

    sleep(0.25)

    # Don't change any fields just save/patch with same data
    if scenario == "api":
        api_client.patch(url, changes_3)
    else:
        video.save()

    url = reverse(
        "api:v1:admin:request:video-history",
        kwargs={"request_pk": video_request.id, "pk": video.id},
    )
    response = api_client.get(url)

    assert response.status_code == expected

    if is_success(response.status_code):
        assert len(response.data) == 3

        # Latest history event
        assert_response(
            response.data[0],
            ["editor"],
            changes_3,
            {"editor": changes_2["editor"]},
            user,
        )

        assert_response(
            response.data[1],
            ["additional_data", "editor", "title"],
            changes_2,
            original_data | changes_1,
            user,
        )

        # Oldest history event
        assert_response(
            response.data[2],
            ["title"],
            changes_1,
            {"title": original_data["title"]},
            user,
        )

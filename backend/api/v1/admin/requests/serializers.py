from collections import abc

from django.contrib.auth.models import User
from django.http import Http404
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from rest_framework.fields import IntegerField
from rest_framework.generics import get_object_or_404

from api.v1.admin.requests.ratings.serializers import RatingAdminListRetrieveSerializer
from api.v1.users.serializers import UserSerializer
from video_requests.models import Request, Video
from video_requests.utilities import update_video_status


def get_user_by_id(user_id, user_type):
    if user_id:
        try:
            return get_object_or_404(User, pk=user_id)
        except Http404:
            raise ValidationError(
                {f"{user_type}_id": "Not found user with the provided ID."}
            )
    else:
        User.objects.none()


def get_editor_from_id(validated_data):
    if "editor_id" in validated_data:
        validated_data["editor"] = get_user_by_id(
            validated_data.pop("editor_id"), "editor"
        )


def check_and_remove_unauthorized_additional_data(additional_data, user, original_data):
    """Remove keys and values which are used by other functions and should be changed only by authorized users"""
    additional_data.pop("requester", None)
    if "publishing" in additional_data:
        additional_data["publishing"].pop("email_sent_to_user", None)
    if not user.is_admin:
        additional_data.pop("status_by_admin", None)
        additional_data.pop("accepted", None)
        additional_data.pop("canceled", None)
        additional_data.pop("failed", None)
        additional_data.pop("calendar_id", None)
    else:
        if "status_by_admin" in additional_data:
            """
            Do not need to check whether other fields exists because validation schema makes
            both status and admin_id required at save.
            """
            if (
                original_data
                and (
                    "status_by_admin" in original_data.additional_data
                    and original_data.additional_data["status_by_admin"].get("status")
                    == additional_data["status_by_admin"].get("status")
                )
                or (
                    "status_by_admin" not in original_data.additional_data
                    and not additional_data["status_by_admin"].get("status")
                )
            ):
                additional_data.pop("status_by_admin")
            else:
                additional_data["status_by_admin"].update({"admin_id": user.id})
                additional_data["status_by_admin"].update(
                    {"admin_name": user.get_full_name_eastern_order()}
                )
    return additional_data


def update_additional_data(orig_dict, new_dict):
    """
    Update existing additional data.
    Replaces/extends changed keys and removes them if None is provided.
    Takes care of nested dictionaries.
    """
    for key, value in new_dict.items():
        if isinstance(value, abc.Mapping):
            orig_dict[key] = update_additional_data(orig_dict.get(key, {}), value)
        # Currently, there is only one list in additional_data which needs to be replaced every time
        # to be able to delete from it. If there will be a list which will only be extended use this function.
        # elif isinstance(value, list):
        #     orig_dict[key] = orig_dict.get(key, []) + value
        else:
            if value is None:
                orig_dict.pop(key, None)
            else:
                orig_dict[key] = new_dict[key]
    return orig_dict


def handle_additional_data(validated_data, user, original_data=None):
    if "additional_data" in validated_data:
        validated_data[
            "additional_data"
        ] = check_and_remove_unauthorized_additional_data(
            validated_data["additional_data"], user, original_data
        )
        if original_data:
            validated_data["additional_data"] = update_additional_data(
                original_data.additional_data, validated_data["additional_data"]
            )
    return validated_data


class HistoricalRecordField(serializers.ListField):
    child = serializers.DictField()

    def to_representation(self, data):
        return super().to_representation(data.values())


class HistorySerializer(serializers.Serializer):
    history = HistoricalRecordField(read_only=True)


class VideoRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = ("id", "title", "start_datetime", "end_datetime")
        read_only_fields = ("id", "title", "start_datetime", "end_datetime")


class VideoAdminSerializer(serializers.ModelSerializer):
    ratings = RatingAdminListRetrieveSerializer(many=True, read_only=True)
    editor = UserSerializer(read_only=True)
    editor_id = IntegerField(write_only=True, required=False, allow_null=True)
    avg_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Video
        fields = (
            "id",
            "title",
            "editor",
            "status",
            "additional_data",
            "ratings",
            "editor_id",
            "avg_rating",
        )
        read_only_fields = (
            "id",
            "editor",
            "status",
            "ratings",
            "avg_rating",
        )
        write_only_fields = ("editor_id",)

    def create(self, validated_data):
        get_editor_from_id(validated_data)
        handle_additional_data(validated_data, self.context["request"].user)
        video = super().create(validated_data)
        update_video_status(video)
        return video

    def update(self, instance, validated_data):
        get_editor_from_id(validated_data)
        handle_additional_data(validated_data, self.context["request"].user, instance)
        video = super().update(instance, validated_data)
        update_video_status(video)
        return video


class VideoAdminListSerializer(VideoAdminSerializer):
    request = VideoRequestSerializer(read_only=True)

    class Meta:
        model = Video
        fields = (
            "id",
            "title",
            "editor",
            "status",
            "additional_data",
            "request",
            "avg_rating",
        )
        read_only_fields = (
            "id",
            "title",
            "editor",
            "status",
            "additional_data",
            "request",
            "avg_rating",
        )

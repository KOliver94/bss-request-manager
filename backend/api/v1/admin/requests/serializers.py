from collections import abc

from api.v1.users.serializers import UserSerializer
from common.utilities import create_calendar_event, update_calendar_event
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import CharField, IntegerField
from rest_framework.generics import get_object_or_404
from video_requests.emails import email_crew_new_comment, email_user_new_comment
from video_requests.models import Comment, CrewMember, Rating, Request, Video
from video_requests.utilities import update_request_status, update_video_status


def get_user_by_id(user_id):
    if user_id:
        return get_object_or_404(User, pk=user_id)
    else:
        User.objects.none()


def get_editor_from_id(validated_data):
    if "editor_id" in validated_data:
        validated_data["editor"] = get_user_by_id(validated_data.pop("editor_id"))


def get_responsible_from_id(validated_data):
    if "responsible_id" in validated_data:
        validated_data["responsible"] = get_user_by_id(
            validated_data.pop("responsible_id")
        )


def get_member_from_id(validated_data):
    if "member_id" in validated_data:
        validated_data["member"] = get_user_by_id(validated_data.pop("member_id"))


def check_and_remove_unauthorized_additional_data(additional_data, user, original_data):
    """ Remove keys and values which are used by other functions and should be changed only by authorized users """
    if "requester" in additional_data:
        additional_data.pop("requester")
    if not user.is_superuser:
        if "status_by_admin" in additional_data:
            additional_data.pop("status_by_admin")
        if "accepted" in additional_data:
            additional_data.pop("accepted")
        if "canceled" in additional_data:
            additional_data.pop("canceled")
        if "failed" in additional_data:
            additional_data.pop("failed")
        if "calendar_id" in additional_data:
            additional_data.pop("calendar_id")
    else:
        if "status_by_admin" in additional_data:
            """
            Do not need to check whether other fields exists because validation schema makes
            both status and admin_id required at save.
            """
            if (
                original_data
                and "status_by_admin" in original_data.additional_data
                and original_data.additional_data["status_by_admin"]["status"]
                is additional_data["status_by_admin"]["status"]
            ):
                additional_data.pop("status_by_admin")
            else:
                additional_data["status_by_admin"].update({"admin_id": user.id})
    return additional_data


def update_additional_data(orig_dict, new_dict):
    """ Update existing additional data. Only replaces/extends changed keys. Takes care of nested dictionaries. """
    for key, value in new_dict.items():
        if isinstance(value, abc.Mapping):
            orig_dict[key] = update_additional_data(orig_dict.get(key, {}), value)
        elif isinstance(value, list):
            orig_dict[key] = orig_dict.get(key, []) + value
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


class RatingAdminSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = (
            "id",
            "created",
            "author",
            "rating",
            "review",
        )
        read_only_fields = (
            "id",
            "created",
            "author",
        )


class CommentAdminSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "created",
            "author",
            "text",
            "internal",
        )
        read_only_fields = (
            "id",
            "created",
            "author",
        )

    def create(self, validated_data):
        comment = super(CommentAdminSerializer, self).create(validated_data)
        if not comment.internal and comment.request.requester.is_active:
            email_user_new_comment.delay(comment.id)
        email_crew_new_comment.delay(comment.id)
        return comment


class VideoAdminSerializer(serializers.ModelSerializer):
    ratings = RatingAdminSerializer(many=True, read_only=True)
    editor = UserSerializer(read_only=True)
    editor_id = IntegerField(write_only=True, required=False, allow_null=True)

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
        )
        read_only_fields = (
            "id",
            "editor",
            "status",
            "ratings",
        )
        write_only_fields = ("editor_id",)

    def create(self, validated_data):
        get_editor_from_id(validated_data)
        handle_additional_data(validated_data, self.context["request"].user)
        video = super(VideoAdminSerializer, self).create(validated_data)
        update_video_status(video)
        return video

    def update(self, instance, validated_data):
        get_editor_from_id(validated_data)
        handle_additional_data(validated_data, self.context["request"].user, instance)
        video = super(VideoAdminSerializer, self).update(instance, validated_data)
        update_video_status(video)
        return video


class CrewMemberAdminSerializer(serializers.ModelSerializer):
    member = UserSerializer(read_only=True)
    member_id = IntegerField(write_only=True, required=True)

    class Meta:
        model = CrewMember
        fields = ("id", "member", "position", "member_id")
        read_only_fields = (
            "id",
            "member",
        )
        write_only_fields = ("member_id",)

    def create(self, validated_data):
        get_member_from_id(validated_data)
        return super(CrewMemberAdminSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        get_member_from_id(validated_data)
        return super(CrewMemberAdminSerializer, self).update(instance, validated_data)


class RequestAdminSerializer(serializers.ModelSerializer):
    crew = CrewMemberAdminSerializer(many=True, read_only=True)
    videos = VideoAdminSerializer(many=True, read_only=True)
    comments = CommentAdminSerializer(many=True, read_only=True)
    requester = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)
    responsible_id = IntegerField(write_only=True, required=False, allow_null=True)
    comment_text = CharField(write_only=True, required=False)

    class Meta:
        model = Request
        fields = (
            "id",
            "title",
            "created",
            "start_datetime",
            "end_datetime",
            "deadline",
            "type",
            "place",
            "status",
            "responsible",
            "requester",
            "additional_data",
            "crew",
            "videos",
            "comments",
            "responsible_id",
            "comment_text",
        )
        read_only_fields = (
            "id",
            "created",
            "status",
            "responsible",
            "requester",
            "requester",
            "crew",
            "videos",
            "comments",
        )
        write_only_fields = (
            "responsible_id",
            "comment_text",
        )

    def create_comment(self, comment_text, request):
        comment = Comment()
        comment.author = self.context["request"].user
        comment.text = comment_text
        comment.request = request
        comment.save()
        return comment

    def create(self, validated_data):
        get_responsible_from_id(validated_data)
        comment_text = (
            validated_data.pop("comment_text")
            if "comment_text" in validated_data
            else None
        )
        handle_additional_data(validated_data, self.context["request"].user)
        request = super(RequestAdminSerializer, self).create(validated_data)
        if comment_text:
            request.comments.add(self.create_comment(comment_text, request))
        update_request_status(request)
        create_calendar_event.delay(request.id)
        return request

    def update(self, instance, validated_data):
        get_responsible_from_id(validated_data)
        validated_data.pop("comment_text") if "comment_text" in validated_data else None
        handle_additional_data(validated_data, self.context["request"].user, instance)
        request = super(RequestAdminSerializer, self).update(instance, validated_data)
        update_request_status(request)
        update_calendar_event.delay(request.id)
        return request

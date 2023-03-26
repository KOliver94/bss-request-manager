from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers
from rest_framework.fields import CharField, EmailField, URLField

from api.v1.requests.serializers import (
    CommentDefaultSerializer,
    VideoDefaultSerializer,
    create_comment,
)
from api.v1.requests.utilities import create_user
from api.v1.users.serializers import UserSerializer
from common.utilities import create_calendar_event
from video_requests.emails import email_user_new_request_confirmation
from video_requests.models import Request


class RequestExternalSerializer(serializers.ModelSerializer):
    videos = VideoDefaultSerializer(many=True, read_only=True)
    comments = CommentDefaultSerializer(many=True, read_only=True)
    requester = UserSerializer(read_only=True)
    requested_by = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)
    comment_text = CharField(write_only=True, required=False, allow_blank=True)
    requester_first_name = CharField(write_only=True)
    requester_last_name = CharField(write_only=True)
    requester_email = EmailField(write_only=True)
    requester_mobile = PhoneNumberField(write_only=True)
    callback_url = URLField(write_only=True)

    class Meta:
        model = Request
        fields = (
            "id",
            "title",
            "created",
            "start_datetime",
            "end_datetime",
            "type",
            "place",
            "status",
            "responsible",
            "requester",
            "requested_by",
            "videos",
            "comments",
            "comment_text",
            "requester_first_name",
            "requester_last_name",
            "requester_email",
            "requester_mobile",
            "callback_url",
        )
        read_only_fields = (
            "id",
            "created",
            "status",
            "responsible",
            "requester",
            "requested_by",
            "videos",
            "comments",
        )
        write_only_fields = (
            "comment_text",
            "requester_first_name",
            "requester_last_name",
            "requester_email",
            "requester_mobile",
            "callback_url",
        )

    def create(self, validated_data):
        comment_text = validated_data.pop("comment_text", None)
        callback_url = validated_data.pop("callback_url")
        validated_data["requester"], additional_data = create_user(validated_data)
        validated_data["requested_by"] = self.context["request"].user
        request = super().create(validated_data)
        if additional_data:
            request.additional_data = additional_data
        if comment_text:
            request.comments.add(create_comment(comment_text, request))
        request.additional_data["external"] = {}
        request.additional_data["external"]["sch_events_callback_url"] = callback_url
        request.save()
        create_calendar_event.delay(request.id)
        email_user_new_request_confirmation.delay(request.id)
        return request

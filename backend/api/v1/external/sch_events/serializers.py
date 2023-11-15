from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.fields import CharField, EmailField, URLField
from rest_framework.serializers import ModelSerializer

from api.v1.requests.utilities import create_user
from common.utilities import create_calendar_event
from video_requests.emails import email_user_new_request_confirmation
from video_requests.models import Comment, Request


class RequestExternalSchEventsCreateSerializer(ModelSerializer):
    callback_url = URLField()
    comment = CharField(allow_blank=True, required=False)
    comment_text = CharField(
        allow_blank=True, required=False
    )  # TODO: Backwards compatibility. Remove later.
    requester_email = EmailField()
    requester_first_name = CharField()
    requester_last_name = CharField()
    requester_mobile = PhoneNumberField()

    class Meta:
        model = Request
        fields = (
            "callback_url",
            "comment",
            "comment_text",  # TODO: Backwards compatibility. Remove later.
            "end_datetime",
            "place",
            "requester_first_name",
            "requester_email",
            "requester_last_name",
            "requester_mobile",
            "start_datetime",
            "title",
            "type",
        )

    @staticmethod
    def create_comment(comment_text, request):
        comment = Comment()
        comment.author = request.requester
        comment.text = comment_text
        comment.request = request
        comment.save()
        return comment

    def create(self, validated_data):
        comment_text = validated_data.pop(
            "comment", validated_data.pop("comment_text", None)
        )  # TODO: Backwards compatibility. Remove comment_text part later.
        callback_url = validated_data.pop("callback_url")
        validated_data["requester"], additional_data = create_user(validated_data)
        validated_data["requested_by"] = self.context["request"].user
        request = super().create(validated_data)
        if additional_data:
            request.additional_data = additional_data
        if comment_text:
            request.comments.add(self.create_comment(comment_text, request))
        request.additional_data["external"] = {}
        request.additional_data["external"]["sch_events_callback_url"] = callback_url
        request.save()
        create_calendar_event.delay(request.id)
        email_user_new_request_confirmation.delay(request.id)
        return request

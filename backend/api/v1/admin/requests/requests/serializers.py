from django.contrib.auth.models import User
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.exceptions import ValidationError
from rest_framework.fields import (
    BooleanField,
    CharField,
    DateField,
    DateTimeField,
    EmailField,
    IntegerField,
    JSONField,
    SerializerMethodField,
)
from rest_framework.relations import PrimaryKeyRelatedField, RelatedField
from rest_framework.serializers import ModelSerializer, Serializer

from api.v1.admin.requests.helpers import (
    get_or_create_requester_from_data,
    handle_additional_data,
)
from api.v1.users.serializers import (
    UserDetailedListSerializer,
    UserNestedListSerializer,
)
from common.utilities import create_calendar_event, update_calendar_event
from video_requests.emails import email_user_new_request_confirmation
from video_requests.models import Comment, Request
from video_requests.utilities import recalculate_deadline, update_request_status


class CrewMembersListingField(RelatedField):
    def to_representation(self, value):
        serializer = UserNestedListSerializer(value.member)
        return serializer.data


class RequestAdminListSerializer(Serializer):
    created = DateTimeField(read_only=True)
    crew = CrewMembersListingField(many=True, read_only=True)
    id = IntegerField(read_only=True)
    start_datetime = DateTimeField(read_only=True)
    status = IntegerField(read_only=True)
    status_by_admin = SerializerMethodField(read_only=True)
    responsible = UserNestedListSerializer(read_only=True)
    title = CharField(read_only=True)
    video_count = IntegerField(read_only=True, source="videos.count")

    @staticmethod
    def get_status_by_admin(obj):
        try:
            return isinstance(
                obj.additional_data.get("status_by_admin").get("status"), int
            )
        except AttributeError:
            return False


class RequestAdminDetailSerializer(RequestAdminListSerializer):
    additional_data = JSONField(read_only=True)
    comment_count = IntegerField(read_only=True, source="comments.count")
    deadline = DateField(read_only=True)
    end_datetime = DateTimeField(read_only=True)
    place = CharField(read_only=True)
    requester = UserDetailedListSerializer(read_only=True)
    requested_by = UserDetailedListSerializer(read_only=True)
    responsible = UserDetailedListSerializer(read_only=True)
    type = CharField(read_only=True)


class RequestAdminUpdateSerializer(ModelSerializer):
    requester = PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    requester_email = EmailField(required=False)
    requester_first_name = CharField(required=False)
    requester_last_name = CharField(required=False)
    requester_mobile = PhoneNumberField(required=False)

    class Meta:
        model = Request
        fields = (
            "additional_data",
            "deadline",
            "end_datetime",
            "place",
            "requester",
            "requester_email",
            "requester_first_name",
            "requester_last_name",
            "requester_mobile",
            "responsible",
            "start_datetime",
            "title",
            "type",
        )

    def update(self, instance, validated_data):
        recalculate_deadline(instance, validated_data)
        handle_additional_data(validated_data, self.context["request"].user, instance)
        if validated_data.get("requester_email"):
            # As validate() should have already run if any of requester attribute exists all should exist.
            get_or_create_requester_from_data(validated_data, instance)
        request = super().update(instance, validated_data)
        update_request_status(request)
        update_calendar_event.delay(request.id)
        return request

    def validate(self, attrs):
        requester_data = [
            attrs.get("requester_email"),
            attrs.get("requester_first_name"),
            attrs.get("requester_last_name"),
            attrs.get("requester_mobile"),
        ]

        if any(requester_data) and attrs.get("requester"):
            raise ValidationError(
                "Either define the requester by its id or its details but not both."
            )  # TODO: Translate

        if any(requester_data) and not all(requester_data):
            raise ValidationError(
                "All requester data fields must be present if one is present."
            )  # TODO: Translate

        return attrs


class RequestAdminCreateSerializer(RequestAdminUpdateSerializer):
    comment = CharField(required=False)
    send_notification = BooleanField(required=False)

    class Meta:
        model = Request
        fields = (
            "additional_data",
            "comment",
            "deadline",
            "end_datetime",
            "place",
            "requester",
            "requester_email",
            "requester_first_name",
            "requester_last_name",
            "requester_mobile",
            "responsible",
            "send_notification",
            "start_datetime",
            "title",
            "type",
        )

    def create_comment(self, comment_text, request):
        comment = Comment()
        comment.author = self.context["request"].user
        comment.text = comment_text
        comment.request = request
        comment.save()
        return comment

    def create(self, validated_data):
        comment_text = validated_data.pop("comment", None)
        send_notification = validated_data.pop("send_notification", None)
        handle_additional_data(validated_data, self.context["request"].user)
        if validated_data.get("requester_email"):
            # As validate() should have already run if any of requester attribute exists all should exist.
            get_or_create_requester_from_data(validated_data)
        if not validated_data.get("requester"):
            validated_data["requester"] = self.context["request"].user
        request = super().create(validated_data)
        if comment_text:
            request.comments.add(self.create_comment(comment_text, request))
        if send_notification:
            email_user_new_request_confirmation.delay(request.id)
        update_request_status(request)
        create_calendar_event.delay(request.id)
        return request

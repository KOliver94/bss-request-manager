from api.v1.requests.utilities import create_user
from api.v1.users.serializers import UserSerializer
from common.utilities import create_calendar_event
from django.conf import settings
from drf_recaptcha.fields import ReCaptchaV2Field
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers
from rest_framework.fields import CharField, EmailField, SerializerMethodField
from video_requests.emails import (
    email_crew_new_comment,
    email_user_new_request_confirmation,
)
from video_requests.models import Comment, Rating, Request, Video
from video_requests.utilities import validate_request_date_correlations


def create_comment(comment_text, request):
    comment = Comment()
    comment.author = request.requester
    comment.text = comment_text
    comment.request = request
    comment.save()
    return comment


class FilteredListSerializer(serializers.ListSerializer):
    def to_representation(self, data):
        if data.model is Comment:
            data = data.filter(internal=False)
        elif data.model is Rating:  # pragma: no cover
            data = data.filter(author=self.context["request"].user)
        return super(FilteredListSerializer, self).to_representation(data)


class RatingDefaultSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        list_serializer_class = FilteredListSerializer
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


class CommentDefaultSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        list_serializer_class = FilteredListSerializer
        fields = (
            "id",
            "created",
            "author",
            "text",
        )
        read_only_fields = (
            "id",
            "created",
            "author",
        )

    def create(self, validated_data):
        comment = super(CommentDefaultSerializer, self).create(validated_data)
        email_crew_new_comment.delay(comment.id)
        return comment


class VideoDefaultSerializer(serializers.ModelSerializer):
    ratings = RatingDefaultSerializer(many=True, read_only=True)
    video_url = SerializerMethodField("get_video_url", read_only=True)

    @staticmethod
    def get_video_url(obj):
        if obj.status >= Video.Statuses.PUBLISHED and obj.additional_data.get(
            "publishing", {}
        ).get("website"):
            return obj.additional_data["publishing"]["website"]
        return None

    class Meta:
        model = Video
        fields = ("id", "title", "status", "ratings", "video_url")
        read_only_fields = ("id", "title", "status", "ratings", "video_url")


class RequestDefaultListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = (
            "id",
            "title",
            "created",
            "start_datetime",
            "end_datetime",
            "status",
        )
        read_only_fields = (
            "id",
            "title",
            "created",
            "start_datetime",
            "end_datetime",
            "status",
        )


class RequestDefaultSerializer(serializers.ModelSerializer):
    videos = VideoDefaultSerializer(many=True, read_only=True)
    comments = CommentDefaultSerializer(many=True, read_only=True)
    requester = UserSerializer(read_only=True)
    requested_by = UserSerializer(read_only=True)
    responsible = UserSerializer(read_only=True)
    comment_text = CharField(write_only=True, required=False, allow_blank=True)

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
        write_only_fields = ("comment_text",)

    def create(self, validated_data):
        comment_text = validated_data.pop("comment_text", None)
        validated_data["requester"] = self.context["request"].user
        validated_data["requested_by"] = self.context["request"].user
        request = super(RequestDefaultSerializer, self).create(validated_data)
        if comment_text:
            request.comments.add(create_comment(comment_text, request))
        create_calendar_event.delay(request.id)
        email_user_new_request_confirmation.delay(request.id)
        return request

    def validate(self, data):
        validate_request_date_correlations(self.instance, data)
        return data


class RequestAnonymousSerializer(serializers.ModelSerializer):
    comments = CommentDefaultSerializer(many=True, read_only=True)
    comment_text = CharField(write_only=True, required=False, allow_blank=True)
    requester_first_name = CharField(write_only=True)
    requester_last_name = CharField(write_only=True)
    requester_email = EmailField(write_only=True)
    requester_mobile = PhoneNumberField(write_only=True)
    if settings.DRF_RECAPTCHA_ENABLED:
        recaptcha = ReCaptchaV2Field()

    class Meta:
        model = Request
        fields = (
            "id",
            "title",
            "status",
            "start_datetime",
            "end_datetime",
            "type",
            "place",
            "comments",
            "comment_text",
            "requester_first_name",
            "requester_last_name",
            "requester_email",
            "requester_mobile",
        )
        read_only_fields = (
            "id",
            "status",
            "comments",
        )
        write_only_fields = (
            "comment_text",
            "requester_first_name",
            "requester_last_name",
            "requester_email",
            "requester_mobile",
        )

        if settings.DRF_RECAPTCHA_ENABLED:
            fields += ("recaptcha",)
            write_only_fields += ("recaptcha",)

    def create(self, validated_data):
        comment_text = validated_data.pop("comment_text", None)
        validated_data["requester"], additional_data = create_user(validated_data)
        request = super(RequestAnonymousSerializer, self).create(validated_data)
        if additional_data:
            request.additional_data = additional_data
        if comment_text:
            request.comments.add(create_comment(comment_text, request))
        request.save()
        create_calendar_event.delay(request.id)
        email_user_new_request_confirmation.delay(request.id)
        return request

    def validate(self, data):
        data.pop("recaptcha", None)
        validate_request_date_correlations(self.instance, data)
        return data

from api.v1.users.serializers import UserSerializer
from common.utilities import create_calendar_event
from django.conf import settings
from django.contrib.auth.models import User
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
        if (
            obj.status >= Video.Statuses.PUBLISHED
            and obj.additional_data.get("publishing", None)
            and obj.additional_data["publishing"].get("website", None)
        ):
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
            "videos",
            "comments",
        )
        write_only_fields = ("comment_text",)

    def create(self, validated_data):
        comment_text = (
            validated_data.pop("comment_text")
            if "comment_text" in validated_data
            else None
        )
        validated_data["requester"] = self.context["request"].user
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
    requester_first_name = CharField(write_only=True, required=True)
    requester_last_name = CharField(write_only=True, required=True)
    requester_email = EmailField(write_only=True, required=True)
    requester_mobile = PhoneNumberField(write_only=True, required=True)
    if settings.DRF_RECAPTCHA_ENABLED:
        recaptcha = ReCaptchaV2Field(required=True)

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

    @staticmethod
    def create_user(validated_data):
        user = User()
        user.first_name = validated_data.pop("requester_first_name")
        user.last_name = validated_data.pop("requester_last_name")
        user.email = validated_data.pop("requester_email").lower()
        user.username = user.email
        user.set_unusable_password()
        user.is_active = False
        phone_number = validated_data.pop("requester_mobile")

        if User.objects.filter(email__iexact=user.email).exists():
            # If user with given e-mail address already exist set it as requester but save the provided data.
            # The user's data will be not overwritten so useful to check phone number or anything else.
            additional_data = {
                "requester": {
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone_number": phone_number.as_e164,
                }
            }
            return User.objects.get(email__iexact=user.email), additional_data
        else:
            user.save()
            user.userprofile.phone_number = phone_number
            user.save()
            return user, None

    def create(self, validated_data):
        comment_text = (
            validated_data.pop("comment_text")
            if "comment_text" in validated_data
            else None
        )
        validated_data["requester"], additional_data = self.create_user(validated_data)
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
        if "recaptcha" in data:
            data.pop("recaptcha")
        validate_request_date_correlations(self.instance, data)
        return data

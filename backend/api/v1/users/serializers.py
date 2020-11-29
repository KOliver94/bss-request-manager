from common.models import UserProfile
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import BooleanField, CharField, DateTimeField
from rest_social_auth.serializers import OAuth2InputSerializer


class BanUserSerializer(serializers.Serializer):
    ban = BooleanField(required=True)


class UserSocialProfileSerializer(serializers.ModelSerializer):
    class Meta:
        from social_django.models import UserSocialAuth

        model = UserSocialAuth
        fields = (
            "provider",
            "uid",
        )
        read_only_fields = (
            "provider",
            "uid",
        )


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "phone_number",
            "avatar_url",
        )
        read_only_fields = ("avatar_url",)


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True, source="userprofile")

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "profile",
        )


class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True, source="userprofile")
    if all(
        elem in settings.INSTALLED_APPS
        for elem in ["rest_social_auth", "social_django"]
    ):  # pragma: no cover
        social_accounts = UserSocialProfileSerializer(
            many=True, read_only=True, source="social_auth"
        )
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "profile",
            "groups",
        )

        if all(
            elem in settings.INSTALLED_APPS
            for elem in ["rest_social_auth", "social_django"]
        ):  # pragma: no cover
            fields += ("social_accounts",)


class ConnectOAuth2ProfileInputSerializer(OAuth2InputSerializer):
    force = serializers.BooleanField(required=False, default=False)


class UserWorkedOnSerializer(serializers.Serializer):
    title = CharField()
    position = CharField()
    start_datetime = DateTimeField()
    end_datetime = DateTimeField()

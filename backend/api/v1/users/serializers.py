from common.models import UserProfile
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import BooleanField
from social_django.models import UserSocialAuth


class BanUserSerializer(serializers.Serializer):
    ban = BooleanField()


class UserSocialProfileSerializer(serializers.ModelSerializer):
    class Meta:
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
            "social_accounts",
            "groups",
        )

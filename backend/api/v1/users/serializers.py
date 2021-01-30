from common.models import UserProfile
from django.conf import settings
from django.contrib.auth.models import User
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework import serializers
from rest_framework.fields import BooleanField, CharField, DateTimeField, EmailField
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
        read_only_fields = ("phone_number", "avatar_url")


class UserProfileSerializerWithAvatar(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "phone_number",
            "avatar_url",
            "avatar",
        )
        read_only_fields = ("avatar_url", "avatar")


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
    AVATAR_PROVIDER_CHOICES = (
        ("facebook", "Facebook"),
        ("google-oauth2", "Google"),
        ("gravatar", "Gravatar"),
    )

    first_name = CharField(max_length=150, required=False)
    last_name = CharField(max_length=150, required=False)
    email = EmailField(required=False)
    profile = UserProfileSerializerWithAvatar(read_only=True, source="userprofile")
    if all(
        elem in settings.INSTALLED_APPS
        for elem in ["rest_social_auth", "social_django"]
    ):  # pragma: no cover
        social_accounts = UserSocialProfileSerializer(
            many=True, read_only=True, source="social_auth"
        )
    groups = serializers.SlugRelatedField(many=True, read_only=True, slug_field="name")
    role = serializers.SerializerMethodField(read_only=True)
    phone_number = PhoneNumberField(write_only=True, required=False)
    avatar_provider = serializers.ChoiceField(
        write_only=True, choices=AVATAR_PROVIDER_CHOICES, required=False
    )

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
            "role",
            "phone_number",
            "avatar_provider",
        )
        read_only_fields = ("id", "username", "profile", "groups", "role")
        write_only_fields = ("phone_number", "avatar_provider")

        if all(
            elem in settings.INSTALLED_APPS
            for elem in ["rest_social_auth", "social_django"]
        ):  # pragma: no cover
            fields += ("social_accounts",)
            read_only_fields += ("social_accounts",)

    def update(self, instance, validated_data):
        if "phone_number" in validated_data:
            instance.userprofile.phone_number = validated_data.pop("phone_number")
        if "avatar_provider" in validated_data and instance.userprofile.avatar.get(
            validated_data["avatar_provider"], None
        ):
            instance.userprofile.avatar["provider"] = validated_data.pop(
                "avatar_provider"
            )
        return super(UserDetailSerializer, self).update(instance, validated_data)

    @staticmethod
    def get_role(user):
        return user.get_role()


class ConnectOAuth2ProfileInputSerializer(OAuth2InputSerializer):
    force = serializers.BooleanField(required=False, default=False)


class UserWorkedOnSerializer(serializers.Serializer):
    title = CharField()
    position = CharField()
    start_datetime = DateTimeField()
    end_datetime = DateTimeField()

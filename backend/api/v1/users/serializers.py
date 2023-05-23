from django.conf import settings
from django.contrib.auth.models import User
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.fields import (
    BooleanField,
    CharField,
    ChoiceField,
    DateTimeField,
    EmailField,
    IntegerField,
    SerializerMethodField,
)
from rest_framework.relations import SlugRelatedField
from rest_framework.serializers import ModelSerializer, Serializer

from common.models import Ban, UserProfile


class BanUserSerializer(ModelSerializer):
    class Meta:
        model = Ban
        fields = (
            "reason",
            "created",
        )
        read_only_fields = ("created",)


class UserSocialProfileSerializer(ModelSerializer):
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


class UserProfileSerializer(ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "phone_number",
            "avatar_url",
        )
        read_only_fields = ("phone_number", "avatar_url")


class UserProfileSerializerWithAvatar(ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "phone_number",
            "avatar_url",
            "avatar",
        )
        read_only_fields = ("avatar_url", "avatar")


class UserNestedListSerializer(Serializer):
    avatar_url = SerializerMethodField(read_only=True)
    full_name = SerializerMethodField(read_only=True)
    id = IntegerField(read_only=True)

    @staticmethod
    def get_full_name(obj):
        return obj.get_full_name_eastern_order()

    @staticmethod
    def get_avatar_url(obj):
        return obj.userprofile.avatar_url


class UserDetailedListSerializer(Serializer):
    email = EmailField(read_only=True)
    full_name = SerializerMethodField(read_only=True)
    id = IntegerField(read_only=True)
    is_staff = BooleanField(read_only=True)
    profile = UserProfileSerializer(read_only=True, source="userprofile")

    @staticmethod
    def get_full_name(obj):
        return obj.get_full_name_eastern_order()


class UserSerializer(ModelSerializer):
    profile = UserProfileSerializer(read_only=True, source="userprofile")
    banned = SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "username",
            "email",
            "profile",
            "banned",
        )

    @staticmethod
    def get_banned(user):
        return hasattr(user, "ban")


class UserDetailSerializer(ModelSerializer):
    AVATAR_PROVIDER_CHOICES = (
        ("facebook", "Facebook"),
        ("google-oauth2", "Google"),
        ("gravatar", "Gravatar"),
    )

    first_name = CharField(max_length=150, required=False)
    last_name = CharField(max_length=150, required=False)
    email = EmailField(required=False)
    profile = UserProfileSerializerWithAvatar(read_only=True, source="userprofile")
    ban = BanUserSerializer(read_only=True)
    if all(
        elem in settings.INSTALLED_APPS
        for elem in ["rest_social_auth", "social_django"]
    ):  # pragma: no cover
        social_accounts = UserSocialProfileSerializer(
            many=True, read_only=True, source="social_auth"
        )
    groups = SlugRelatedField(many=True, read_only=True, slug_field="name")
    role = SerializerMethodField(read_only=True)
    phone_number = PhoneNumberField(write_only=True, required=False)
    avatar_provider = ChoiceField(
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
            "ban",
            "groups",
            "role",
            "phone_number",
            "avatar_provider",
        )
        read_only_fields = ("id", "username", "profile", "ban", "groups", "role")
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
        return super().update(instance, validated_data)

    @staticmethod
    def get_role(user):
        return user.role


class UserWorkedOnSerializer(Serializer):
    id = IntegerField()
    title = CharField()
    position = CharField()
    start_datetime = DateTimeField()
    end_datetime = DateTimeField()

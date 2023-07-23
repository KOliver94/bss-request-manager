from django.contrib.auth.models import User
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.fields import CharField, ChoiceField, EmailField
from rest_framework.relations import SlugRelatedField
from rest_framework.serializers import ModelSerializer
from social_django.models import UserSocialAuth

from common.models import UserProfile


class UserProfileSerializer(ModelSerializer):
    phone_number = PhoneNumberField(required=False)

    class Meta:
        model = UserProfile
        fields = (
            "avatar",
            "avatar_url",
            "phone_number",
        )
        read_only_fields = ("avatar", "avatar_url")


class UserSocialAuthSerializer(ModelSerializer):
    class Meta:
        model = UserSocialAuth
        fields = ("provider", "uid")
        read_only_fields = ("provider", "uid")


class UserSerializer(ModelSerializer):
    AVATAR_PROVIDER_CHOICES = (
        ("facebook", "Facebook"),
        ("google-oauth2", "Google"),
        ("gravatar", "Gravatar"),
    )

    avatar_provider = ChoiceField(
        choices=AVATAR_PROVIDER_CHOICES,
        required=False,
        write_only=True,
    )
    email = EmailField(required=False)
    first_name = CharField(max_length=150, required=False)
    groups = SlugRelatedField(many=True, read_only=True, slug_field="name")
    last_name = CharField(max_length=150, required=False)
    profile = UserProfileSerializer(source="userprofile")
    role = CharField(read_only=True)
    social_accounts = UserSocialAuthSerializer(
        many=True, read_only=True, source="social_auth"
    )

    class Meta:
        model = User
        fields = (
            "avatar_provider",
            "email",
            "first_name",
            "groups",
            "id",
            "last_name",
            "profile",
            "role",
            "social_accounts",
            "username",
        )
        read_only_fields = ("groups", "id", "role", "social_accounts", "username")
        write_only_fields = ("avatar_provider",)

    def update(self, instance, validated_data):
        if "avatar_provider" in validated_data and instance.userprofile.avatar.get(
            validated_data["avatar_provider"], None
        ):
            instance.userprofile.avatar["provider"] = validated_data.pop(
                "avatar_provider"
            )
        profile_data = validated_data.pop("profile")
        UserProfileSerializer.update(self, instance.userprofile, profile_data)
        return super().update(instance, validated_data)

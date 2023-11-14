from django.contrib.auth.models import User
from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.fields import (
    BooleanField,
    CharField,
    DateTimeField,
    EmailField,
    IntegerField,
    URLField,
)
from rest_framework.serializers import ModelSerializer, Serializer

from api.v1.me.serializers import UserSerializer
from common.models import Ban


class UserNestedDetailSerializer(Serializer):
    avatar_url = URLField(read_only=True, source="userprofile.avatar_url")
    email = EmailField(read_only=True)
    full_name = CharField(read_only=True, source="get_full_name_eastern_order")
    id = IntegerField(read_only=True)
    is_staff = BooleanField(read_only=True)
    phone_number = PhoneNumberField(read_only=True, source="userprofile.phone_number")


class UserNestedListSerializer(Serializer):
    avatar_url = URLField(read_only=True, source="userprofile.avatar_url")
    full_name = CharField(read_only=True, source="get_full_name_eastern_order")
    id = IntegerField(read_only=True)


class BanUserSerializer(ModelSerializer):
    creator = UserNestedListSerializer(read_only=True)

    class Meta:
        model = Ban
        fields = (
            "created",
            "creator",
            "reason",
        )
        read_only_fields = ("created", "creator")


class UserAdminDetailSerializer(UserSerializer):
    ban = BanUserSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "ban",
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
        read_only_fields = (
            "ban",
            "groups",
            "id",
            "role",
            "social_accounts",
            "username",
        )


class UserAdminListSerializer(UserNestedDetailSerializer):
    pass


class UserAdminWorkedOnSerializer(Serializer):
    id = IntegerField(read_only=True)
    position = CharField(read_only=True)
    start_datetime = DateTimeField(read_only=True)
    title = CharField(read_only=True)

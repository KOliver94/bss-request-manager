from phonenumber_field.serializerfields import PhoneNumberField
from rest_framework.fields import (
    BooleanField,
    CharField,
    EmailField,
    IntegerField,
    URLField,
)
from rest_framework.serializers import Serializer


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

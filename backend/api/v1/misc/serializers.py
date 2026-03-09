from rest_framework.fields import CharField, EmailField
from rest_framework.serializers import Serializer

from common.rest_framework.turnstile import TurnstileField


class ContactSerializer(Serializer):
    email = EmailField()
    message = CharField()
    name = CharField(max_length=150)
    captcha = TurnstileField()

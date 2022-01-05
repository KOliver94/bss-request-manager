from django.conf import settings
from drf_recaptcha.fields import ReCaptchaV2Field
from rest_framework import serializers
from rest_framework.fields import CharField, EmailField


class ContactSerializer(serializers.Serializer):
    name = CharField(max_length=150)
    email = EmailField()
    message = CharField()
    if settings.DRF_RECAPTCHA_ENABLED:
        recaptcha = ReCaptchaV2Field()

    def validate(self, data):
        data.pop("recaptcha", None)
        return data

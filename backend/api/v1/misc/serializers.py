from django.conf import settings
from drf_recaptcha.fields import ReCaptchaV2Field
from rest_framework import serializers
from rest_framework.fields import CharField, EmailField


class ContactSerializer(serializers.Serializer):
    name = CharField(max_length=150, required=True)
    email = EmailField(required=True)
    message = CharField(required=True)
    if settings.DRF_RECAPTCHA_ENABLED:
        recaptcha = ReCaptchaV2Field(required=True)

    def validate(self, data):
        if "recaptcha" in data:
            data.pop("recaptcha")
        return data

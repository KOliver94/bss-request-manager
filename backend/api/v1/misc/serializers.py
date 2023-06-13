from drf_recaptcha.fields import ReCaptchaV2Field
from rest_framework.fields import CharField, EmailField
from rest_framework.serializers import Serializer


class ContactSerializer(Serializer):
    email = EmailField()
    message = CharField()
    name = CharField(max_length=150)
    recaptcha = ReCaptchaV2Field()

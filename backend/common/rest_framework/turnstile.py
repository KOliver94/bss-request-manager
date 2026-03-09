import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.utils.translation import gettext_lazy as _
from rest_framework.fields import CharField


class TurnstileField(CharField):
    default_error_messages = {
        "captcha_invalid": _("Error verifying captcha, please try again."),
    }

    def __init__(self, **kwargs):
        kwargs["write_only"] = True
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        data = super().to_internal_value(data)

        if getattr(settings, "TURNSTILE_TESTING", False):
            if getattr(settings, "TURNSTILE_TESTING_PASS", True):
                return data
            self.fail("captcha_invalid")

        secret_key = getattr(settings, "TURNSTILE_SECRET_KEY", None)
        if not secret_key:
            raise ImproperlyConfigured(
                "TURNSTILE_SECRET_KEY must be set in Django settings."
            )

        response = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": secret_key, "response": data},
            timeout=10,
        )
        result = response.json()

        if not result.get("success"):
            self.fail("captcha_invalid")

        return data

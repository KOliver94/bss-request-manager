from django.conf import settings
from django.core.mail import get_connection
from django.core.mail.backends.base import BaseEmailBackend
from django.test import override_settings


class conditional_override_settings(override_settings):
    def save_options(self, test_func):
        if self.options.get("CONDITION"):
            super().save_options(test_func)


class CombinedEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        for backend in getattr(settings, "EMAIL_BACKEND_LIST", []):
            get_connection(backend).send_messages(email_messages)
        return len(email_messages)

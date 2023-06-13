from rest_framework.generics import CreateAPIView
from rest_framework.throttling import ScopedRateThrottle

from api.v1.misc.serializers import ContactSerializer
from common.emails import email_contact_message


class ContactView(CreateAPIView):
    serializer_class = ContactSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact"

    def perform_create(self, serializer):
        email = serializer.data["email"]
        message = serializer.data["message"]
        name = serializer.data["name"]
        email_contact_message.delay(name, email, message)

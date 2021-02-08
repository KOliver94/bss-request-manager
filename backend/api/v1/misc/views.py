from api.v1.misc.serializers import ContactSerializer
from common.emails import email_contact_message
from rest_framework import generics
from rest_framework.throttling import ScopedRateThrottle


class ContactView(generics.CreateAPIView):
    serializer_class = ContactSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact"

    def perform_create(self, serializer):
        name = serializer.data["name"]
        email = serializer.data["email"]
        message = serializer.data["message"]
        email_contact_message.delay(name, email, message)

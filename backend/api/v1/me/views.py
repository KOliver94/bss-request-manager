from django.contrib.auth.models import User
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin
from rest_framework.viewsets import GenericViewSet

from api.v1.me.serializers import UserSerializer
from common.rest_framework.permissions import IsAuthenticated


class MeViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return User.objects.get(pk=self.request.user.pk)

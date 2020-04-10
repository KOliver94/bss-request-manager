from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.exceptions import NotAuthenticated

from common.permissions import IsSelfOrStaff, IsSelfOrAdmin
from common.serializers import UserSerializer, UserProfileSerializer


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve (GET) and Update (PUT, PATCH) view for a single User object

    Only authenticated and authorized persons can access this view:
    - Authenticated users can get and modify themselves
    - Staff users can get any user but modify only themselves
    - Admin user can get any user and modify them

    Modifiable attributes:
    - phone_number
    """

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserProfileSerializer

    def get_permissions(self):
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        if self.request.method == 'GET':
            return [IsSelfOrStaff()]
        return [IsSelfOrAdmin()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return User.objects.none()
        return User.objects.all()

    def get_object(self):
        if self.kwargs.get('pk', None) == 'me':
            self.kwargs['pk'] = self.request.user.pk
        return super(UserDetailView, self).get_object()

from django.contrib.auth.models import User
from rest_framework import generics, filters
from rest_framework.exceptions import NotAuthenticated

from api.v1.users.serializers import UserSerializer, UserProfileSerializer
from common.permissions import IsSelfOrStaff, IsSelfOrAdmin, IsStaffUser


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
        if self.request.method == "GET":
            return UserSerializer
        return UserProfileSerializer

    def get_permissions(self):
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        if self.request.method == "GET":
            return [IsSelfOrStaff()]
        return [IsSelfOrAdmin()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return User.objects.none()
        return User.objects.all()

    def get_object(self):
        if self.kwargs.get("pk", None) == "me":
            self.kwargs["pk"] = self.request.user.pk
        return super(UserDetailView, self).get_object()


class StaffUserListView(generics.ListAPIView):
    """
    List (GET) view for a Staff User objects.

    Only Staff users can access this view.

    This view is used in the frontend to get a list to select crew members.
    """

    serializer_class = UserSerializer
    permission_classes = [IsStaffUser]
    pagination_class = None
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["id", "last_name", "first_name"]
    ordering = ["last_name"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return User.objects.none()
        return User.objects.filter(is_staff=True, is_active=True)

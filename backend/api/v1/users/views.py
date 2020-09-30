from distutils import util

from api.v1.users.serializers import (
    BanUserSerializer,
    ConnectOAuth2ProfileInputSerializer,
    UserDetailSerializer,
    UserProfileSerializer,
    UserSerializer,
)
from common.pagination import ExtendedPagination
from common.permissions import IsAdminUser, IsSelfOrAdmin, IsSelfOrStaff, IsStaffUser
from django.contrib.auth.models import Group, User
from rest_framework import filters, generics, status
from rest_framework.exceptions import NotAuthenticated, ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_social_auth.views import BaseSocialAuthView
from social_django.models import UserSocialAuth


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
            return UserDetailSerializer
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


class UserListView(generics.ListAPIView):
    """
    List (GET) view for User objects.
    Only Admin users can access this view.

    Example: /users?ordering=id&staff=False&admin=False
    """

    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = [
        "id",
        "last_name",
        "first_name",
    ]
    ordering = ["last_name"]
    pagination_class = ExtendedPagination

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return User.objects.none()
        queryset = User.objects.all()
        staff = self.request.query_params.get("staff", None)
        admin = self.request.query_params.get("admin", None)

        try:
            if staff is not None:
                staff = util.strtobool(staff)
            if admin is not None:
                admin = util.strtobool(admin)
        except ValueError:
            raise ValidationError("Invalid filter")

        if staff is not None and admin is None:
            queryset = queryset.filter(is_staff=staff).cache()
        elif admin is not None and staff is None:
            queryset = queryset.filter(is_superuser=admin).cache()
        elif staff is not None and admin is not None:
            queryset = queryset.filter(is_staff=staff, is_superuser=admin).cache()

        return queryset


class StaffUserListView(generics.ListAPIView):
    """
    List (GET) view for Staff User objects.

    Only Staff users can access this view.

    This view is used in the frontend to get a list to select crew members.
    """

    serializer_class = UserSerializer
    permission_classes = [IsStaffUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["id", "last_name", "first_name"]
    ordering = ["last_name"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return User.objects.none()
        return User.objects.filter(is_staff=True, is_active=True).cache()


class BanUserView(generics.UpdateAPIView):
    """
    Ban/Unban a user - Add to group "Banned" and set the user inactive.
    The Banned group is needed to disable authentication with social provider
    and the inactive status is due to avoid LDAP login

    Only Admin members can call this endpoint with PUT/PATCH. The body must be {"ban": True/False}
    """

    permission_classes = [IsAdminUser]
    serializer_class = BanUserSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return User.objects.none()
        return User.objects.all()

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = self.get_object()
        group = Group.objects.get_or_create(name="Banned")[0]
        if serializer.data["ban"]:
            user.groups.add(group)
            user.is_active = False
        else:
            user.groups.remove(group)
            user.is_active = True
        user.save()
        return Response(status=status.HTTP_202_ACCEPTED)


class ConnectSocialProfileView(BaseSocialAuthView):
    """
    Connect social profile to existing account.
    Works the same as social login but available only for authenticated users.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserDetailSerializer
    oauth2_serializer_class_in = ConnectOAuth2ProfileInputSerializer


class DisconnectSocialProfileView(generics.DestroyAPIView):
    """
    Disconnects user's social profile from given provider.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        provider = self.kwargs.get("provider", None)
        if provider not in ["authsch", "facebook", "google-oauth2"]:
            raise ValidationError(detail="Invalid provider.")
        else:
            social_auth = get_object_or_404(
                UserSocialAuth, user=self.request.user, provider=provider
            )
            if UserSocialAuth.objects.filter(user=self.request.user).count() > 1:
                social_auth.delete()
            else:
                raise ValidationError(
                    detail="You must have at least 1 remaining connected profile."
                )

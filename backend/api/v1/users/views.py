from datetime import datetime, timedelta
from distutils import util

from django.conf import settings
from django.contrib.auth.models import User
from django.utils.timezone import localdate
from rest_framework import filters, generics, status
from rest_framework.exceptions import NotAuthenticated, ValidationError
from rest_framework.generics import DestroyAPIView, get_object_or_404
from rest_framework.response import Response
from rest_social_auth.views import BaseSocialAuthView
from social_django.models import UserSocialAuth

from api.v1.users.serializers import (
    BanUserSerializer,
    UserDetailSerializer,
    UserSerializer,
    UserWorkedOnSerializer,
)
from common.models import Ban
from common.rest_framework.pagination import ExtendedPagination
from common.rest_framework.permissions import (
    IsAdminUser,
    IsAuthenticated,
    IsSelfOrAdmin,
    IsSelfOrStaff,
    IsStaffSelfOrAdmin,
    IsStaffUser,
)
from video_requests.models import CrewMember, Request, Video


class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve (GET) and Update (PUT, PATCH) view for a single User object

    Only authenticated and authorized persons can access this view:
    - Authenticated users can get and modify themselves
    - Staff users can get any user but modify only themselves
    - Admin user can get any user and modify them

    Modifiable attributes:
    - first and lastname
    - email address
    - phone_number
    - avatar provider
    """

    queryset = User.objects.all()
    serializer_class = UserDetailSerializer

    def get_permissions(self):
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        if self.request.method == "GET":
            return [IsSelfOrStaff()]
        return [IsSelfOrAdmin()]

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
        queryset = User.objects.all()
        staff = self.request.query_params.get("staff", None)
        admin = self.request.query_params.get("admin", None)

        if staff is not None:
            try:
                staff = util.strtobool(staff)
            except ValueError:
                raise ValidationError({"staff": ["Invalid filter."]})
        if admin is not None:
            try:
                admin = util.strtobool(admin)
            except ValueError:
                raise ValidationError({"admin": ["Invalid filter."]})

        if staff is not None and admin is None:
            queryset = queryset.filter(is_staff=staff).cache()
        elif admin is not None and staff is None:
            qs1 = queryset.filter(
                groups__name=settings.ADMIN_GROUP, is_staff=True
            ).cache()
            qs2 = queryset.filter(is_superuser=admin).cache()
            queryset = qs2.union(qs1) if admin else qs2.difference(qs1)
        elif staff is not None and admin is not None:
            qs1 = queryset.filter(
                groups__name=settings.ADMIN_GROUP, is_staff=True
            ).cache()
            qs2 = queryset.filter(is_staff=staff, is_superuser=admin).cache()
            if staff and not admin:
                queryset = qs2.difference(qs1)
            elif staff and admin:
                queryset = qs2.union(qs1)
            else:
                queryset = qs2

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
    queryset = User.objects.filter(is_staff=True, is_active=True).cache()


class BanUserCreateDeleteView(generics.CreateAPIView, generics.DestroyAPIView):
    """
    Create and Delete endpoint for User Ban objects

    Only Admin members can call this endpoint.
    """

    permission_classes = [IsAdminUser]
    serializer_class = BanUserSerializer
    queryset = Ban.objects.all()

    def perform_create(self, serializer):
        serializer.save(
            receiver=get_object_or_404(User, pk=self.kwargs["pk"]),
            creator=self.request.user,
        )


class ConnectDisconnectSocialProfileView(
    BaseSocialAuthView, DestroyAPIView
):  # pragma: no cover
    """
    Connects and disconnects social profile to existing account.
    Works the same as social login but available only for authenticated users.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserDetailSerializer

    def delete(self, request, *args, **kwargs):
        provider = self.kwargs.get("provider", None)
        if provider not in ["authsch", "facebook", "google-oauth2"]:
            raise ValidationError({"provider": [f"Invalid provider '{provider}'."]})
        else:
            social_auth = get_object_or_404(
                UserSocialAuth, user=self.request.user, provider=provider
            )
            if (
                UserSocialAuth.objects.filter(user=self.request.user).count() > 1
                or self.request.user.is_staff
            ):
                social_auth.delete()
                if self.request.user.userprofile.avatar.pop(provider, None):
                    self.request.user.save()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                raise ValidationError(
                    detail="You must have at least 1 remaining connected profile."
                )


class UserWorkedOnListView(generics.ListAPIView):
    """
    List the requests and positions a user worked on.
    The staff users can check themselves and admin users can check anybody.

    Example: /users/me/worked?from_date=2020-06-20&to_date=2020-05-20&responsible=False
    Params:
    @from_date = Date from when we check the requests. By default: 20 weeks before today.
    @to_date = Date until we check the requests. By default: today.
    @responsible = If True the requests where the user was the responsible will be shown as well.
    """

    permission_classes = [IsStaffSelfOrAdmin]
    serializer_class = UserWorkedOnSerializer
    queryset = User.objects.all()

    def get_object(self):
        if self.kwargs.get("pk", None) == "me":
            self.kwargs["pk"] = self.request.user.pk
        return super(UserWorkedOnListView, self).get_object()

    def list(self, request, *args, **kwargs):
        worked_on = []
        user = self.get_object()

        # Get and validate all query parameters by trying to convert them to the corresponding type
        # if not the default value was used.
        try:
            to_date = self.request.query_params.get("to_date", localdate())
            to_date = (
                datetime.strptime(to_date, "%Y-%m-%d").date()
                if type(to_date) is str
                else to_date
            )
        except ValueError:
            raise ValidationError({"to_date": ["Invalid filter."]})
        try:
            from_date = self.request.query_params.get(
                "from_date", to_date - timedelta(weeks=20)
            )
            from_date = (
                datetime.strptime(from_date, "%Y-%m-%d").date()
                if type(from_date) is str
                else from_date
            )
        except ValueError:
            raise ValidationError({"from_date": ["Invalid filter."]})
        try:
            responsible = self.request.query_params.get("responsible", True)
            responsible = (
                util.strtobool(responsible) if type(responsible) is str else responsible
            )
        except ValueError:
            raise ValidationError({"responsible": ["Invalid filter."]})

        # Check if date range is valid
        if to_date < from_date:
            raise ValidationError({"from_date": ["Must be earlier than to_date."]})

        if responsible:
            for request in Request.objects.filter(
                responsible=user, start_datetime__date__range=[from_date, to_date]
            ):
                worked_on.append(
                    {
                        "id": request.id,
                        "title": request.title,
                        "position": "Felelős",
                        "start_datetime": request.start_datetime,
                        "end_datetime": request.end_datetime,
                    }
                )

        for crew in CrewMember.objects.filter(
            member=user, request__start_datetime__date__range=[from_date, to_date]
        ):
            worked_on.append(
                {
                    "id": crew.request.id,
                    "title": crew.request.title,
                    "position": crew.position,
                    "start_datetime": crew.request.start_datetime,
                    "end_datetime": crew.request.end_datetime,
                }
            )

        for video in Video.objects.filter(
            editor=user, request__start_datetime__date__range=[from_date, to_date]
        ):
            worked_on.append(
                {
                    "id": video.request.id,
                    "title": video.request.title,
                    "position": "Vágó",
                    "start_datetime": video.request.start_datetime,
                    "end_datetime": video.request.end_datetime,
                }
            )

        serializer = self.get_serializer(worked_on, many=True)
        return Response(serializer.data)

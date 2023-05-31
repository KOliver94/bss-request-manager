from django.contrib.auth.models import User
from django.db.models import Prefetch
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter
from rest_framework.generics import get_object_or_404
from rest_framework.viewsets import ModelViewSet

from api.v1.admin.requests.ratings.serializers import (
    RatingAdminCreateUpdateSerializer,
    RatingAdminListDetailSerializer,
)
from common.rest_framework.permissions import IsStaffSelfOrAdmin, IsStaffUser
from video_requests.models import Rating, Request, Video


class RatingAdminViewSet(ModelViewSet):
    filter_backends = [OrderingFilter]
    ordering = ["created"]
    ordering_fields = ["author", "created", "rating", "review"]

    def get_permissions(self):
        # Staff members can read every comment but can only modify and delete those which were created by them.
        if self.request.method in ["GET", "POST"]:
            return [IsStaffUser()]
        return [IsStaffSelfOrAdmin()]

    def get_queryset(self):
        return Rating.objects.prefetch_related(
            Prefetch("author", queryset=User.objects.prefetch_related("userprofile"))
        ).filter(
            video=get_object_or_404(Video, pk=self.kwargs["video_pk"]),
            video__request=get_object_or_404(Request, pk=self.kwargs["request_pk"]),
        )

    def get_serializer_class(self):
        if self.request.method == "GET":
            return RatingAdminListDetailSerializer
        return RatingAdminCreateUpdateSerializer

    def perform_create(self, serializer):
        video = get_object_or_404(
            Video,
            pk=self.kwargs["video_pk"],
            request=get_object_or_404(Request, pk=self.kwargs["request_pk"]),
        )

        if video.status < Video.Statuses.EDITED:
            # A video cannot be rated before being edited (reached status 3).
            raise ValidationError(
                "The video has not been edited yet."
            )  # TODO: Translate

        if Rating.objects.filter(author=self.request.user, video=video).exists():
            # Only one rating per user is permitted for a video.
            raise ValidationError(
                "You have already posted a rating."
            )  # TODO: Translate

        serializer.save(author=self.request.user, video=video)

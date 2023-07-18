from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.viewsets import ModelViewSet

from api.v1.requests.ratings.serializers import (
    RatingCreateUpdateSerializer,
    RatingRetrieveSerializer,
)
from common.rest_framework.permissions import IsSelf
from video_requests.models import Rating, Request, Video


class RatingViewSet(ModelViewSet):
    permission_classes = [IsSelf]

    def get_object(self):
        queryset = Rating.objects.filter(
            video=get_object_or_404(Video, pk=self.kwargs["video_pk"]),
            video__request=get_object_or_404(
                Request, pk=self.kwargs["request_pk"], requester=self.request.user
            ),
        )

        obj = get_object_or_404(queryset, author=self.request.user)

        self.check_object_permissions(self.request, obj)

        return obj

    def get_serializer_class(self):
        if self.request.method == "GET":
            return RatingRetrieveSerializer
        return RatingCreateUpdateSerializer

    def perform_create(self, serializer):
        video = get_object_or_404(
            Video,
            pk=self.kwargs["video_pk"],
            request=get_object_or_404(
                Request, pk=self.kwargs["request_pk"], requester=self.request.user
            ),
        )

        if video.status < Video.Statuses.PUBLISHED:
            # A video cannot be rated before being published (reached status 5).
            raise ValidationError(
                {"non_field_errors": ["The video has not been published yet."]}
            )  # TODO: Translate

        if Rating.objects.filter(author=self.request.user, video=video).exists():
            # Only one rating per user is permitted for a video.
            raise ValidationError(
                {"non_field_errors": ["You have already posted a rating."]}
            )  # TODO: Translate

        serializer.save(author=self.request.user, video=video)

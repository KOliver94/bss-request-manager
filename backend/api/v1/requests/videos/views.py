from rest_framework.filters import OrderingFilter
from rest_framework.generics import get_object_or_404
from rest_framework.viewsets import ReadOnlyModelViewSet

from api.v1.requests.videos.serializers import VideoListRetrieveSerializer
from common.rest_framework.permissions import IsSelf
from video_requests.models import Request, Video


class VideoViewSet(ReadOnlyModelViewSet):
    filter_backends = [OrderingFilter]
    ordering_fields = ["status", "title"]
    ordering = ["title"]
    permission_classes = [IsSelf]
    serializer_class = VideoListRetrieveSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Video.objects.none()
        return Video.objects.prefetch_related("ratings").filter(
            request=get_object_or_404(
                Request, pk=self.kwargs["request_pk"], requester=self.request.user
            )
        )

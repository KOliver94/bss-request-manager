from django.contrib.auth.models import User
from django.db.models import Prefetch
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.viewsets import ModelViewSet

from api.v1.admin.helpers import serialize_history
from api.v1.admin.requests.videos.serializers import (
    VideoAdminCreateUpdateSerializer,
    VideoAdminListSerializer,
    VideoAdminRetrieveSerializer,
)
from common.rest_framework.permissions import IsStaffUser
from video_requests.models import Request, Video


class VideoAdminViewSet(ModelViewSet):
    filter_backends = [OrderingFilter]
    ordering = ["title"]
    ordering_fields = ["editor", "status", "title"]
    permission_classes = [IsStaffUser]

    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        self.perform_create(input_serializer)
        output_serializer = VideoAdminRetrieveSerializer(input_serializer.instance)
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data, status=HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return Video.objects.prefetch_related(
            Prefetch("editor", queryset=User.objects.prefetch_related("userprofile")),
            Prefetch("ratings"),
        ).filter(request=get_object_or_404(Request, pk=self.kwargs["request_pk"]))

    def get_serializer_class(self):
        if self.action == "list":
            return VideoAdminListSerializer
        if self.action == "retrieve":
            return VideoAdminRetrieveSerializer
        return VideoAdminCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs["request_pk"]),
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        input_serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        input_serializer.is_valid(raise_exception=True)
        self.perform_update(input_serializer)

        instance._prefetched_objects_cache = {}

        output_serializer = VideoAdminRetrieveSerializer(input_serializer.instance)

        return Response(output_serializer.data)

    @action(detail=True)
    def history(self, request, pk=None, request_pk=None):
        history_objects = (
            get_object_or_404(Video, pk=pk, request__pk=request_pk)
            .history.all()
            .order_by("-history_date")
        )
        return Response(serialize_history(history_objects))

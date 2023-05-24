from datetime import datetime

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404

from api.v1.admin.requests.serializers import (
    HistorySerializer,
    RequestAdminListSerializer,
    RequestAdminSerializer,
    VideoAdminListSerializer,
    VideoAdminSerializer,
)
from api.v1.requests.filters import RequestFilter, VideoFilter
from common.rest_framework.pagination import ExtendedPagination
from common.rest_framework.permissions import IsStaffSelfOrAdmin, IsStaffUser
from common.utilities import remove_calendar_event
from video_requests.models import Comment, Rating, Request, Video


class HistoryRetrieveView(generics.RetrieveAPIView):
    """
    Retrieve (GET) view for history of a certain object
    Supported objects: Requests, Comments, Videos, Ratings
    """

    serializer_class = HistorySerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        if "request_id_comment" in self.kwargs.keys():  # Comment object
            return Comment.objects.filter(
                request=get_object_or_404(Request, pk=self.kwargs["request_id_comment"])
            )
        elif "request_id_video" in self.kwargs.keys():  # Video object
            return Video.objects.filter(
                request=get_object_or_404(Request, pk=self.kwargs["request_id_video"])
            )
        elif "video_id" in self.kwargs.keys():  # Rating object
            return Rating.objects.filter(
                video=get_object_or_404(Video, pk=self.kwargs["video_id"]),
                video__request=get_object_or_404(Request, pk=self.kwargs["request_id"]),
            )
        else:  # Request object
            return Request.objects.all()


class RequestAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Request objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """

    permission_classes = [IsStaffUser]
    filter_backends = [
        filters.OrderingFilter,
        filters.SearchFilter,
        DjangoFilterBackend,
    ]
    ordering_fields = ["title", "created", "start_datetime", "status"]
    search_fields = ["title", "videos__title"]
    filterset_class = RequestFilter
    ordering = ["created"]
    pagination_class = ExtendedPagination
    queryset = Request.objects.all().cache()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return RequestAdminSerializer
        return RequestAdminListSerializer


class RequestAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Request object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff users can do anything except deleting requests which are not requested by them.
        (either requested_by or requester field is the user)
    - Admin users can do anything.
    """

    serializer_class = RequestAdminSerializer
    queryset = Request.objects.all()

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsStaffSelfOrAdmin()]
        else:
            return [IsStaffUser()]

    def destroy(self, request, *args, **kwargs):
        video_request = get_object_or_404(Request, pk=self.kwargs["pk"])
        remove_calendar_event.delay(video_request.id)
        return super().destroy(request, *args, **kwargs)


class VideoAdminListView(generics.ListAPIView):
    """
    List (GET) view for Video objects
    Only authenticated and authorized persons with Staff privilege can access this view.

    Lists all videos. Can be used for searching purposes.
    """

    serializer_class = VideoAdminListSerializer
    permission_classes = [IsStaffUser]
    filter_backends = [
        filters.OrderingFilter,
        filters.SearchFilter,
        DjangoFilterBackend,
    ]
    search_fields = ["title"]
    filterset_class = VideoFilter
    ordering_fields = [
        "title",
        "editor",
        "status",
        "request__start_datetime",
        "request__end_datetime",
    ]
    ordering = ["-request__start_datetime"]
    pagination_class = ExtendedPagination

    def get_queryset(self):
        is_date = False
        try:
            last_aired = self.request.query_params.get("last_aired", None)
            if last_aired and last_aired != "never":
                # Check date format only (do not convert to date type)
                datetime.strptime(last_aired, "%Y-%m-%d").date()
                is_date = True
        except ValueError:
            raise ValidationError({"last_aired": ["Invalid filter."]})

        """
        Additional data's aired part is ordered descending when model instance is being saved.
        That's why we can use the first element of the array because it will be the most recent date.
        When aired first element does not exist it's an empty array so it was never aired.
        The JSON validations are done by the json schema so we don't need to check.
        """
        if is_date:
            return Video.objects.filter(additional_data__aired__0__lte=last_aired)
        elif last_aired == "never":
            return Video.objects.filter(additional_data__aired__0__isnull=True)
        else:
            return Video.objects.all()


class VideoAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Video objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """

    serializer_class = VideoAdminSerializer
    permission_classes = [IsStaffUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["title", "editor", "status"]
    ordering = ["title"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Video.objects.none()
        return Video.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"])
        )

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"])
        )


class VideoAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Video object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """

    serializer_class = VideoAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Video.objects.none()
        return Video.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"])
        )

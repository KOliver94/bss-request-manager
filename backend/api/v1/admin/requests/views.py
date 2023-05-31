from datetime import datetime

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404

from api.v1.admin.requests.serializers import HistorySerializer
from api.v1.admin.requests.videos.serializers import VideoAdminListSerializer
from api.v1.requests.filters import VideoFilter
from common.rest_framework.pagination import ExtendedPagination
from common.rest_framework.permissions import IsStaffUser
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

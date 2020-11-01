from datetime import datetime

from api.v1.admin.requests.serializers import (
    CommentAdminSerializer,
    CrewMemberAdminSerializer,
    HistorySerializer,
    RatingAdminSerializer,
    RequestAdminListSerializer,
    RequestAdminSerializer,
    VideoAdminListSerializer,
    VideoAdminSerializer,
)
from api.v1.requests.filters import RequestFilter, VideoFilter
from common.pagination import ExtendedPagination
from common.permissions import IsStaffSelfOrAdmin, IsStaffUser
from common.utilities import remove_calendar_event
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from video_requests.models import Comment, CrewMember, Rating, Request, Video


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

    def get_serializer_class(self):
        if self.request.method == "POST":
            return RequestAdminSerializer
        return RequestAdminListSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Request.objects.none()
        return Request.objects.all().cache()

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


class RequestAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Request object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """

    serializer_class = RequestAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Request.objects.none()
        return Request.objects.all()

    def destroy(self, request, *args, **kwargs):
        video_request = get_object_or_404(Request, pk=self.kwargs["pk"])
        if (
            video_request.additional_data
            and "calendar_id" in video_request.additional_data
        ):
            remove_calendar_event.delay(video_request.additional_data["calendar_id"])
        return super(RequestAdminDetailView, self).destroy(request, *args, **kwargs)


class CommentAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Comment objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and admin members can read every comment and create new ones.
    """

    serializer_class = CommentAdminSerializer
    permission_classes = [IsStaffUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created", "author", "internal"]
    ordering = ["created"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Comment.objects.none()
        return Comment.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"])
        )

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"]),
            author=self.request.user,
        )


class CommentAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Comment object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff members can read every comment but can only modify and delete those which are his own.
    - Admin members can do anything.
    """

    serializer_class = CommentAdminSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsStaffUser()]
        else:
            return [IsStaffSelfOrAdmin()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Comment.objects.none()
        return Comment.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"])
        )


class CrewAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for CrewMember objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """

    serializer_class = CrewMemberAdminSerializer
    permission_classes = [IsStaffUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["member", "position"]
    ordering = ["position"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return CrewMember.objects.none()
        return CrewMember.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"])
        )

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"])
        )


class CrewAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single CrewMember object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """

    serializer_class = CrewMemberAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return CrewMember.objects.none()
        return CrewMember.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs["request_id"])
        )


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
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Video.objects.none()
        else:
            is_date = False
            try:
                last_aired = self.request.query_params.get("last_aired", None)
                if last_aired and last_aired != "never":
                    # Check date format only (do not convert to date type)
                    datetime.strptime(last_aired, "%Y-%m-%d").date()
                    is_date = True
            except ValueError:
                raise ValidationError("Invalid filter.")

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


class RatingAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Rating objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and admin members can read every rating but can create only one to each video.
    """

    serializer_class = RatingAdminSerializer
    permission_classes = [IsStaffUser]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created", "author", "rating", "review"]
    ordering = ["created"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Rating.objects.none()
        return Rating.objects.filter(
            video=get_object_or_404(Video, pk=self.kwargs["video_id"]),
            video__request=get_object_or_404(Request, pk=self.kwargs["request_id"]),
        )

    def perform_create(self, serializer):
        """
        Check if the user has already rated a video. If so do not allow multiple ratings.
        A Video cannot be rated before being edited (reached status 3).
        """
        if get_object_or_404(Video, pk=self.kwargs["video_id"]).status < 3:
            raise ValidationError("The video has not been edited yet.")

        if Rating.objects.filter(
            video=get_object_or_404(Video, pk=self.kwargs["video_id"]),
            author=self.request.user,
        ).exists():
            raise ValidationError("You have already posted a rating.")

        serializer.save(
            video=get_object_or_404(
                Video,
                pk=self.kwargs["video_id"],
                request=get_object_or_404(Request, pk=self.kwargs["request_id"]),
            ),
            author=self.request.user,
        )


class RatingAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Rating object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff members can read every rating but can only modify and delete those which are his own.
    - Admin members can do anything.
    """

    serializer_class = RatingAdminSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsStaffUser()]
        else:
            return [IsStaffSelfOrAdmin()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Rating.objects.none()
        return Rating.objects.filter(
            video=get_object_or_404(Video, pk=self.kwargs["video_id"]),
            video__request=get_object_or_404(Request, pk=self.kwargs["request_id"]),
        )

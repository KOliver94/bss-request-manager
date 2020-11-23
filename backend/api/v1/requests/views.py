from api.v1.requests.filters import RequestFilter
from api.v1.requests.serializers import (
    CommentDefaultSerializer,
    RatingDefaultSerializer,
    RequestAnonymousSerializer,
    RequestDefaultListSerializer,
    RequestDefaultSerializer,
    VideoDefaultSerializer,
)
from common.pagination import ExtendedPagination
from common.permissions import IsSelf
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import AllowAny, IsAuthenticated
from video_requests.models import Comment, Rating, Request, Video


class RequestDefaultListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Request objects

    The Create view is accessible by anyone.

    Only authenticated and authorized persons can access the list view:
    - Authenticated users can get Requests which are submitted by them.
    """

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

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        else:
            return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.user.is_anonymous:
            return RequestAnonymousSerializer
        if self.request.method == "POST":
            return RequestDefaultSerializer
        return RequestDefaultListSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Request.objects.none()
        return Request.objects.filter(requester=self.request.user)


class RequestDefaultDetailView(generics.RetrieveAPIView):
    """
    Retrieve (GET) view for a single Request object

    Only authenticated and authorized persons can access this view:
    - Authenticated users can get Requests which are submitted by them. No other operation are available.
    """

    serializer_class = RequestDefaultSerializer
    permission_classes = [IsSelf]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Request.objects.none()
        return Request.objects.filter(requester=self.request.user)


class CommentDefaultListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Comment objects

    Only authenticated and authorized persons can access this view:
    - If the user is the requester of the Request object he can list all not internal comments and create new ones.
    """

    serializer_class = CommentDefaultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created", "author"]
    ordering = ["created"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Comment.objects.none()
        return Comment.objects.filter(
            request=get_object_or_404(
                Request, pk=self.kwargs["request_id"], requester=self.request.user
            ),
            internal=False,
        )

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(
                Request, pk=self.kwargs["request_id"], requester=self.request.user
            ),
            author=self.request.user,
        )


class CommentDefaultDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Comment object

    Only authenticated and authorized persons can access this view:
    - If the user was the author he can modify and delete his own comment.
        A user can access all comments related to his request and not internal.
    """

    serializer_class = CommentDefaultSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated()]
        else:
            return [IsSelf()]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Comment.objects.none()
        return Comment.objects.filter(
            request=get_object_or_404(
                Request, pk=self.kwargs["request_id"], requester=self.request.user
            ),
            internal=False,
        )


class VideoDefaultListView(generics.ListAPIView):
    """
    List (GET) view for Video objects

    Only authenticated and authorized persons access this view:
    - Authenticated users can get Videos which are related to Requests submitted by them.
    """

    serializer_class = VideoDefaultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["title", "status"]
    ordering = ["title"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Video.objects.none()
        return Video.objects.filter(
            request=get_object_or_404(
                Request, pk=self.kwargs["request_id"], requester=self.request.user
            )
        )


class VideoDefaultDetailView(generics.RetrieveAPIView):
    """
    Retrieve (GET) view for a single Video object

    Only authenticated and authorized persons can access this view:
    - Authenticated users can get Videos which are related to Requests submitted by them.
    """

    serializer_class = VideoDefaultSerializer
    permission_classes = [IsSelf]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Video.objects.none()
        return Video.objects.filter(
            request=get_object_or_404(
                Request, pk=self.kwargs["request_id"], requester=self.request.user
            )
        )


class RatingDefaultListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Rating objects

    Only authenticated and authorized persons can access this view:
    - If the user was the author he can list his ratings (should be only one per Video object)
        and create one (if he was the requester of the Request which contains this video).
    """

    serializer_class = RatingDefaultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created", "author", "rating", "review"]
    ordering = ["created"]

    def get_video_related_to_user(self):
        return get_object_or_404(
            Video,
            pk=self.kwargs["video_id"],
            request=get_object_or_404(
                Request, pk=self.kwargs["request_id"], requester=self.request.user
            ),
        )

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Rating.objects.none()
        return Rating.objects.filter(
            video=self.get_video_related_to_user(), author=self.request.user
        )

    def perform_create(self, serializer):
        """
        Check if the user has already rated a video. If so do not allow multiple ratings.
        The user should only post to videos which are related to a request by him.
        A Video cannot be rated before being published (reached status 5).
        """
        if (
            get_object_or_404(Video, pk=self.kwargs["video_id"]).status
            < Video.Statuses.PUBLISHED
        ):
            raise ValidationError("The video has not been published yet.")

        if Rating.objects.filter(
            video=self.get_video_related_to_user(), author=self.request.user
        ).exists():
            raise ValidationError("You have already posted a rating to this video.")

        serializer.save(
            video=self.get_video_related_to_user(), author=self.request.user
        )


class RatingDefaultDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Rating object

    Only authenticated and authorized persons can access this view:
    - If the user was the author he can access, modify and delete his own rating.
    """

    serializer_class = RatingDefaultSerializer
    permission_classes = [IsSelf]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Rating.objects.none()
        return Rating.objects.filter(
            video=get_object_or_404(
                Video,
                pk=self.kwargs["video_id"],
                request=get_object_or_404(
                    Request, pk=self.kwargs["request_id"], requester=self.request.user
                ),
            ),
            author=self.request.user,
        )

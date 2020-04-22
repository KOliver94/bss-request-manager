from rest_framework import generics, filters
from rest_framework.exceptions import ValidationError, NotAuthenticated
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny

from api.v1.requests.serializers import RequestDefaultSerializer, CommentDefaultSerializer, VideoDefaultSerializer, \
    RatingDefaultSerializer, RequestAnonymousSerializer
from common.permissions import IsSelf
from video_requests.models import Request, Comment, Video, Rating


class RequestDefaultListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Request objects

    The Create view is accessible by anyone.

    Only authenticated and authorized persons can access the list view:
    - Authenticated users can get Requests which are submitted by them.
    """
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['title', 'created', 'start_datetime', 'status']
    ordering = ['created']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [AllowAny()]
        else:
            return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.user.is_anonymous:
            return RequestAnonymousSerializer
        return RequestDefaultSerializer

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return Request.objects.none()
        return Request.objects.filter(
            requester=self.request.user
        )


class RequestDefaultDetailView(generics.RetrieveAPIView):
    """
    Retrieve (GET) view for a single Request object

    Only authenticated and authorized persons can access this view:
    - Authenticated users can get Requests which are submitted by them. No other operation are available.
    """
    serializer_class = RequestDefaultSerializer

    def get_permissions(self):
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        return [IsSelf()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return Request.objects.none()
        return Request.objects.filter(
            requester=self.request.user
        )


class CommentDefaultListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Comment objects

    Only authenticated and authorized persons can access this view:
    - If the user is the requester of the Request object he can list all not internal comments and create new ones.
    """
    serializer_class = CommentDefaultSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created', 'author']
    ordering = ['created']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return Comment.objects.none()
        return Comment.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['request_id'], requester=self.request.user),
            internal=False
        )

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs['request_id'], requester=self.request.user),
            author=self.request.user
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
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        else:
            return [IsSelf()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return Comment.objects.none()
        return Comment.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['request_id'], requester=self.request.user),
            internal=False
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
    ordering_fields = ['title', 'status']
    ordering = ['title']

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return Video.objects.none()
        return Video.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['request_id'], requester=self.request.user)
        )


class VideoDefaultDetailView(generics.RetrieveAPIView):
    """
    Retrieve (GET) view for a single Video object

    Only authenticated and authorized persons can access this view:
    - Authenticated users can get Videos which are related to Requests submitted by them.
    """
    serializer_class = VideoDefaultSerializer

    def get_permissions(self):
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        return [IsSelf()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return Video.objects.none()
        return Video.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['request_id'], requester=self.request.user)
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
    ordering_fields = ['created', 'author', 'rating', 'review']
    ordering = ['created']

    def get_video_related_to_user(self):
        return get_object_or_404(Video,
                                 pk=self.kwargs['video_id'],
                                 request=get_object_or_404(Request,
                                                           pk=self.kwargs['request_id'],
                                                           requester=self.request.user))

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return Rating.objects.none()
        return Rating.objects.filter(
            video=self.get_video_related_to_user(),
            author=self.request.user
        )

    def perform_create(self, serializer):
        """
        Check if the user has already rated a video. If so do not allow multiple ratings.
        The user should only post to videos which are related to a request by him.
        """
        if Rating.objects.filter(video=self.get_video_related_to_user(), author=self.request.user).exists():
            raise ValidationError('You have already posted a rating to this video.')

        serializer.save(
            video=self.get_video_related_to_user(),
            author=self.request.user
        )


class RatingDefaultDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Rating object

    Only authenticated and authorized persons can access this view:
    - If the user was the author he can access, modify and delete his own rating.
    """
    serializer_class = RatingDefaultSerializer

    def get_permissions(self):
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        return [IsSelf()]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            # queryset just for schema generation metadata
            return Rating.objects.none()
        return Rating.objects.filter(
            video=get_object_or_404(Video, pk=self.kwargs['video_id'],
                                    request=get_object_or_404(Request, pk=self.kwargs['request_id'],
                                                              requester=self.request.user)),
            author=self.request.user
        )

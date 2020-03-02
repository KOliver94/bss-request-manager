from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from requests.api.user.serializers import RequestDefaultSerializer, CommentDefaultSerializer, VideoDefaultSerializer, \
    RatingDefaultSerializer
from requests.models import Request, Comment, Video, Rating
from requests.permissions import IsSelf


class RequestDefaultListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Request objects

    The Create view is accessible by anyone.

    Only authenticated and authorized persons can access the list view:
    - Authenticated users can get Requests which are submitted by them.
    """
    serializer_class = RequestDefaultSerializer

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if self.request.user.is_anonymous:
            return Request.objects.none()
        else:
            return Request.objects.filter(
                requester=self.request.user
            )

    def perform_create(self, serializer):
        # TODO: Anonym users will cause problems
        serializer.save(
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
        return [IsSelf()]

    def get_queryset(self):
        if self.request.user.is_anonymous:
            return Request.objects.none()
        else:
            return Request.objects.filter(
                requester=self.request.user
            )


class VideoDefaultListView(generics.ListAPIView):
    """
    List (GET) view for Video objects

    Only authenticated and authorized persons access this view:
    - Authenticated users can get Videos which are related to Requests submitted by them.
    """
    serializer_class = VideoDefaultSerializer

    def get_permissions(self):
        return [IsSelf()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if self.request.user.is_anonymous:
            return Request.objects.none()
        else:
            return Video.objects.filter(
                request=Request.objects.get(
                    id=self.kwargs['requestId'],
                    requester=self.request.user
                )
            )


class VideoDefaultDetailView(generics.RetrieveAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Video object

    Only authenticated and authorized persons can access this view:
    - Authenticated users can get Videos which are related to Requests submitted by them.
    """
    serializer_class = VideoDefaultSerializer

    def get_permissions(self):
        return [IsSelf()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if self.request.user.is_anonymous:
            return Request.objects.none()
        else:
            return Video.objects.filter(
                request=Request.objects.get(
                    id=self.kwargs['requestId'],
                    requester=self.request.user
                )
            )


class CommentDefaultListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Comment objects

    Only authenticated and authorized persons can access this view:
    - If the user is the requester of the Request object he can list all not internal comments and create new ones.
    """
    serializer_class = CommentDefaultSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        If the requester is anonymous :return: Not found
        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if self.request.user.is_anonymous:
            return Comment.objects.none()
        else:
            return Comment.objects.filter(
                request=Request.objects.get(
                    id=self.kwargs['requestId'],
                    requester=self.request.user
                ),
                internal=False
            )

    def perform_create(self, serializer):
        if Request.objects.get(id=self.kwargs['requestId'], requester=self.request.user).requester != self.request.user:
            raise ValidationError('You are trying to post a comment to a request which is unrelated to you.')

        serializer.save(
            request=Request.objects.get(
                id=self.kwargs['requestId'],
                requester=self.request.user
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
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        else:
            return [IsSelf()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        If the requester is anonymous :return: Not found
        To prevent side-channel attacks :return: Not found if the user would not have right to access it

        Not Staff user can only access non-internal comments.
        """
        if self.request.user.is_anonymous:
            return Comment.objects.none()
        else:
            return Comment.objects.filter(
                request=Request.objects.get(
                    id=self.kwargs['requestId'],
                    requester=self.request.user
                ),
                internal=False
            )


class RatingDefaultListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Rating objects

    Only authenticated and authorized persons can access this view:
    - If the user was the author he can list his ratings (should be only one per Video object)
        and create one (if he was the requester of the Request which contains this video).
    """
    serializer_class = RatingDefaultSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsSelf()]
        elif self.request.method == 'POST':
            return [IsAuthenticated()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        If the requester is anonymous :return: Not found
        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if self.request.user.is_anonymous:
            return Rating.objects.none()
        else:
            return Rating.objects.filter(
                video=self.kwargs['videoId'],
                author=self.request.user
            )

    def perform_create(self, serializer):
        """
        Check if the user has already rated a video. If so do not allow multiple ratings.
        The user should only post to videos which are related to a request by him.
        """
        if Rating.objects.filter(author=self.request.user).exists():
            raise ValidationError('You have already posted a rating to this video.')

        if Video.objects.get(id=self.kwargs['videoId']).request.requester != self.request.user:
            raise ValidationError('You are trying to post a rating to a video which is unrelated to you.')

        serializer.save(
            video=Video.objects.get(
                id=self.kwargs['videoId']
            ),
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
        return [IsSelf()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        If the requester is anonymous :return: Not found
        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if self.request.user.is_anonymous:
            return Rating.objects.none()
        else:
            return Rating.objects.filter(
                video=Video.objects.get(
                    request=self.kwargs['requestId'],
                    id=self.kwargs['videoId']
                ),
                author=self.request.user
            )

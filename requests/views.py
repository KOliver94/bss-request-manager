from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from .models import Request, Comment, CrewMember, Video, Rating
from .permissions import IsStaffUser, IsSelfOrStaff, IsSelfOrAdmin
from .serializers import RequestSerializer, CommentSerializer, CrewMemberSerializer, VideoSerializer, RatingSerializer


class RequestListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Request objects

    The Create view is accessible by anyone.

    Only authenticated and authorized persons can access the list view:
    - Authenticated users can get Requests which are submitted by them.
    - Staff and Admin users can do anything.
    """
    # TODO: Change serializer for non Staff users
    serializer_class = RequestSerializer

    def get_queryset(self):
        if self.request.user.is_anonymous:
            return Request.objects.none()

        if not self.request.user.is_staff:
            return Request.objects.filter(
                requester=self.request.user
            )
        else:
            return Request.objects.all()


class RequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Request object

    Only authenticated and authorized persons can access this view:
    - Authenticated users can get Requests which are submitted by them. No other operation are available for them.
    - Staff and Admin users can do anything.
    """
    # TODO: Change serializer for non Staff users
    serializer_class = RequestSerializer
    permission_classes = (IsAuthenticated,)

    def get_permissions(self):
        if not self.request.method == 'GET':
            return [IsStaffUser()]

    def get_queryset(self):
        if self.request.user.is_anonymous:
            return Request.objects.none()

        if not self.request.user.is_staff:
            return Request.objects.filter(
                requester=self.request.user
            )
        else:
            return Request.objects.all()


class CrewListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for CrewMember objects

    Only authenticated and authorized persons can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = CrewMemberSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        return CrewMember.objects.filter(
            request=self.kwargs['requestId']
        )

    def perform_create(self, serializer):
        serializer.save(
            request=Request.objects.get(
                id=self.kwargs['requestId']
            )
        )


class CrewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single CrewMember object

    Only authenticated and authorized persons can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = CrewMemberSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        return CrewMember.objects.filter(
            request=self.kwargs['requestId']
        )


class VideoListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Video objects

    Only authenticated and authorized persons can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = VideoSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        return Video.objects.filter(
            request=self.kwargs['requestId']
        )

    def perform_create(self, serializer):
        serializer.save(
            request=Request.objects.get(
                id=self.kwargs['requestId']
            )
        )


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Video object

    Only authenticated and authorized persons can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = VideoSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        return Video.objects.filter(
            request=self.kwargs['requestId']
        )


class CommentListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Comment objects

    Only authenticated and authorized persons can access this view:
    - If the user is the requester of the Request object he can list all not internal comments and create new ones.
    - Staff and admin members can read every comment and create new ones.
    """
    serializer_class = CommentSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        If the requester is anonymous :return: Not found
        To prevent side-channel attacks :return: Not found if the user would not have right to access it

        Not Staff user can only access non-internal comments.
        """
        if self.request.user.is_anonymous:
            return Comment.objects.none()

        if not self.request.user.is_staff:
            return Comment.objects.filter(
                request=self.kwargs['requestId'],
                internal=False
            )
        else:
            return Comment.objects.filter(
                request=self.kwargs['requestId']
            )

    def perform_create(self, serializer):
        """
        If the user is not staff override the internal attribute to False
        """
        if not self.request.user.is_staff:
            serializer.save(
                request=Request.objects.get(
                    id=self.kwargs['requestId']
                ),
                author=self.request.user,
                internal=False
            )
        else:
            serializer.save(
                request=Request.objects.get(
                    id=self.kwargs['requestId']
                ),
                author=self.request.user,
            )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Comment object

    Only authenticated and authorized persons can access this view:
    - If the user was the author he can modify and delete his own comment.
        A user can access all comments related to his request and not internal.
    - Staff members can read every comment but can only modify and delete those which are his own.
    - Admin members can do anything.
    """
    serializer_class = CommentSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        else:
            return [IsSelfOrAdmin()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        If the requester is anonymous :return: Not found
        To prevent side-channel attacks :return: Not found if the user would not have right to access it

        Not Staff user can only access non-internal comments.
        """
        if self.request.user.is_anonymous:
            return Comment.objects.none()

        if not self.request.user.is_staff:
            return Comment.objects.filter(
                request=self.kwargs['requestId'],
                internal=False
            )
        else:
            return Comment.objects.filter(
                request=self.kwargs['requestId']
            )


class RatingListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Rating objects

    Only authenticated and authorized persons can access this view:
    - If the user was the author he can list his ratings (should be only one per Video object)
        and create one (if he was the requester of the Request which contains this video).
    - Staff and admin members can read every rating but can create only one (to any video).
    """
    serializer_class = RatingSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsSelfOrStaff()]
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

        if not self.request.user.is_staff:
            return Rating.objects.filter(
                video=self.kwargs['videoId'],
                author=self.request.user
            )
        else:
            return Rating.objects.filter(
                video=self.kwargs['videoId']
            )

    def perform_create(self, serializer):
        """
        Check if the user has already rated a video. If so do not allow multiple ratings.
        Check if the user is not staff he should only post to videos which are related to a request by him.
        """
        queryset = Rating.objects.filter(author=self.request.user)
        if queryset.exists():
            raise ValidationError('You have already posted a rating')

        if not self.request.user.is_staff:
            if Video.objects.get(id=self.kwargs['videoId']).request.requester != self.request.user:
                raise ValidationError('You are trying to post a rating to a video which is unrelated to you')

        serializer.save(
            video=Video.objects.get(
                id=self.kwargs['videoId']
            ),
            author=self.request.user
        )


class RatingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Rating object

    Only authenticated and authorized persons can access this view:
    - If the user was the author he can access, modify and delete his own rating.
    - Staff members can read every rating but can only modify and delete those which are his own.
    - Admin members can do anything.
    """
    serializer_class = RatingSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsSelfOrStaff()]
        else:
            return [IsSelfOrAdmin()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        If the requester is anonymous :return: Not found
        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if self.request.user.is_anonymous:
            return Rating.objects.none()

        if not self.request.user.is_staff:
            return Rating.objects.filter(
                video=Video.objects.get(
                    request=self.kwargs['requestId'],
                    id=self.kwargs['videoId']
                ),
                author=self.request.user
            )
        else:
            return Rating.objects.filter(
                video=Video.objects.get(
                    request=self.kwargs['requestId'],
                    id=self.kwargs['videoId']
                )
            )

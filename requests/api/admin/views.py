from rest_framework import generics
from rest_framework.exceptions import ValidationError

from requests.api.admin.serializers import RequestAdminSerializer, CommentAdminSerializer, CrewMemberAdminSerializer, \
    VideoAdminSerializer, RatingAdminSerializer
from requests.models import Request, Comment, CrewMember, Video, Rating
from requests.permissions import IsStaffUser, IsStaffSelfOrAdmin


class RequestAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Request objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = RequestAdminSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Request.objects.none()
        else:
            return Request.objects.all()

    def perform_create(self, serializer):
        serializer.save(
            requester=self.request.user
        )


class RequestAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Request object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = RequestAdminSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Request.objects.none()
        else:
            return Request.objects.all()


class CrewAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for CrewMember objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = CrewMemberAdminSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Request.objects.none()
        else:
            return CrewMember.objects.filter(
                request=self.kwargs['requestId']
            )

    def perform_create(self, serializer):
        serializer.save(
            request=Request.objects.get(
                id=self.kwargs['requestId']
            )
        )


class CrewAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single CrewMember object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = CrewMemberAdminSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Request.objects.none()
        else:
            return CrewMember.objects.filter(
                request=self.kwargs['requestId']
            )


class VideoAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Video objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = VideoAdminSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Request.objects.none()
        else:
            return Video.objects.filter(
                request=self.kwargs['requestId']
            )

    def perform_create(self, serializer):
        serializer.save(
            request=Request.objects.get(
                id=self.kwargs['requestId']
            )
        )


class VideoAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve (GET), Update (PUT, PATCH) and Delete (DELETE) view for a single Video object

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = VideoAdminSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Request.objects.none()
        else:
            return Video.objects.filter(
                request=self.kwargs['requestId']
            )


class CommentAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Comment objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and admin members can read every comment and create new ones.
    """
    serializer_class = CommentAdminSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Comment.objects.none()
        else:
            return Comment.objects.filter(
                request=self.kwargs['requestId']
            )

    def perform_create(self, serializer):
        serializer.save(
            request=Request.objects.get(
                id=self.kwargs['requestId']
            ),
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
        if self.request.method == 'GET':
            return [IsStaffUser()]
        else:
            return [IsStaffSelfOrAdmin()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Comment.objects.none()
        else:
            return Comment.objects.filter(
                request=self.kwargs['requestId']
            )


class RatingAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Rating objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and admin members can read every rating but can create only one to each video.
    """
    serializer_class = RatingAdminSerializer
    permission_classes = (IsStaffUser,)

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Rating.objects.none()
        else:
            return Rating.objects.filter(
                video=self.kwargs['videoId']
            )

    def perform_create(self, serializer):
        """
        Check if the user has already rated a video. If so do not allow multiple ratings.
        """
        queryset = Rating.objects.filter(author=self.request.user)
        if queryset.exists():
            raise ValidationError('You have already posted a rating.')

        serializer.save(
            video=Video.objects.get(
                id=self.kwargs['videoId']
            ),
            author=self.request.user
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
        if self.request.method == 'GET':
            return [IsStaffUser()]
        else:
            return [IsStaffSelfOrAdmin()]

    def get_queryset(self):
        """
        Filter the objects based on roles and rights.

        To prevent side-channel attacks :return: Not found if the user would not have right to access it
        """
        if not self.request.user.is_staff:
            return Rating.objects.none()
        else:
            return Rating.objects.filter(
                video=Video.objects.get(
                    request=self.kwargs['requestId'],
                    id=self.kwargs['videoId']
                )
            )

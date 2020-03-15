from rest_framework import generics
from rest_framework.exceptions import ValidationError, NotAuthenticated, PermissionDenied
from rest_framework.generics import get_object_or_404

from api.v1.admin.requests.serializers import RequestAdminSerializer, CommentAdminSerializer, CrewMemberAdminSerializer, \
    VideoAdminSerializer, RatingAdminSerializer
from video_requests.models import Request, Comment, CrewMember, Video, Rating
from video_requests.permissions import IsStaffUser, IsStaffSelfOrAdmin


class RequestAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Request objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = RequestAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
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
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        return Request.objects.all()


class CommentAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Comment objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and admin members can read every comment and create new ones.
    """
    serializer_class = CommentAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        return Comment.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['requestId'])
        )

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs['requestId']),
            author=self.request.user
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
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        elif not self.request.user.is_staff:
            raise PermissionDenied()
        if self.request.method == 'GET':
            return [IsStaffUser()]
        else:
            return [IsStaffSelfOrAdmin()]

    def get_queryset(self):
        return Comment.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['requestId'])
        )


class CrewAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for CrewMember objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = CrewMemberAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        return CrewMember.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['requestId'])
        )

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs['requestId'])
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
        return CrewMember.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['requestId'])
        )


class VideoAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Video objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and Admin users can do anything.
    """
    serializer_class = VideoAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        return Video.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['requestId'])
        )

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs['requestId'])
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
        return Video.objects.filter(
            request=get_object_or_404(Request, pk=self.kwargs['requestId'])
        )


class RatingAdminListCreateView(generics.ListCreateAPIView):
    """
    List (GET) and Create (POST) view for Rating objects

    Only authenticated and authorized persons with Staff privilege can access this view:
    - Staff and admin members can read every rating but can create only one to each video.
    """
    serializer_class = RatingAdminSerializer
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        return Rating.objects.filter(
            video=get_object_or_404(Video, pk=self.kwargs['videoId']),
            video__request=get_object_or_404(Request, pk=self.kwargs['requestId'])
        )

    def perform_create(self, serializer):
        """
        Check if the user has already rated a video. If so do not allow multiple ratings.
        """
        if Rating.objects.filter(
                video=get_object_or_404(Video, pk=self.kwargs['videoId']), author=self.request.user).exists():
            raise ValidationError('You have already posted a rating.')

        serializer.save(
            video=get_object_or_404(
                Video, pk=self.kwargs['videoId'], request=get_object_or_404(Request, pk=self.kwargs['requestId'])),
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
        if self.request.user.is_anonymous:
            raise NotAuthenticated()
        elif not self.request.user.is_staff:
            raise PermissionDenied()
        if self.request.method == 'GET':
            return [IsStaffUser()]
        else:
            return [IsStaffSelfOrAdmin()]

    def get_queryset(self):
        return Rating.objects.filter(
            video=get_object_or_404(Video, pk=self.kwargs['videoId']),
            video__request=get_object_or_404(Request, pk=self.kwargs['requestId'])
        )

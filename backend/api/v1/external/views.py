from api.v1.external.serializers import RequestExternalSerializer
from api.v1.requests.serializers import CommentDefaultSerializer
from common.permissions import IsServiceAccount
from rest_framework import generics
from rest_framework.generics import get_object_or_404
from video_requests.models import Request


class RequestExternalCreateView(generics.CreateAPIView):
    """
    Create (POST) view for Request objects

    Only authenticated and authorized persons of a certain group (service account) can access this view:
    - Authenticated users of a certain group can create Requests.
    """

    serializer_class = RequestExternalSerializer
    permission_classes = [IsServiceAccount]


class RequestExternalDetailView(generics.RetrieveAPIView):
    """
    Retrieve (GET) view for a single Request object

    Only authenticated and authorized persons of a certain group (service account) can access this view:
    - Authenticated users of a certain group can get Requests which are submitted by them.
    """

    serializer_class = RequestExternalSerializer
    permission_classes = [IsServiceAccount]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            # queryset just for schema generation metadata
            return Request.objects.none()
        return Request.objects.filter(requested_by=self.request.user)


class CommentExternalListCreateView(generics.CreateAPIView):
    """
    Create (POST) view for Comment objects

    Only authenticated and authorized persons of a certain group (service account) can access this view:
    - If the user is the submitter of the Request object (requested_by) he can create new comments.
    """

    serializer_class = CommentDefaultSerializer
    permission_classes = [IsServiceAccount]

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(
                Request, pk=self.kwargs["request_id"], requested_by=self.request.user
            ),
            author=self.request.user,
        )

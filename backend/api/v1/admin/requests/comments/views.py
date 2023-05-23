from django.contrib.auth.models import User
from django.db.models import Prefetch
from rest_framework.filters import OrderingFilter
from rest_framework.generics import (
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
    get_object_or_404,
)

from api.v1.admin.requests.comments.serializers import (
    CommentAdminCreateUpdateSerializer,
    CommentAdminListDetailSerializer,
)
from common.rest_framework.permissions import IsStaffSelfOrAdmin, IsStaffUser
from video_requests.models import Comment, Request


class CommentAdminListCreateView(ListCreateAPIView):
    filter_backends = [OrderingFilter]
    ordering = ["created"]
    ordering_fields = ["author", "created", "internal"]
    permission_classes = [IsStaffUser]

    def get_queryset(self):
        return Comment.objects.prefetch_related(
            Prefetch("author", queryset=User.objects.prefetch_related("userprofile"))
        ).filter(request=get_object_or_404(Request, pk=self.kwargs["request_id"]))

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CommentAdminCreateUpdateSerializer
        return CommentAdminListDetailSerializer

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            request=get_object_or_404(Request, pk=self.kwargs["request_id"]),
        )


class CommentAdminDetailUpdateDeleteView(RetrieveUpdateDestroyAPIView):
    def get_permissions(self):
        # Staff members can read every comment but can only modify and delete those which were created by them.
        if self.request.method == "GET":
            return [IsStaffUser()]
        return [IsStaffSelfOrAdmin()]

    def get_queryset(self):
        return Comment.objects.prefetch_related(
            Prefetch("author", queryset=User.objects.prefetch_related("userprofile"))
        ).filter(request=get_object_or_404(Request, pk=self.kwargs["request_id"]))

    def get_serializer_class(self):
        if self.request.method == "GET":
            return CommentAdminListDetailSerializer
        return CommentAdminCreateUpdateSerializer

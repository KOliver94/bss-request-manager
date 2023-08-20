from rest_framework.filters import OrderingFilter
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.viewsets import ModelViewSet

from api.v1.admin.requests.crew.serializers import (
    CrewMemberAdminCreateUpdateSerializer,
    CrewMemberAdminListRetrieveSerializer,
)
from common.rest_framework.permissions import IsStaffUser
from video_requests.models import CrewMember, Request


class CrewMemberAdminViewSet(ModelViewSet):
    filter_backends = [OrderingFilter]
    ordering = ["position"]
    ordering_fields = ["member", "position"]
    permission_classes = [IsStaffUser]

    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        self.perform_create(input_serializer)
        output_serializer = CrewMemberAdminListRetrieveSerializer(
            input_serializer.instance, context=self.get_serializer_context()
        )
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data, status=HTTP_201_CREATED, headers=headers
        )

    def get_queryset(self):
        return CrewMember.objects.select_related("member__userprofile").filter(
            request=get_object_or_404(Request, pk=self.kwargs["request_pk"])
        )

    def get_serializer_class(self):
        if self.request.method == "GET":
            return CrewMemberAdminListRetrieveSerializer
        return CrewMemberAdminCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(
            request=get_object_or_404(Request, pk=self.kwargs["request_pk"])
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        input_serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        input_serializer.is_valid(raise_exception=True)
        self.perform_update(input_serializer)

        instance._prefetched_objects_cache = {}

        output_serializer = CrewMemberAdminListRetrieveSerializer(
            input_serializer.instance, context=self.get_serializer_context()
        )

        return Response(output_serializer.data)

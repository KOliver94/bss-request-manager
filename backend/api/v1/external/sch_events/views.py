from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.generics import CreateAPIView, RetrieveAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED

from api.v1.external.sch_events.serializers import (
    RequestExternalSchEventsCreateSerializer,
)
from api.v1.requests.comments.serializers import CommentCreateUpdateSerializer
from api.v1.requests.requests.serializers import RequestRetrieveSerializer
from common.rest_framework.permissions import IsServiceAccount
from video_requests.models import Request


@extend_schema(
    request=RequestExternalSchEventsCreateSerializer,
    responses=RequestRetrieveSerializer,
)
class RequestExternalSchEventsCreateView(CreateAPIView):
    permission_classes = [IsServiceAccount]
    serializer_class = RequestExternalSchEventsCreateSerializer

    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        self.perform_create(input_serializer)
        output_serializer = RequestRetrieveSerializer(
            input_serializer.instance, context=self.get_serializer_context()
        )
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data, status=HTTP_201_CREATED, headers=headers
        )


class RequestExternalSchEventsRetrieveView(RetrieveAPIView):
    permission_classes = [IsServiceAccount]
    serializer_class = RequestRetrieveSerializer

    def get_queryset(self):
        return Request.objects.filter(requested_by=self.request.user)


class CommentExternalSchEventsCreateView(generics.CreateAPIView):
    permission_classes = [IsServiceAccount]
    serializer_class = CommentCreateUpdateSerializer

    def perform_create(self, serializer):
        serializer.save(
            author=self.request.user,
            request=get_object_or_404(
                Request, pk=self.kwargs["request_pk"], requested_by=self.request.user
            ),
        )

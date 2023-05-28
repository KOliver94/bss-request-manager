from django.contrib.auth.models import User
from django.db.models import Count, Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.status import HTTP_201_CREATED
from rest_framework.viewsets import ModelViewSet

from api.v1.admin.requests.requests.serializers import (
    RequestAdminCreateSerializer,
    RequestAdminDetailSerializer,
    RequestAdminListSerializer,
    RequestAdminUpdateSerializer,
)
from api.v1.requests.filters import RequestFilter
from common.rest_framework.pagination import ExtendedPagination
from common.rest_framework.permissions import IsStaffSelfOrAdmin, IsStaffUser
from common.utilities import remove_calendar_event
from video_requests.models import CrewMember, Request


class RequestAdminViewSet(ModelViewSet):
    filter_backends = [
        DjangoFilterBackend,
        OrderingFilter,
    ]
    filterset_class = RequestFilter
    ordering = ["created"]
    ordering_fields = ["created", "start_datetime", "status", "title"]
    pagination_class = ExtendedPagination

    def create(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        self.perform_create(input_serializer)
        output_serializer = RequestAdminDetailSerializer(input_serializer.instance)
        headers = self.get_success_headers(output_serializer.data)
        return Response(
            output_serializer.data, status=HTTP_201_CREATED, headers=headers
        )

    def destroy(self, request, *args, **kwargs):
        video_request = get_object_or_404(Request, pk=self.kwargs["pk"])
        remove_calendar_event.delay(video_request.id)
        return super().destroy(request, *args, **kwargs)

    def get_permissions(self):
        if self.request.method == "DELETE":
            # Staff members can only delete requests which were created by them.
            return [IsStaffSelfOrAdmin()]
        return [IsStaffUser()]

    def get_queryset(self):
        if self.action == "list":
            return (
                Request.objects.prefetch_related(
                    Prefetch(
                        "crew",
                        queryset=CrewMember.objects.prefetch_related(
                            Prefetch(
                                "member",
                                queryset=User.objects.prefetch_related("userprofile"),
                            )
                        ),
                    ),
                    Prefetch(
                        "responsible",
                        queryset=User.objects.prefetch_related("userprofile"),
                    ),
                )
                .annotate(video_count=Count("videos"))
                .cache()
            )

        return Request.objects.prefetch_related(
            Prefetch(
                "crew",
                queryset=CrewMember.objects.prefetch_related(
                    Prefetch(
                        "member",
                        queryset=User.objects.prefetch_related("userprofile"),
                    )
                ),
            ),
            Prefetch(
                "requester", queryset=User.objects.prefetch_related("userprofile")
            ),
            Prefetch(
                "requested_by", queryset=User.objects.prefetch_related("userprofile")
            ),
            Prefetch(
                "responsible", queryset=User.objects.prefetch_related("userprofile")
            ),
        ).annotate(comment_count=Count("comments"), video_count=Count("videos"))

    def get_serializer_class(self):
        if self.action == "list":
            return RequestAdminListSerializer
        if self.action == "retrieve":
            return RequestAdminDetailSerializer
        if self.action == "update":
            return RequestAdminUpdateSerializer
        return RequestAdminCreateSerializer

    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        input_serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        input_serializer.is_valid(raise_exception=True)
        self.perform_update(input_serializer)

        instance._prefetched_objects_cache = {}

        output_serializer = RequestAdminDetailSerializer(input_serializer.instance)

        return Response(output_serializer.data)

from django.urls import path

from api.v1.external.sch_events.views import (
    CommentExternalSchEventsCreateView,
    RequestExternalSchEventsCreateView,
    RequestExternalSchEventsRetrieveView,
)

urlpatterns = [
    path(
        "requests", RequestExternalSchEventsCreateView.as_view(), name="request-create"
    ),
    path(
        "requests/<int:pk>",
        RequestExternalSchEventsRetrieveView.as_view(),
        name="request-detail",
    ),
    path(
        "requests/<int:request_pk>/comments",
        CommentExternalSchEventsCreateView.as_view(),
        name="request-comment-create",
    ),
]

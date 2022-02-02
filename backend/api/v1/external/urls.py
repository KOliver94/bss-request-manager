from django.urls import path

from api.v1.external.views import (
    CommentExternalListCreateView,
    RequestExternalCreateView,
    RequestExternalDetailView,
)

urlpatterns = [
    path("sch-events/requests", RequestExternalCreateView.as_view()),
    path("sch-events/requests/<int:pk>", RequestExternalDetailView.as_view()),
    path(
        "sch-events/requests/<int:request_id>/comments",
        CommentExternalListCreateView.as_view(),
    ),
]

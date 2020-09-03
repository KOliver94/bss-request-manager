from api.v1.requests.views import (
    CommentDefaultDetailView,
    CommentDefaultListCreateView,
    RatingDefaultDetailView,
    RatingDefaultListCreateView,
    RequestDefaultDetailView,
    VideoDefaultDetailView,
    VideoDefaultListView,
)
from django.urls import path

urlpatterns = [
    path("<int:pk>", RequestDefaultDetailView.as_view()),
    path("<int:request_id>/comments", CommentDefaultListCreateView.as_view()),
    path(
        "<int:request_id>/comments/<int:pk>",
        CommentDefaultDetailView.as_view(),
    ),
    path("<int:request_id>/videos", VideoDefaultListView.as_view()),
    path("<int:request_id>/videos/<int:pk>", VideoDefaultDetailView.as_view()),
    path(
        "<int:request_id>/videos/<int:video_id>/ratings",
        RatingDefaultListCreateView.as_view(),
    ),
    path(
        "<int:request_id>/videos/<int:video_id>/ratings/<int:pk>",
        RatingDefaultDetailView.as_view(),
    ),
]

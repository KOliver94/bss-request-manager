from api.v1.admin.requests.views import (
    CommentAdminDetailView,
    CommentAdminListCreateView,
    CrewAdminDetailView,
    CrewAdminListCreateView,
    HistoryRetrieveView,
    RatingAdminDetailView,
    RatingAdminListCreateView,
    RequestAdminDetailView,
    VideoAdminDetailView,
    VideoAdminListCreateView,
    VideoAdminListView,
)
from django.urls import path

urlpatterns = [
    path("<int:pk>", RequestAdminDetailView.as_view()),
    path("<int:pk>/history", HistoryRetrieveView.as_view()),
    path("<int:request_id>/comments", CommentAdminListCreateView.as_view()),
    path("<int:request_id>/comments/<int:pk>", CommentAdminDetailView.as_view()),
    path(
        "<int:request_id_comment>/comments/<int:pk>/history",
        HistoryRetrieveView.as_view(),
    ),
    path("<int:request_id>/crew", CrewAdminListCreateView.as_view()),
    path("<int:request_id>/crew/<int:pk>", CrewAdminDetailView.as_view()),
    path("<int:request_id>/videos", VideoAdminListCreateView.as_view()),
    path("<int:request_id>/videos/<int:pk>", VideoAdminDetailView.as_view()),
    path(
        "<int:request_id_video>/videos/<int:pk>/history",
        HistoryRetrieveView.as_view(),
    ),
    path(
        "<int:request_id>/videos/<int:video_id>/ratings",
        RatingAdminListCreateView.as_view(),
    ),
    path(
        "<int:request_id>/videos/<int:video_id>/ratings/<int:pk>",
        RatingAdminDetailView.as_view(),
    ),
    path(
        "<int:request_id>/videos/<int:video_id>/ratings/<int:pk>/history",
        HistoryRetrieveView.as_view(),
    ),
    path("videos", VideoAdminListView.as_view()),
]

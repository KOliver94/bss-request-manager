from django.urls import path

from api.v1.admin.requests.comments.views import (
    CommentAdminDetailUpdateDeleteView,
    CommentAdminListCreateView,
)
from api.v1.admin.requests.crew.views import (
    CrewMemberAdminDetailUpdateDeleteView,
    CrewMemberAdminListCreateView,
)
from api.v1.admin.requests.views import (
    HistoryRetrieveView,
    RatingAdminDetailView,
    RatingAdminListCreateView,
    RequestAdminDetailView,
    VideoAdminDetailView,
    VideoAdminListCreateView,
    VideoAdminListView,
)

urlpatterns = [
    path("<int:pk>", RequestAdminDetailView.as_view()),
    path("<int:pk>/history", HistoryRetrieveView.as_view()),
    path(
        "<int:request_id>/comments",
        CommentAdminListCreateView.as_view(),
        name="admin-comments-list-create",
    ),
    path(
        "<int:request_id>/comments/<int:pk>",
        CommentAdminDetailUpdateDeleteView.as_view(),
        name="admin-comments-detail-update-delete",
    ),
    path(
        "<int:request_id_comment>/comments/<int:pk>/history",
        HistoryRetrieveView.as_view(),
    ),
    path(
        "<int:request_id>/crew",
        CrewMemberAdminListCreateView.as_view(),
        name="admin-crew-list-create",
    ),
    path(
        "<int:request_id>/crew/<int:pk>",
        CrewMemberAdminDetailUpdateDeleteView.as_view(),
        name="admin-crew-detail-update-delete",
    ),
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

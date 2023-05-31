from django.urls import include, path
from rest_framework.routers import SimpleRouter

from api.v1.admin.requests.comments.views import CommentAdminViewSet
from api.v1.admin.requests.crew.views import CrewMemberAdminViewSet
from api.v1.admin.requests.ratings.views import RatingAdminViewSet
from api.v1.admin.requests.requests.views import RequestAdminViewSet
from api.v1.admin.requests.views import (
    HistoryRetrieveView,
    VideoAdminDetailView,
    VideoAdminListCreateView,
    VideoAdminListView,
)

router = SimpleRouter(trailing_slash=False)
router.register(r"requests", RequestAdminViewSet, basename="request")

request_router = SimpleRouter(trailing_slash=False)
request_router.register(r"comments", CommentAdminViewSet, basename="comment")
request_router.register(r"crew", CrewMemberAdminViewSet, basename="crew")

video_router = SimpleRouter(trailing_slash=False)
video_router.register(r"ratings", RatingAdminViewSet, basename="rating")

request_urlpatterns = [
    path("", include(request_router.urls)),
    path(
        "videos/<int:video_pk>/",
        include((video_router.urls, "video"), namespace="video"),
    ),
]

urlpatterns = [
    path("", include(router.urls)),
    path(
        "requests/<int:request_pk>/",
        include((request_urlpatterns, "request"), namespace="request"),
    ),
    path("<int:pk>/history", HistoryRetrieveView.as_view()),
    path(
        "<int:request_id_comment>/comments/<int:pk>/history",
        HistoryRetrieveView.as_view(),
    ),
    path("<int:request_id>/videos", VideoAdminListCreateView.as_view()),
    path("<int:request_id>/videos/<int:pk>", VideoAdminDetailView.as_view()),
    path(
        "<int:request_id_video>/videos/<int:pk>/history",
        HistoryRetrieveView.as_view(),
    ),
    path(
        "<int:request_id>/videos/<int:video_id>/ratings/<int:pk>/history",
        HistoryRetrieveView.as_view(),
    ),
    path("videos", VideoAdminListView.as_view()),
]

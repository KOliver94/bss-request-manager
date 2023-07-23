from django.urls import include, path
from rest_framework.routers import SimpleRouter

from api.v1.requests.comments.views import CommentViewSet
from api.v1.requests.ratings.views import RatingViewSet
from api.v1.requests.requests.views import RequestViewSet
from api.v1.requests.videos.views import VideoViewSet
from common.rest_framework.routers import DetailOnlyRouter

router = SimpleRouter(trailing_slash=False)
router.register(r"requests", RequestViewSet, basename="request")

request_router = SimpleRouter(trailing_slash=False)
request_router.register(r"comments", CommentViewSet, basename="comment")
request_router.register(r"videos", VideoViewSet, basename="video")

video_router = DetailOnlyRouter(trailing_slash=False)
video_router.register(r"rating", RatingViewSet, basename="rating")

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
]

from django.urls import include, path

from api.v1.me.views import MeViewSet, OAuth2ConnectDisconnectView
from common.rest_framework.routers import DetailOnlyRouter

router = DetailOnlyRouter(trailing_slash=False)
router.register(r"me", MeViewSet, basename="me")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "me/social/<str:provider>",
        OAuth2ConnectDisconnectView.as_view(),
        name="me:social_connect_disconnect",
    ),
]

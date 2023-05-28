from django.urls import include, path
from rest_framework.routers import SimpleRouter

from api.v1.admin.requests.requests.views import RequestAdminViewSet

router = SimpleRouter(trailing_slash=False)
router.register(r"requests", RequestAdminViewSet, basename="request")

urlpatterns = [
    path("", include(router.urls)),
    path("requests/", include("api.v1.admin.requests.urls")),
]

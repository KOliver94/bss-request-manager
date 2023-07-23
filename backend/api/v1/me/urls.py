from api.v1.me.views import MeViewSet
from common.rest_framework.routers import DetailOnlyRouter

router = DetailOnlyRouter(trailing_slash=False)
router.register(r"me", MeViewSet, basename="me")
urlpatterns = router.urls

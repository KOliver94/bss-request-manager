from rest_framework.routers import SimpleRouter

from api.v1.admin.users.views import UserAdminViewSet

router = SimpleRouter(trailing_slash=False)
router.register(r"users", UserAdminViewSet)
urlpatterns = router.urls

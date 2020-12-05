from api.v1.login.views import (
    ExtendedSocialJWTPairOnlyAuthView,
    ExtendedTokenObtainPairView,
    LogoutAndBlacklistRefreshTokenView,
)
from api.v1.requests.views import RequestDefaultListCreateView
from api.v1.users.views import UserListView
from django.conf import settings
from django.urls import include, path, re_path
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", include("api.v1.admin.urls")),
    path("login", ExtendedTokenObtainPairView.as_view(), name="login_obtain_jwt_pair"),
    path("login/refresh", TokenRefreshView.as_view(), name="login_refresh_jwt_token"),
    re_path(
        r"^login/social/(?:(?P<provider>[a-zA-Z0-9_-]+)/?)?$",
        ExtendedSocialJWTPairOnlyAuthView.as_view(),
        name="login_social_obtain_jwt_pair",
    ),
    path("logout", LogoutAndBlacklistRefreshTokenView.as_view(), name="logout"),
    path("users", UserListView.as_view()),
    path("users/", include("api.v1.users.urls")),
    path("requests", RequestDefaultListCreateView.as_view()),
    path("requests/", include("api.v1.requests.urls")),
]

if "health_check" in settings.INSTALLED_APPS:
    token = (
        f"/{settings.HEALTH_CHECK_URL_TOKEN}"
        if hasattr(settings, "HEALTH_CHECK_URL_TOKEN")
        and settings.HEALTH_CHECK_URL_TOKEN is not None
        else ""
    )
    urlpatterns += [
        path(f"health{token}", include("health_check.urls")),
    ]

if settings.DEBUG and "drf_yasg" in settings.INSTALLED_APPS:
    from drf_yasg import openapi
    from drf_yasg.views import get_schema_view

    schema_view = get_schema_view(
        openapi.Info(
            title="BSS Request Manager API",
            default_version="v1",
            description="This is the Schema of the BSS Request Manager REST API.",
            contact=openapi.Contact(
                name="Olivér Kecskeméty", email="bssinfo@sch.bme.hu"
            ),
        ),
        public=True,
        permission_classes=[permissions.AllowAny],
    )

    urlpatterns += [
        re_path(
            r"^swagger(?P<format>\.json|\.yaml)$",
            schema_view.without_ui(cache_timeout=0),
            name="schema-json",
        ),
        re_path(
            r"^swagger/$",
            schema_view.with_ui("swagger", cache_timeout=0),
            name="schema-swagger-ui",
        ),
        re_path(
            r"^redoc/$",
            schema_view.with_ui("redoc", cache_timeout=0),
            name="schema-redoc",
        ),
    ]

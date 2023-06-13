from django.conf import settings
from django.urls import include, path, re_path
from rest_framework_simplejwt.views import TokenRefreshView

from api.v1.login.views import (
    ExtendedSocialJWTPairOnlyAuthView,
    ExtendedTokenObtainPairView,
    LogoutAndBlacklistRefreshTokenView,
)
from api.v1.requests.views import RequestDefaultListCreateView
from api.v1.users.views import UserListView
from video_requests.models import Request, Video

urlpatterns = [
    path("admin/", include(("api.v1.admin.urls", "admin"), namespace="admin")),
    path("external/", include("api.v1.external.urls")),
    path("login", ExtendedTokenObtainPairView.as_view(), name="login_obtain_jwt_pair"),
    path("login/refresh", TokenRefreshView.as_view(), name="login_refresh_jwt_token"),
    re_path(
        r"^login/social/(?:(?P<provider>[a-zA-Z0-9_-]+)/?)?$",
        ExtendedSocialJWTPairOnlyAuthView.as_view(),
        name="login_social_obtain_jwt_pair",
    ),
    path("logout", LogoutAndBlacklistRefreshTokenView.as_view(), name="logout"),
    path("misc/", include(("api.v1.misc.urls", "misc"), namespace="misc")),
    path("users", UserListView.as_view()),
    path("users/", include("api.v1.users.urls")),
    path("requests", RequestDefaultListCreateView.as_view()),
    path("requests/", include("api.v1.requests.urls")),
]

if settings.HEALTH_CHECK_API_ENABLED:
    token = (
        f"/{settings.HEALTH_CHECK_URL_TOKEN}"
        if hasattr(settings, "HEALTH_CHECK_URL_TOKEN")
        and settings.HEALTH_CHECK_URL_TOKEN is not None
        else ""
    )
    urlpatterns += [
        path(f"health{token}", include("health_check.urls")),
    ]

if settings.SPECTACULAR_SERVE_SCHEMA:
    from drf_spectacular.views import (
        SpectacularAPIView,
        SpectacularRedocView,
        SpectacularSwaggerView,
    )

    urlpatterns += [
        path(
            "schema",
            SpectacularAPIView.as_view(
                api_version="v1",
                custom_settings={
                    "ENUM_NAME_OVERRIDES": {
                        "RequestStatusEnum": Request.Statuses.choices,
                        "VideoStatusEnum": Video.Statuses.choices,
                    },
                    "SCHEMA_PATH_PREFIX_INSERT": "/api/v1",
                },
                urlconf="api.v1.urls",
            ),
            name="schema",
        ),
        path(
            "schema/swagger-ui/",
            SpectacularSwaggerView.as_view(url_name="api:v1:schema"),
            name="swagger-ui",
        ),
        path(
            "schema/redoc/",
            SpectacularRedocView.as_view(url_name="api:v1:schema"),
            name="redoc",
        ),
    ]

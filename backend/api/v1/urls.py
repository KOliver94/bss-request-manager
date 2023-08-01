from django.conf import settings
from django.urls import include, path

from video_requests.models import Request, Video

urlpatterns = [
    path("", include(("api.v1.login.urls", "login"), namespace="login")),
    path("", include(("api.v1.me.urls", "me"), namespace="me")),
    path("", include(("api.v1.requests.urls", "requests"), namespace="requests")),
    path("admin/", include(("api.v1.admin.urls", "admin"), namespace="admin")),
    path(
        "external/", include(("api.v1.external.urls", "external"), namespace="external")
    ),
    path("misc/", include(("api.v1.misc.urls", "misc"), namespace="misc")),
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
                throttle_classes=[],
                urlconf="api.v1.urls",
            ),
            name="schema",
        ),
        path(
            "schema/swagger-ui/",
            SpectacularSwaggerView.as_view(
                throttle_classes=[], url_name="api:v1:schema"
            ),
            name="swagger-ui",
        ),
        path(
            "schema/redoc/",
            SpectacularRedocView.as_view(throttle_classes=[], url_name="api:v1:schema"),
            name="redoc",
        ),
    ]

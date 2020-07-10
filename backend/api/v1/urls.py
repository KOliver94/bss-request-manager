from api.v1.login.views import (
    ExtendedSocialJWTPairOnlyAuthView,
    ExtendedTokenObtainPairView,
    LogoutAndBlacklistRefreshTokenView,
)
from api.v1.requests.views import RequestDefaultListCreateView
from api.v1.users.views import UserListView
from django.conf.urls import url
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenRefreshView

schema_view = get_schema_view(
    openapi.Info(
        title="BSS Request Manager API",
        default_version="v1",
        description="This is the Schema of the BSS Request Manager REST API.\n\n"
        "You need to log in to see the available endpoint with your user privileges.\n"
        "To do that use the login endpoint and use the obtained access token as Bearer token "
        "in Authorization header. For Chrome you can use ModHeader extension.",
        contact=openapi.Contact(name="Olivér Kecskeméty", email="bssinfo@sch.bme.hu"),
    ),
    public=False,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path("admin/", include("api.v1.admin.urls")),
    path("login", ExtendedTokenObtainPairView.as_view(), name="login_obtain_jwt_pair"),
    path("login/refresh", TokenRefreshView.as_view(), name="login_refresh_jwt_token"),
    url(
        r"^login/social/(?:(?P<provider>[a-zA-Z0-9_-]+)/?)?$",
        ExtendedSocialJWTPairOnlyAuthView.as_view(),
        name="login_social_obtain_jwt_pair",
    ),
    path("logout", LogoutAndBlacklistRefreshTokenView.as_view(), name="logout"),
    path("users", UserListView.as_view()),
    path("users/", include("api.v1.users.urls")),
    url(
        r"^swagger(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    url(
        r"^swagger/$",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    url(
        r"^redoc/$", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"
    ),
    path("requests", RequestDefaultListCreateView.as_view()),
    path("requests/", include("api.v1.requests.urls")),
]

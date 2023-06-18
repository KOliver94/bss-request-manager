from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from api.v1.login.views import (
    TokenBlacklistView,
    TokenObtainPairOAuth2View,
    TokenObtainPairView,
)

urlpatterns = [
    path("login", TokenObtainPairView.as_view(), name="obtain_jwt_pair"),
    path("login/refresh", TokenRefreshView.as_view(), name="refresh_jwt_token"),
    path(
        "login/social",
        TokenObtainPairOAuth2View.as_view(),
        name="obtain_jwt_pair_social",
    ),
    path("logout", TokenBlacklistView.as_view(), name="logout"),
]

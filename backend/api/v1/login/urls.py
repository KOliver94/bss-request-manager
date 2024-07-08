from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from api.v1.login.views import TokenBlacklistView, TokenObtainPairOAuth2View

urlpatterns = [
    path("login/refresh", TokenRefreshView.as_view(), name="refresh_jwt_token"),
    path(
        "login/social",
        TokenObtainPairOAuth2View.as_view(),
        name="social",
    ),
    path("logout", TokenBlacklistView.as_view(), name="logout"),
]

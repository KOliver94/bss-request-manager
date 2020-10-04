from api.v1.login.serializers import (
    ExtendedSocialJWTPairOnlyAuthSerializer,
    ExtendedTokenObtainPairSerializer,
    LogoutAndBlacklistRefreshTokenSerializer,
)
from common.permissions import IsNotAuthenticated
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_social_auth.views import SocialJWTPairOnlyAuthView


class ExtendedTokenObtainPairView(TokenObtainPairView):
    """ View for extended JWT serializer """

    permission_classes = [IsNotAuthenticated]
    serializer_class = ExtendedTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


class ExtendedSocialJWTPairOnlyAuthView(SocialJWTPairOnlyAuthView):
    """ View for extended JWT serializer (Social) """

    permission_classes = [IsNotAuthenticated]
    serializer_class = ExtendedSocialJWTPairOnlyAuthSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


class LogoutAndBlacklistRefreshTokenView(generics.CreateAPIView):
    """
    Logout and blacklist refresh token.

    Since JWT does not support logging out this is a workaround of this problem.
    JWT tokens are valid until they expire.
    Refresh tokens have longer expire time than access tokens and can be used to acquire new access + refresh tokens.
    If someone steals a refresh token they can have unlimited access to the site.
    Logging out saves the refresh token to a blacklist (stored in database) which is used to validate a refresh token.
    When a refresh token is blacklisted it cannot be used to acquire new JWT tokens.

    Example: POST /api/v1/logout
    Body: {"refresh": "REFRESH_TOKEN"}
    """

    permission_classes = [IsAuthenticated]
    serializer_class = LogoutAndBlacklistRefreshTokenSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(status=status.HTTP_205_RESET_CONTENT, headers=headers)

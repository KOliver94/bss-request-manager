from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_social_auth.views import SocialJWTPairOnlyAuthView

from api.v1.login.serializers import (
    ExtendedTokenObtainPairSerializer,
    ExtendedSocialJWTPairOnlyAuthSerializer,
    LogoutAndBlacklistRefreshTokenSerializer,
)


class ExtendedTokenObtainPairView(TokenObtainPairView):
    """ View for extended JWT serializer """

    serializer_class = ExtendedTokenObtainPairSerializer


class ExtendedSocialJWTPairOnlyAuthView(SocialJWTPairOnlyAuthView):
    """ View for extended JWT serializer (Social) """

    serializer_class = ExtendedSocialJWTPairOnlyAuthSerializer


class LogoutAndBlacklistRefreshTokenView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutAndBlacklistRefreshTokenSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(status=status.HTTP_205_RESET_CONTENT, headers=headers)

from rest_framework import serializers, generics, status
from rest_framework.exceptions import NotAuthenticated
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_social_auth.serializers import JWTPairSerializer
from rest_social_auth.views import SocialJWTPairOnlyAuthView
from social_core.backends.oauth import BaseOAuth2


class AuthSCHOAuth2(BaseOAuth2):
    """AuthSCH OAuth2 authentication backend"""
    name = 'authsch'
    ID_KEY = 'internal_id'
    AUTHORIZATION_URL = 'https://auth.sch.bme.hu/site/login'
    ACCESS_TOKEN_URL = 'https://auth.sch.bme.hu/oauth2/token'
    ACCESS_TOKEN_METHOD = 'POST'
    REFRESH_TOKEN_URL = 'https://auth.sch.bme.hu/oauth2/token'
    DEFAULT_SCOPE = ['basic', 'mail', 'givenName', 'sn', 'eduPersonEntitlement', 'mobile']
    EXTRA_DATA = [
        ('internal_id', 'id'),
        ('expires_in', 'expires'),
        ('refresh_token', 'refresh_token'),
        ('eduPersonEntitlement', 'eduPersonEntitlement'),
        ('mobile', 'mobile')
    ]

    def get_user_details(self, response):
        """Return user details from AuthSCH account"""
        return {
            'username': response.get('internal_id'),
            'email': response.get('mail'),
            'first_name': response.get('givenName'),
            'last_name': response.get('sn'),
            'mobile': response.get('mobile'),
        }

    def user_data(self, access_token, *args, **kwargs):
        """Loads user data from service"""
        return self.get_json(
            'https://auth.sch.bme.hu/api/profile/',
            params={'access_token': access_token}
        )


class ExtendedTokenObtainPairSerializer(TokenObtainPairSerializer):
    """ Extended JWT Token serializer with user permissions and groups """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['name'] = f'{user.last_name} {user.first_name}'
        if not user.is_staff or not user.is_superuser:
            token['role'] = 'user'
        elif not user.is_superuser:
            token['role'] = 'staff'
        else:
            token['role'] = 'admin'
        token['groups'] = list(user.groups.values_list('name', flat=True))

        return token


class ExtendedSocialJWTPairOnlyAuthSerializer(JWTPairSerializer):
    """ Extended JWT Token serializer with user permissions and groups (Social) """

    def get_token(self, user):
        if not user.is_active:
            raise NotAuthenticated(detail='User is not active')

        token = self.get_token_instance().access_token

        # Add custom claims
        token['name'] = f'{user.last_name} {user.first_name}'
        if not user.is_staff or not user.is_superuser:
            token['role'] = 'user'
        elif not user.is_superuser:
            token['role'] = 'staff'
        else:
            token['role'] = 'admin'
        token['groups'] = list(user.groups.values_list('name', flat=True))

        return str(token)


class ExtendedTokenObtainPairView(TokenObtainPairView):
    """ View for extended JWT serializer """
    serializer_class = ExtendedTokenObtainPairSerializer


class ExtendedSocialJWTPairOnlyAuthView(SocialJWTPairOnlyAuthView):
    """ View for extended JWT serializer (Social) """
    serializer_class = ExtendedSocialJWTPairOnlyAuthSerializer


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def create(self, validated_data):
        try:
            RefreshToken(validated_data['refresh']).blacklist()
            return validated_data
        except TokenError:
            raise NotAuthenticated(detail='Token is invalid or expired')


class LogoutAndBlacklistRefreshTokenView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RefreshTokenSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(status=status.HTTP_205_RESET_CONTENT, headers=headers)

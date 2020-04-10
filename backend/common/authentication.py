from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
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
        token['is_staff'] = user.is_staff
        token['is_admin'] = user.is_superuser
        token['groups'] = list(user.groups.values_list('name', flat=True))

        return token


class ExtendedTokenObtainPairView(TokenObtainPairView):
    """ View for extended JWT serializer """
    serializer_class = ExtendedTokenObtainPairSerializer

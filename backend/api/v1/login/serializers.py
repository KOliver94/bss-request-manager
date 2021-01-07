from rest_framework import serializers
from rest_framework.exceptions import NotAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_social_auth.serializers import JWTPairSerializer


def add_custom_claims(token, user):
    token["avatar"] = user.userprofile.avatar_url
    token["groups"] = list(user.groups.values_list("name", flat=True))
    token["name"] = user.get_full_name_eastern_order()
    token["role"] = user.get_role()
    return token


class ExtendedTokenObtainPairSerializer(TokenObtainPairSerializer):
    """ Extended JWT Token serializer with user permissions and groups """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        return add_custom_claims(token, user)


class ExtendedSocialJWTPairOnlyAuthSerializer(JWTPairSerializer):  # pragma: no cover
    """ Extended JWT Token serializer with user permissions and groups (Social) """

    def get_token(self, user):
        if not user.is_active:
            raise NotAuthenticated(detail="User is not active")

        token = self.get_token_instance().access_token
        return str(add_custom_claims(token, user))


class LogoutAndBlacklistRefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def create(self, validated_data):
        try:
            token = RefreshToken(validated_data["refresh"])
            if token.payload["user_id"] is self.context["request"].user.id:
                token.blacklist()
                return validated_data
            else:
                raise TokenError
        except TokenError:
            raise NotAuthenticated(detail="Token is invalid or expired")

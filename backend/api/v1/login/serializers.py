from urllib.parse import urljoin, urlparse

from django.conf import settings
from django.http import HttpResponse
from django.utils.encoding import iri_to_uri
from rest_framework.exceptions import NotAuthenticated, ValidationError
from rest_framework.fields import CharField
from rest_framework.serializers import Serializer
from rest_framework_simplejwt.serializers import (
    TokenBlacklistSerializer as SimpleJWTTokenBlacklistSerializer,
)
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer as SimpleJWTTokenObtainPairSerializer,
)
from rest_framework_simplejwt.serializers import TokenObtainSerializer
from social_core.exceptions import AuthException
from social_core.utils import get_strategy, user_is_authenticated
from social_django.utils import STORAGE, psa


def load_strategy(request=None):
    return get_strategy("common.social_core.strategy.DRFStrategy", STORAGE, request)


@psa("/redirect", load_strategy=load_strategy)
def decorate_request(request, backend):
    pass


class TokenBlacklistSerializer(SimpleJWTTokenBlacklistSerializer):
    def validate(self, attrs):
        refresh = self.token_class(attrs["refresh"])
        if refresh.payload["user_id"] == self.context["request"].user.id:
            refresh.blacklist()
            return {}
        raise NotAuthenticated(detail="Token is invalid or expired")


class TokenObtainPairSerializer(SimpleJWTTokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["avatar"] = user.userprofile.avatar_url
        token["groups"] = list(user.groups.values_list("name", flat=True))
        token["name"] = user.get_full_name_eastern_order()
        token["role"] = user.role
        return token


class TokenObtainPairOAuth2Serializer(TokenObtainPairSerializer):
    # This part is a heavily modified and stripped down
    # version of https://github.com/st4lk/django-rest-social-auth

    code = CharField()
    provider = CharField()

    def __init__(self, *args, **kwargs):
        super(TokenObtainSerializer, self).__init__(*args, **kwargs)

    def get_user(self):
        user = self.context["request"].user
        origin = self.context["request"].strategy.request.META.get("HTTP_ORIGIN")
        if origin:
            relative_path = urlparse(self.context["request"].backend.redirect_uri).path
            url = urlparse(origin)
            origin_scheme_host = f"{url.scheme}://{url.netloc}"
            location = urljoin(origin_scheme_host, relative_path)
            self.context["request"].backend.redirect_uri = iri_to_uri(location)
        is_authenticated = user_is_authenticated(user)
        user = is_authenticated and user or None

        # skip checking state by setting following params to False
        # it is responsibility of front-end to check state
        self.context["request"].backend.REDIRECT_STATE = False
        self.context["request"].backend.STATE_PARAMETER = False

        user = self.context["request"].backend.complete(user=user)
        return user

    def validate(self, attrs):
        if attrs["provider"] not in settings.SOCIAL_AUTH_PROVIDERS:
            raise ValidationError({"provider": "Invalid provider."})  # TODO: Translate

        decorate_request(self.context["request"], attrs["provider"])
        user = self.get_user()

        if isinstance(user, HttpResponse):
            # error happened and pipeline returned HttpResponse instead of user
            # the object is still named user but it's an HttpResponse object containing error
            raise AuthException(attrs["provider"], user)

        refresh = self.get_token(user)

        return {"refresh": str(refresh), "access": str(refresh.access_token)}


class TokenObtainResponseSerializer(Serializer):
    access = CharField(read_only=True)
    refresh = CharField(read_only=True)

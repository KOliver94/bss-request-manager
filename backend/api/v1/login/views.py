import logging

from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from drf_spectacular.utils import extend_schema
from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.views import (
    TokenObtainPairView as SimpleJWTTokenObtainPairView,
)
from social_core.exceptions import AuthException, SocialAuthBaseException

from api.v1.login.serializers import (
    TokenBlacklistSerializer,
    TokenObtainPairOAuth2Serializer,
    TokenObtainPairSerializer,
    TokenObtainResponseSerializer,
)
from common.rest_framework.permissions import IsAuthenticated, IsNotAuthenticated

logger = logging.getLogger(__name__)


class TokenBlacklistView(GenericAPIView):
    """
    Takes a token and blacklists it.
    """

    # Since JWT does not support logging out this is a workaround for this problem.
    # JWT tokens are valid until they expire.
    # Refresh tokens have longer expire time than access tokens and can be used to acquire new access + refresh tokens.
    # If someone steals a refresh token they can have unlimited access to the site.
    # Logging out saves the refresh token to a blacklist (stored in database) which is used to validate a refresh token.
    # When a refresh token is blacklisted it cannot be used to acquire new JWT tokens.

    permission_classes = [IsAuthenticated]
    serializer_class = TokenBlacklistSerializer

    @extend_schema(
        request=TokenBlacklistSerializer,
        responses={200: {}},
    )
    @method_decorator(never_cache)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=HTTP_200_OK)


class TokenObtainPairView(SimpleJWTTokenObtainPairView):
    """
    Takes a set of user credentials and returns an access and refresh JSON web
    token pair to prove the authentication of those credentials.
    """

    permission_classes = [IsNotAuthenticated]
    serializer_class = TokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    @extend_schema(
        request=TokenObtainPairSerializer,
        responses=TokenObtainResponseSerializer,
    )
    @method_decorator(never_cache)
    def post(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)

        try:
            input_serializer.is_valid(raise_exception=True)
            output_serializer = TokenObtainResponseSerializer(
                input_serializer.validated_data, context=self.get_serializer_context()
            )
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(output_serializer.data, status=HTTP_200_OK)


class TokenObtainPairOAuth2View(GenericAPIView):
    permission_classes = [IsNotAuthenticated]
    serializer_class = TokenObtainPairOAuth2Serializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    @staticmethod
    def log_exception(error):
        err_msg = error.args[0] if error.args else ""
        if getattr(error, "response", None) is not None:
            try:
                err_data = error.response.json()
            except (ValueError, AttributeError):
                logger.error("%s; %s", error, err_msg)
            else:
                logger.error("%s; %s; %s", error, err_msg, err_data)
        else:
            logger.exception("{%s}; {%s}", error, err_msg)

    @extend_schema(
        request=TokenObtainPairOAuth2Serializer,
        responses=TokenObtainResponseSerializer,
    )
    @method_decorator(never_cache)
    def post(self, request, *args, **kwargs):
        input_serializer = self.get_serializer(data=request.data)

        try:
            input_serializer.is_valid(raise_exception=True)
            output_serializer = TokenObtainResponseSerializer(
                input_serializer.validated_data, context=self.get_serializer_context()
            )
        except Exception as e:
            message = None
            if isinstance(e, TokenError):
                raise InvalidToken(e.args[0])
            if not isinstance(e, AuthException):
                self.log_exception(e)
            if hasattr(e, "response"):
                try:
                    message = e.response.json()["error"]
                    if isinstance(message, dict) and "message" in message:
                        message = message["message"]
                    elif isinstance(message, list) and len(message):
                        message = message[0]
                except (KeyError, TypeError):
                    pass
            # As a fallback, if no valid message was captured, covert the exception to string
            # because most of the social-core exceptions implement a valid conversion.
            if isinstance(e, SocialAuthBaseException) and not message:
                message = str(e)
            return Response(data=message, status=HTTP_400_BAD_REQUEST)

        return Response(output_serializer.data, status=HTTP_200_OK)

from django.conf import settings
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from drf_spectacular.utils import extend_schema
from rest_framework.exceptions import ValidationError
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import RetrieveModelMixin, UpdateModelMixin
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
)
from rest_framework.viewsets import GenericViewSet
from social_core.exceptions import AuthException

from api.v1.me.serializers import OAuth2ConnectSerializer, UserSerializer
from common.rest_framework.permissions import IsAuthenticated
from common.social_core.helpers import decorate_request, handle_exception


class MeViewSet(RetrieveModelMixin, UpdateModelMixin, GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return User.objects.get(pk=self.request.user.pk)


class OAuth2ConnectDisconnectView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OAuth2ConnectSerializer

    @staticmethod
    def validate_provider(provider):
        if provider not in settings.SOCIAL_AUTH_PROVIDERS:
            raise ValidationError({"provider": "Invalid provider."})  # TODO: Translate
        return provider

    def delete(self, request, *args, **kwargs):
        provider = self.validate_provider(self.kwargs.get("provider"))
        decorate_request(request, provider)
        request.backend.disconnect(user=self.request.user)
        return Response(status=HTTP_204_NO_CONTENT)

    @extend_schema(
        request=OAuth2ConnectSerializer,
        responses={HTTP_201_CREATED: {}},
    )
    @method_decorator(never_cache)
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        provider = self.validate_provider(self.kwargs.get("provider"))

        decorate_request(request, provider)
        try:
            request.backend.REDIRECT_STATE = False
            request.backend.STATE_PARAMETER = False

            user = request.backend.complete(user=self.request.user)

            if isinstance(user, HttpResponse):
                # error happened and pipeline returned HttpResponse instead of user
                # the object is still named user but it's an HttpResponse object containing error
                raise AuthException(provider, user)
        except Exception as e:
            message = handle_exception(e)
            return Response(data=message, status=HTTP_400_BAD_REQUEST)

        return Response(status=HTTP_201_CREATED)

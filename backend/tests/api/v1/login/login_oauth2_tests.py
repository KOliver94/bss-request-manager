import json
import random
import re
from string import ascii_letters, digits

from django.test import override_settings
from httpretty import HTTPretty
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from social_core.backends.facebook import API_VERSION as FACEBOOK_API_VERSION
from social_core.backends.utils import load_backends
from social_core.tests.backends.base import BaseBackendTest as SocialCoreBaseBackendTest
from social_core.tests.backends.oauth import OAuth2Test as SocialCoreOAuth2Test
from social_core.tests.models import (
    TestAssociation,
    TestCode,
    TestNonce,
    TestUserSocialAuth,
    User,
)
from social_core.utils import module_member

from api.v1.login.serializers import load_strategy


class BaseBackendTest(APITestCase, SocialCoreBaseBackendTest):
    def setUp(self):
        HTTPretty.enable(allow_net_connect=False)
        self.mock_gravatar()
        Backend = module_member(self.backend_path)
        self.strategy = load_strategy()
        self.backend = Backend(self.strategy, redirect_uri=self.complete_url)
        self.name = self.backend.name.upper().replace("-", "_")
        self.complete_url = self.strategy.build_absolute_uri(
            self.raw_complete_url.format(self.backend.name)
        )
        backends = (self.backend_path,)
        # Force backends loading to trash PSA cache
        load_backends(backends, force_load=True)
        User.reset_cache()
        TestUserSocialAuth.reset_cache()
        TestNonce.reset_cache()
        TestAssociation.reset_cache()
        TestCode.reset_cache()

    @staticmethod
    def mock_gravatar():
        HTTPretty.register_uri(
            HTTPretty.GET, re.compile("https://www.gravatar.com/avatar/.*"), status=404
        )


class OAuth2Test(BaseBackendTest, SocialCoreOAuth2Test):
    def do_rest_login(self, provider):
        start_url = self.backend.start().url
        self.auth_handlers(start_url)
        self.pre_complete_callback(start_url)

        url = reverse("api:v1:login:obtain_jwt_pair_social")
        response = self.client.post(
            url,
            {
                "provider": provider,
                "code": "".join(
                    random.choice(ascii_letters + digits) for _ in range(15)
                ),
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        access_token = AccessToken(response.data["access"])
        refresh_token = RefreshToken(response.data["refresh"])

        self.assertEqual(access_token["token_type"], "access")
        self.assertEqual(refresh_token["token_type"], "refresh")
        self.assertIsNone(access_token.verify())


@override_settings(SOCIAL_AUTH_PROVIDERS=["facebook"])
class FacebookOAuth2Test(OAuth2Test):
    access_token_body = json.dumps({"access_token": "foobar", "token_type": "bearer"})
    backend_path = "social_core.backends.facebook.FacebookOAuth2"
    user_data_body = json.dumps(
        {
            "email": "foobar@example.com",
            "first_name": "Foo",
            "id": "110011001100010",
            "last_name": "Bar",
            "name": "Foo Bar",
            "picture": {
                "height": 500,
                "is_silhouette": False,
                "url": "https://platform-lookaside.fbsbx.com/platform/profilepic/"
                "?asid=79043988521909457&height=500&width=500&ext=1691584443&hash=4SFjpKn6eDtdHXiIrST",
                "width": 500,
            },
            "username": "foobar",
        }
    )
    user_data_url = "https://graph.facebook.com/v{version}/me".format(
        version=FACEBOOK_API_VERSION
    )

    def test_login(self):
        self.do_rest_login("facebook")


@override_settings(SOCIAL_AUTH_PROVIDERS=["google-oauth2"])
class GoogleOAuth2Test(OAuth2Test):
    access_token_body = json.dumps({"access_token": "foobar", "token_type": "bearer"})
    backend_path = "social_core.backends.google.GoogleOAuth2"
    phone_data_body = json.dumps(
        {
            "etag": "%Q307aI9ABA8FgzBDoJx71iyhrZWyM3HsaWwP",
            "phoneNumbers": [
                {
                    "canonicalForm": "+36509999999",
                    "formattedType": "Mobile",
                    "metadata": {
                        "primary": True,
                        "source": {"type": "PROFILE", "id": "961158263084132371526"},
                        "verified": True,
                    },
                    "type": "mobile",
                    "value": "+36509999999",
                }
            ],
            "resourceName": "people/961158263084132371526",
        }
    )
    phone_data_url = "https://people.googleapis.com/v1/people/me"
    user_data_body = json.dumps(
        {
            "email": "foo@bar.com",
            "email_verified": True,
            "family_name": "Bar",
            "given_name": "Foo",
            "locale": "en",
            "name": "Foo Bar",
            "picture": "https://lh5.googleusercontent.com/-ui-GqpNh5Ms/"
            "AAAAAAAAAAI/AAAAAAAAAZw/a7puhHMO_fg/photo.jpg",
            "scope": [  # TODO: Check if it's really returned in real call
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/user.phonenumbers.read",
            ],
            "sub": "101010101010101010101",
        }
    )
    user_data_url = "https://www.googleapis.com/oauth2/v3/userinfo"

    def setUp(self):
        HTTPretty.register_uri(
            HTTPretty.GET,
            re.compile(f"{self.phone_data_url}.*"),
            body=self.phone_data_body,
        )
        super().setUp()

    def test_login(self):
        self.do_rest_login("google-oauth2")


@override_settings(SOCIAL_AUTH_PROVIDERS=["authsch"])
class AuthSCHOAuth2Test(OAuth2Test):
    access_token_body = json.dumps({"access_token": "foobar", "token_type": "bearer"})
    backend_path = "common.social_core.backends.AuthSCHOAuth2"
    user_data_body = json.dumps(
        {
            "basic": "foobar",
            "displayName": "Foo Bar",
            "givenName": "Bar",
            "mail": "foobar@example.com",
            "mobile": "+36509999999",
            "sn": "Foo",
        }
    )
    user_data_url = "https://auth.sch.bme.hu/api/profile/"

    def test_login(self):
        self.do_rest_login("authsch")

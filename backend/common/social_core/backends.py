from social_core.backends.oauth import BaseOAuth2


class AuthSCHOAuth2(BaseOAuth2):
    """AuthSCH OAuth2 authentication backend"""

    name = "authsch"
    ID_KEY = "internal_id"
    AUTHORIZATION_URL = "https://auth.sch.bme.hu/site/login"
    ACCESS_TOKEN_URL = "https://auth.sch.bme.hu/oauth2/token"  # nosec
    ACCESS_TOKEN_METHOD = "POST"  # nosec
    REFRESH_TOKEN_URL = "https://auth.sch.bme.hu/oauth2/token"  # nosec
    DEFAULT_SCOPE = [
        "basic",
        "displayName",
        "mail",
        "givenName",
        "sn",
        "mobile",
    ]
    EXTRA_DATA = [
        ("internal_id", "id"),
        ("expires_in", "expires"),
        ("displayName", "name"),
        ("mail", "email"),
        ("mobile", "mobile"),
    ]

    def get_user_details(self, response):
        """Return user details from AuthSCH account"""
        return {
            "username": response.get("internal_id"),
            "email": response.get("mail"),
            "first_name": response.get("givenName"),
            "last_name": response.get("sn"),
            "mobile": response.get("mobile"),
        }

    def user_data(self, access_token, *args, **kwargs):
        """Loads user data from service"""
        return self.get_json(
            "https://auth.sch.bme.hu/api/profile/",
            params={"access_token": access_token},
        )


class BSSLoginOAuth2(BaseOAuth2):
    """BSS Login OAuth2 authentication backend"""

    name = "bss-login"
    ID_KEY = "preferred_username"
    AUTHORIZATION_URL = "https://login.bsstudio.hu/application/o/authorize/"
    ACCESS_TOKEN_URL = "https://login.bsstudio.hu/application/o/token/"  # nosec
    ACCESS_TOKEN_METHOD = "POST"  # nosec
    REFRESH_TOKEN_URL = "https://login.bsstudio.hu/application/o/token/"  # nosec
    DEFAULT_SCOPE = [
        "email",
        "mobile",
        "name",
        "openid",
        "profile",
    ]
    EXTRA_DATA = [
        ("preferred_username", "id"),
        ("exp", "expires"),
        ("name", "name"),
        ("email", "email"),
        ("mobile", "mobile"),
    ]

    def get_user_details(self, response):
        """Return user details from BSS Login"""
        return {
            "username": response.get("preferred_username"),
            "email": response.get("email"),
            "first_name": response.get("first_name"),
            "last_name": response.get("last_name"),
            "mobile": response.get("mobile"),
        }

    def user_data(self, access_token, *args, **kwargs):
        """Loads user data from service"""
        return self.get_json(
            "https://login.bsstudio.hu/application/o/userinfo/",
            params={"access_token": access_token},
        )

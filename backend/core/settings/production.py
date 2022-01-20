import ldap
import sentry_sdk
from core.settings.common import *
from django_auth_ldap.config import GroupOfNamesType, LDAPSearch
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import ignore_logger
from sentry_sdk.integrations.redis import RedisIntegration

INSTALLED_APPS += [
    "social_django",
    "rest_social_auth",
]

# LDAP User authentication
# https://django-auth-ldap.readthedocs.io/en/latest/index.html

# Baseline configuration.
AUTH_LDAP_GLOBAL_OPTIONS = {
    ldap.OPT_REFERRALS: 0,
    ldap.OPT_X_TLS_REQUIRE_CERT: ldap.OPT_X_TLS_NEVER,
}
AUTH_LDAP_SERVER_URI = config("LDAP_SERVER_URI")
AUTH_LDAP_BIND_DN = config("LDAP_BIND_DN")
AUTH_LDAP_BIND_PASSWORD = config("LDAP_BIND_PASSWORD")

AUTH_LDAP_USER_DN = config("LDAP_USER_DN")
AUTH_LDAP_USER_SEARCH = LDAPSearch(
    AUTH_LDAP_USER_DN, ldap.SCOPE_SUBTREE, "(sAMAccountName=%(user)s)"
)

# Set up the basic group parameters.
AUTH_LDAP_GROUP_DN = config("LDAP_GROUP_DN")
AUTH_LDAP_GROUP_SEARCH = LDAPSearch(
    AUTH_LDAP_GROUP_DN,
    ldap.SCOPE_SUBTREE,
    "(objectClass=group)",
)
AUTH_LDAP_GROUP_TYPE = GroupOfNamesType(name_attr="cn")

# Mirror user's groups to Django. Note: It overwrites the user's existing groups.
# If LDAP_MIRROR_GROUPS_EXCEPT is not set or empty mirror all groups
if config("LDAP_MIRROR_GROUPS_EXCEPT", default="", cast=Csv()):
    AUTH_LDAP_MIRROR_GROUPS_EXCEPT = config("LDAP_MIRROR_GROUPS_EXCEPT", cast=Csv())
else:
    AUTH_LDAP_MIRROR_GROUPS = True

# Simple group restrictions
AUTH_LDAP_REQUIRE_GROUP = config("LDAP_STAFF_GROUP")

# Populate the Django user from the LDAP directory.
AUTH_LDAP_USER_ATTR_MAP = {
    "username": "sAMAccountName",
    "first_name": "givenName",
    "last_name": "sn",
    "email": "mail",
}

AUTH_LDAP_USER_FLAGS_BY_GROUP = {
    "is_staff": config("LDAP_STAFF_GROUP"),
    "is_superuser": config("LDAP_SUPERUSER_GROUP"),
}

# This is the default, but I like to be explicit.
AUTH_LDAP_ALWAYS_UPDATE_USER = True

# Use LDAP group membership to calculate group permissions.
AUTH_LDAP_FIND_GROUP_PERMS = True

# Cache distinguished names and group memberships for an hour to minimize
# LDAP traffic.
AUTH_LDAP_CACHE_TIMEOUT = 3600

# Add schedules task to sync users
CELERY_BEAT_SCHEDULE.update(
    {
        "sync_ldap_users": {
            "task": "core.tasks.scheduled_sync_ldap_users",
            "schedule": crontab(minute=15, hour=4),
        }
    }
)

# Social (OAuth2) User authentication
# https://github.com/st4lk/django-rest-social-auth
# https://python-social-auth.readthedocs.io/en/latest/index.html

# When using PostgreSQL, it’s recommended to use the built-in JSONB field to store the extracted extra_data.
SOCIAL_AUTH_JSONFIELD_ENABLED = True

# Use username, email, first and last name for user creation
SOCIAL_AUTH_USER_FIELDS = ["username", "email", "first_name", "last_name"]

# Do not let name to be changed by social profile.
SOCIAL_AUTH_IMMUTABLE_USER_FIELDS = ["first_name", "last_name"]

# Facebook OAuth2 settings:
SOCIAL_AUTH_FACEBOOK_KEY = config("AUTH_FACEBOOK_APP_ID")
SOCIAL_AUTH_FACEBOOK_SECRET = config("AUTH_FACEBOOK_APP_SECRET")
SOCIAL_AUTH_FACEBOOK_SCOPE = ["email"]
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {
    "fields": "id, name, email, picture.width(500)"
}
SOCIAL_AUTH_FACEBOOK_EXTRA_DATA = [
    ("name", "name"),
    ("email", "email"),
]

# Google OAuth2 settings:
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = config("AUTH_GOOGLE_CLIENT_ID")
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = config("AUTH_GOOGLE_CLIENT_SECRET")
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/user.phonenumbers.read",
]
SOCIAL_AUTH_GOOGLE_OAUTH2_EXTRA_DATA = [
    ("name", "name"),
    ("email", "email"),
    ("mobile", "mobile"),
]

# AuthSCH OAuth2 settings:
SOCIAL_AUTH_AUTHSCH_KEY = config("AUTH_SCH_CLIENT_ID")
SOCIAL_AUTH_AUTHSCH_SECRET = config("AUTH_SCH_CLIENT_SECRET")

# For most OAuth providers the redirect URL in frontend and backend should match (e.g.: Facebook)
# More information: https://github.com/st4lk/django-rest-social-auth#settings
REST_SOCIAL_OAUTH_REDIRECT_URI = "/redirect"

SOCIAL_AUTH_PIPELINE = (
    # Get the information we can about the user and return it in a simple
    # format to create the user instance later. In some cases the details are
    # already part of the auth response from the provider, but sometimes this
    # could hit a provider API.
    "social_core.pipeline.social_auth.social_details",
    # Get the social uid from whichever service we're authing thru. The uid is
    # the unique identifier of the given user in the provider.
    "social_core.pipeline.social_auth.social_uid",
    # Verifies that the current auth process is valid within the current
    # project, this is where emails and domains whitelists are applied (if
    # defined).
    "social_core.pipeline.social_auth.auth_allowed",
    # Custom action: Return error if e-mail was not provided by OAuth.
    "common.social_core.pipeline.check_for_email",
    # Checks if the current social-account is already associated in the site.
    "social_core.pipeline.social_auth.social_user",
    # Make up a username for this person, appends a random string at the end if
    # there's any collision.
    "social_core.pipeline.user.get_username",
    # Associates the current social details with another user account with
    # a similar email address. Disabled by default.
    "social_core.pipeline.social_auth.associate_by_email",
    # Custom action: Check if there is only one account from a provider is connected to a user.
    "common.social_core.pipeline.check_if_only_one_association_from_a_provider",
    # Custom action: Set user to active when first logs in.
    "common.social_core.pipeline.set_user_active_when_first_logs_in",
    # Custom action: Check if admin/staff user is still in Active Directory.
    "common.social_core.pipeline.check_if_admin_or_staff_user_is_still_privileged",
    # Custom action: Check if admin/staff user has already associated social profile to his/her account.
    "common.social_core.pipeline.check_if_admin_or_staff_user_already_associated",
    # Create a user account if we haven't found one yet.
    "social_core.pipeline.user.create_user",
    # Create the record that associates the social account with the user.
    "social_core.pipeline.social_auth.associate_user",
    # Update the user record with any changed info from the auth service.
    "social_core.pipeline.user.user_details",
    # Custom action: Add phone number to user's profile.
    "common.social_core.pipeline.add_phone_number_to_profile",
    # Custom action: Get user's avatar.
    "common.social_core.pipeline.get_avatar",
    # Populate the extra_data field in the social record with the values
    # specified by settings (and the default ones like access_token, etc).
    "social_core.pipeline.social_auth.load_extra_data",
)

AUTHENTICATION_BACKENDS = (
    "django_auth_ldap.backend.LDAPBackend",
    "common.social_core.backends.AuthSCHOAuth2",
    "social_core.backends.facebook.FacebookOAuth2",
    "social_core.backends.google.GoogleOAuth2",
)

# E-mail settings
# https://docs.djangoproject.com/en/3.0/topics/email/

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST")
EMAIL_PORT = config("EMAIL_PORT")

EMAIL_HOST_USER = config("EMAIL_HOST_USER", default=None)
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default=None)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=None)
EMAIL_USE_SSL = config("EMAIL_USE_SSL", default=None)
EMAIL_TIMEOUT = config("EMAIL_TIMEOUT", default=None)
EMAIL_SSL_KEYFILE = config("EMAIL_SSL_KEYFILE", default=None)
EMAIL_SSL_CERTFILE = config("EMAIL_SSL_CERTFILE", default=None)

DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL")
DEFAULT_REPLY_EMAIL = config("DEFAULT_REPLY_EMAIL")
WEEKLY_TASK_EMAIL = config("WEEKLY_TASK_EMAIL")

DEBUG_EMAIL = config(
    "DEBUG_EMAIL", default=None
)  # if set all e-mails will be sent to this address only

# External services:
SCH_EVENTS_TOKEN = config("SCH_EVENTS_TOKEN")

# Google Calendar settings:
GOOGLE_SERVICE_ACCOUNT_KEY_FILE_NAME = config(
    "GOOGLE_SERVICE_ACCOUNT_KEY_FILE_NAME", default=None
)
GOOGLE_SERVICE_ACCOUNT_KEY_FILE_PATH = (
    f"credentials/{GOOGLE_SERVICE_ACCOUNT_KEY_FILE_NAME}"
    if GOOGLE_SERVICE_ACCOUNT_KEY_FILE_NAME
    else None
)
GOOGLE_CALENDAR_ID = config("GOOGLE_CALENDAR_ID", default=None)

# Sentry (collect unhandled errors and exceptions and sends reports)
# https://sentry.io

if not DEBUG:
    sentry_sdk.init(
        dsn=config("SENTRY_URL"),
        integrations=[DjangoIntegration(), RedisIntegration()],
        # If you wish to associate users to errors (assuming you are using
        # django.contrib.auth) you may enable sending PII data.
        send_default_pii=True,
    )
    ignore_logger("django.security.DisallowedHost")

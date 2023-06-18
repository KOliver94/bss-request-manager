import ldap
from django_auth_ldap.config import GroupOfNamesType, LDAPSearch

from core.settings.base import *

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

AUTHENTICATION_BACKENDS += [
    "django_auth_ldap.backend.LDAPBackend",
]

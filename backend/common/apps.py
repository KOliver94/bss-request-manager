from django.apps import AppConfig
from django.conf import settings


class CommonConfig(AppConfig):
    name = "common"

    def ready(self):
        # noinspection PyUnresolvedReferences
        import common.signals

        if (
            "health_check" in settings.INSTALLED_APPS
            and "django_auth_ldap.backend.LDAPBackend"
            in settings.AUTHENTICATION_BACKENDS
        ):  # pragma: no cover
            from common.health_checks import LdapHealthCheck
            from health_check.plugins import plugin_dir

            plugin_dir.register(LdapHealthCheck)

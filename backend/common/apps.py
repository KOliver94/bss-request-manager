from django.apps import AppConfig
from django.conf import settings


class CommonConfig(AppConfig):
    name = "common"
    default_auto_field = "django.db.models.AutoField"

    def ready(self):
        # noinspection PyUnresolvedReferences
        import common.signals

        if (
            "health_check" in settings.INSTALLED_APPS
            and "django_auth_ldap.backend.LDAPBackend"
            in settings.AUTHENTICATION_BACKENDS
        ):  # pragma: no cover
            from health_check.plugins import plugin_dir

            from common.health_checks import LdapHealthCheck

            plugin_dir.register(LdapHealthCheck)

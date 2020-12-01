import ldap
from django.conf import settings
from health_check.backends import BaseHealthCheckBackend
from health_check.exceptions import ServiceUnavailable


class LdapHealthCheck(BaseHealthCheckBackend):
    def check_status(self):
        try:
            for opt, value in settings.AUTH_LDAP_GLOBAL_OPTIONS.items():
                ldap.set_option(opt, value)
            conn = ldap.initialize(settings.AUTH_LDAP_SERVER_URI)
            conn.bind_s(settings.AUTH_LDAP_BIND_DN, settings.AUTH_LDAP_BIND_PASSWORD)
        except ldap.SERVER_DOWN as e:
            self.add_error(ServiceUnavailable("LDAP Server is not available."), e)
        except ldap.NO_SUCH_OBJECT as e:
            self.add_error(ServiceUnavailable("Bind user does not exist."), e)
        except ldap.INVALID_CREDENTIALS as e:
            self.add_error(ServiceUnavailable("Invalid bind user credentials."), e)
        except ldap.LDAPError as e:
            self.add_error(ServiceUnavailable("Unknown error"), e)

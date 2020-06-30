from datetime import timedelta

import ldap
from django.core.management.base import BaseCommand
from django.utils import timezone
from django_auth_ldap.backend import LDAPBackend

from django.conf import settings


class Command(BaseCommand):
    help = 'Syncs LDAP users with Django DB'

    def handle(self, *args, **options):
        # Disable LDAPS certificate checks
        ldap.set_option(ldap.OPT_X_TLS_REQUIRE_CERT, ldap.OPT_X_TLS_NEVER)

        query = ldap.initialize(settings.AUTH_LDAP_SERVER_URI)  # Set connection URI
        query.set_option(ldap.OPT_REFERRALS, 0)
        query.bind_s(settings.AUTH_LDAP_BIND_DN, settings.AUTH_LDAP_BIND_PASSWORD)  # Define user credentials

        # Get only user objects from the given DN
        results = query.search_s(settings.AUTH_LDAP_USER_DN, ldap.SCOPE_SUBTREE, '(objectClass=User)')

        total_created = 0
        total = 0

        for a, r in results:
            # Get the username and pass it to the django-ldap-auth function.
            # This results another ldap query but this way we don't need to handle the saving and attribute mappings
            # It also handles group mirroring and assignment
            username = r['sAMAccountName'][0].decode('utf-8')  # returns bytes by default so we need to decode to string
            user = LDAPBackend().populate_user(username)

            # If the user was created in the last minute count it as new user.
            if user is None:
                raise Exception(f'No user named {username}')
            else:
                total += 1
                if user.date_joined > timezone.now() - timedelta(minutes=1):
                    total_created += 1

        self.stdout.write(self.style.SUCCESS(f'Found {total} user(s), {total_created} new.'))

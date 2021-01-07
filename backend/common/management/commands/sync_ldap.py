import logging
from datetime import timedelta

import ldap
from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils.timezone import localtime
from django_auth_ldap.backend import LDAPBackend
from rest_framework.exceptions import AuthenticationFailed


class Command(BaseCommand):
    help = "Syncs LDAP users with Django DB"

    def handle(self, *args, **options):
        for opt, value in settings.AUTH_LDAP_GLOBAL_OPTIONS.items():
            ldap.set_option(opt, value)

        query = ldap.initialize(settings.AUTH_LDAP_SERVER_URI)  # Set connection URI
        query.bind_s(
            settings.AUTH_LDAP_BIND_DN, settings.AUTH_LDAP_BIND_PASSWORD
        )  # Define user credentials

        # Get only user objects from the given DN
        results = query.search_s(
            settings.AUTH_LDAP_USER_DN, ldap.SCOPE_SUBTREE, "(objectClass=User)"
        )

        total_created = 0
        total_demoted = 0
        users_found = []

        for a, r in results:
            # Get the username and pass it to the django-ldap-auth function.
            # This results another ldap query but this way we don't need to handle the saving and attribute mappings
            # It also handles group mirroring and assignment
            username = r["sAMAccountName"][0].decode(
                "utf-8"
            )  # returns bytes by default so we need to decode to string
            try:
                user = LDAPBackend().populate_user(username)
            except AuthenticationFailed:  # This exception is being raised when a user is banned.
                continue  # Continue with the next iteration

            # If the user was created in the last minute count it as new user.
            if user is None:
                raise Exception(f"No user named {username}")
            else:
                users_found.append(username)
                if user.date_joined > localtime() - timedelta(minutes=1):
                    total_created += 1

        # Demote users who have staff or admin privileges but were not found in AD
        for user in User.objects.filter(
            Q(is_superuser=True) | Q(is_staff=True)
        ).exclude(username__in=users_found):
            user.is_superuser = False
            user.is_staff = False
            user.is_active = False
            group = user.groups.filter(
                name="Banned"
            ).first()  # If the user was in Banned group get the group
            user.groups.clear()  # Remove all group membership
            if group:  # If user was banned add again to the banned group
                user.groups.add(group)
            user.save()  # Save modifications
            total_demoted += 1
            logging.warning(
                f"{user.get_full_name()} ({user.username}) has been demoted."
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Found {len(users_found)} user(s), {total_created} new, {total_demoted} demoted."
            )
        )

import django_auth_ldap.backend
import requests
from common.models import UserProfile
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from libgravatar import Gravatar, sanitize_email
from rest_framework.exceptions import AuthenticationFailed


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()


def populate_user_profile_from_ldap(
    sender, user=None, ldap_user=None, **kwargs
):  # pragma: no cover
    # Before doing anything check if the user is banned.
    if user and not user._state.adding and user.groups.filter(name="Banned").exists():
        raise AuthenticationFailed(detail="Your user account has been suspended.")

    user.save()  # Create the user which will create the profile as well

    try:
        profile = user.userprofile  # Check if profile really exist
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(
            user=user
        )  # Create profile if it does not exist

    # Get attributes from ldap
    bucket = {"phone_number": ldap_user.attrs.get("telephoneNumber")}

    # Check each key if it has value add to profile
    for key, value in bucket.items():
        if value:
            setattr(user.userprofile, key, value[0])

    # Set profile picture from Gravatar
    if user.email:
        url = Gravatar(sanitize_email(user.email)).get_image(
            size=500, use_ssl=True, default="404"
        )
        try:
            resp = requests.get(url)
            resp.raise_for_status()
            profile.avatar["gravatar"] = url
            if not profile.avatar.get("provider", None):
                profile.avatar["provider"] = "gravatar"
        except requests.exceptions.HTTPError:
            pass

    profile.save()  # Save the profile modifications


django_auth_ldap.backend.populate_user.connect(
    populate_user_profile_from_ldap
)  # pragma: no cover

import django_auth_ldap.backend
import requests
from common.models import UserProfile
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from libgravatar import Gravatar, sanitize_email


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()


def populate_user_profile_from_ldap(sender, user=None, ldap_user=None, **kwargs):
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
    if not profile.avatar_url and user.email:
        url = Gravatar(sanitize_email(user.email)).get_image(
            size=500, use_ssl=True, default="404"
        )
        if not requests.get(url).status_code == 404:
            profile.avatar_url = url

    profile.save()  # Save the profile modifications


django_auth_ldap.backend.populate_user.connect(populate_user_profile_from_ldap)

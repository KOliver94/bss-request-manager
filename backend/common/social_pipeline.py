import logging

import requests
from libgravatar import Gravatar, sanitize_email
from rest_framework.exceptions import AuthenticationFailed, ValidationError


def auto_logout(*args, **kwargs):
    """Do not compare current user with new one"""
    return {"user": None}


def check_for_email(details, *args, **kwargs):
    if not details.get("email"):
        raise ValidationError("Email was not provided by OAuth provider.")


def check_if_user_is_banned(user=None, *args, **kwargs):
    """
    Check if user is banned.
    If the user existed but was not active (most likely to be created when (s)he sent a request without logging in)
    set the user to active.
    """
    if user and user.groups.filter(name="Banned").exists():
        raise AuthenticationFailed(detail="Your user account has been suspended.")
    elif not user.is_active:
        user.is_active = True
        user.save()
        logging.warning(
            f"User account has been activated for {user.last_name} {user.first_name} ({user.username})"
        )


def add_phone_number_to_profile(details, user, *args, **kwargs):
    if details.get("mobile"):
        user.userprofile.phone_number = details.get("mobile")
        user.save()


def get_avatar(backend, response, user, *args, **kwargs):
    if backend.name == "facebook":
        url = (
            f"https://graph.facebook.com/{response['id']}/picture?width=500&height=500"
        )
    elif backend.name == "google-oauth2":
        url = response["picture"]
    else:
        url = Gravatar(sanitize_email(user.email)).get_image(
            size=500, use_ssl=True, default="404"
        )
        if requests.get(url).status_code == 404:
            url = None

    if url and url != user.userprofile.avatar_url:
        user.userprofile.avatar_url = url
        user.save()

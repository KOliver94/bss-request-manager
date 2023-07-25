import logging

import requests
from django_auth_ldap.backend import LDAPBackend
from libgravatar import Gravatar, sanitize_email
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from social_core.exceptions import NotAllowedToDisconnect
from social_django.models import UserSocialAuth


def check_for_email(details, *args, **kwargs):
    if not details.get("email"):
        raise ValidationError("Email was not provided by OAuth provider.")


def check_if_only_one_association_from_a_provider(
    backend, new_association=True, user=None, *args, **kwargs
):
    """
    Check if there is only one association from a provider to a user.
    Only one profile can be connected to a user from a provider.
    """
    if (
        user
        and new_association
        and backend.strategy.storage.user.get_social_auth_for_user(
            user, provider=backend.name
        ).count()
        > 0
    ):
        msg = [
            "There is already a connected account from this provider. Please disconnect the other one first."
        ]
        raise ValidationError({backend: msg})


def set_user_active_when_first_logs_in(backend, user=None, *args, **kwargs):
    if user and not backend.strategy.storage.user.get_social_auth_for_user(user):
        user.is_active = True
        user.save()
        logging.warning(
            f"User account has been activated for {user.get_full_name()} ({user.username})"
        )


def check_if_admin_or_staff_user_is_still_privileged(
    strategy, user=None, *args, **kwargs
):
    """
    Check if a staff or admin member is still privileged or got removed from AD.
    Runs only at login process. (Request sender user is anonymous).
    """
    if (
        user
        and (user.is_superuser or user.is_staff)
        and strategy.request.user.is_anonymous
    ):
        ldap_user = LDAPBackend().populate_user(user.username)
        if ldap_user is None:
            user.is_superuser = False
            user.is_staff = False
            user.groups.clear()
            user.save()


def check_if_admin_or_staff_user_already_associated(
    backend, strategy, user=None, is_new=False, new_association=True, *args, **kwargs
):
    """
    A staff or admin member must associate his/her social profile first.
    (S)he has to log in with her/his LDAP account and associate the profile.
    Runs only at login process. (Request sender user is anonymous).
    """
    if strategy.request.user.is_anonymous:
        if (
            not is_new
            and new_association
            and user
            and (user.is_superuser or user.is_staff)
            and not backend.strategy.storage.user.get_social_auth_for_user(
                user, provider=backend.name
            ).exists()
        ):
            raise AuthenticationFailed(
                detail="Your social profile is not associated with your account."
            )


def add_phone_number_to_profile(backend, details, response, user, *args, **kwargs):
    phone_number = None

    # AuthSCH
    if details.get("mobile"):
        phone_number = details.get("mobile")

    # Google
    elif (
        backend.name == "google-oauth2"
        and "https://www.googleapis.com/auth/user.phonenumbers.read"
        in response["scope"]
    ):
        resp = requests.get(
            "https://people.googleapis.com/v1/people/me?personFields=phoneNumbers",
            headers={"Authorization": f"Bearer {response['access_token']}"},
            timeout=5,
        )
        if resp.status_code == 200 and len(resp.json().get("phoneNumbers", [])) > 0:
            phone_number = resp.json()["phoneNumbers"][0]["value"]
            response["mobile"] = resp.json()["phoneNumbers"][0]["value"]

    # Set phone number
    if not user.userprofile.phone_number and phone_number:
        user.userprofile.phone_number = phone_number
        user.save()


def get_avatar(backend, response, user, *args, **kwargs):
    if backend.name == "facebook":
        try:
            if not response.get("picture").get("data").get("is_silhouette"):
                user.userprofile.avatar["facebook"] = (
                    response.get("picture").get("data").get("url")
                )
        except AttributeError:
            pass
    elif backend.name == "google-oauth2" and response.get("picture"):
        user.userprofile.avatar["google-oauth2"] = response["picture"][:-6]

    url = Gravatar(sanitize_email(user.email)).get_image(
        size=500, use_ssl=True, default="404"
    )
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        user.userprofile.avatar["gravatar"] = url
        if not user.userprofile.avatar.get("provider", None):
            user.userprofile.avatar["provider"] = "gravatar"
    except requests.exceptions.HTTPError:
        pass

    if not user.userprofile.avatar.get("provider", None) and backend.name in [
        "facebook",
        "google-oauth2",
    ]:
        user.userprofile.avatar["provider"] = backend.name

    user.save()


def allowed_to_disconnect(
    strategy, user, name, user_storage, association_id=None, *args, **kwargs
):
    if not (
        UserSocialAuth.objects.filter(user=user).exclude(provider=name).exists()
        or user.is_staff
    ):
        raise NotAllowedToDisconnect()


def delete_avatar(
    strategy, user, name, user_storage, association_id=None, *args, **kwargs
):
    if user.userprofile.avatar.pop(name, None):
        user.save()

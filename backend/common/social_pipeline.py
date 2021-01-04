import logging

import requests
from django.db.models import ForeignObjectRel
from django_auth_ldap.backend import LDAPBackend
from libgravatar import Gravatar, sanitize_email
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from social_core.exceptions import AuthAlreadyAssociated
from video_requests.models import Comment, CrewMember, Rating, Request, Video


def check_for_email(details, *args, **kwargs):
    if not details.get("email"):
        raise ValidationError("Email was not provided by OAuth provider.")


def social_user(backend, strategy, uid, user=None, *args, **kwargs):
    """
    Check if the user's social profile is already associated.
    If the task is a login (anonymous) the user parameter must be None.
    When a logged in user tries to connect his profile with social profile the user parameter will be the user.
    Then we check if the social profile is already connected to another account. If the request is not forced an error
    will be thrown. If forced the two profiles will be merged.
    """
    provider = backend.name
    # Check if association from this provider with this uid already exists.
    social = backend.strategy.storage.user.get_social_auth(provider, uid)
    if social:
        # Requester user and found social user does not match.
        if user and social.user != user:
            if not strategy.request.data.get("force"):
                msg = "This account is already in use."
                raise AuthAlreadyAssociated(backend, msg)
            # Forced profile connection. Merge users.
            else:
                # Iterate though all objects where the social user was used and change to the other user.
                for object in Request.objects.filter(requester=social.user):
                    object.requester = user
                    object.save()
                for object in Request.objects.filter(responsible=social.user):
                    object.responsible = user
                    object.save()
                for object in Video.objects.filter(editor=social.user):
                    object.editor = user
                    object.save()
                for object in CrewMember.objects.filter(member=social.user):
                    object.member = user
                    object.save()
                for object in Comment.objects.filter(author=social.user):
                    object.author = user
                    object.save()
                for object in Rating.objects.filter(author=social.user):
                    object.author = user
                    object.save()

                # Get all related objects to social user. If found anything important which was not modified throw and exception.
                links = [
                    field.get_accessor_name()
                    for field in social.user._meta.get_fields()
                    if issubclass(type(field), ForeignObjectRel)
                ]
                for link in links:
                    if (
                        link == "outstandingtoken_set"
                        or link == "userprofile"
                        or link == "social_auth"
                        or link == "logentry"
                    ):
                        continue
                    if getattr(social.user, link).exists():
                        raise ValidationError(
                            "Found related object to user. Operation aborted."
                        )

                # Remove the original social user
                social.user.delete()
                social = backend.strategy.storage.user.get_social_auth(provider, uid)
        elif not user:
            user = social.user
    return {
        "social": social,
        "user": user,
        "is_new": user is None,
        "new_association": social is None,
    }


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
        msg = "There is already a connected account from this provider. Please disconnect the other one first."
        raise AuthAlreadyAssociated(backend, msg)


def check_if_user_is_banned(strategy, user=None, *args, **kwargs):
    """
    Check if user is banned.
    If the user existed but was not active (most likely to be created when (s)he sent a request without logging in)
    set the user to active.
    Runs only at login process. (Request sender user is anonymous).
    """
    if strategy.request.user.is_anonymous:
        if user and user.groups.filter(name="Banned").exists():
            raise AuthenticationFailed(detail="Your user account has been suspended.")
        elif user and not user.is_active:
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


def add_phone_number_to_profile(details, user, *args, **kwargs):
    if details.get("mobile"):
        user.userprofile.phone_number = details.get("mobile")
        user.save()


def get_avatar(backend, response, user, *args, **kwargs):
    if backend.name == "facebook":
        user.userprofile.avatar[
            "facebook"
        ] = f"https://graph.facebook.com/{response['id']}/picture?width=500&height=500"
    elif backend.name == "google-oauth2":
        user.userprofile.avatar["google-oauth2"] = response["picture"]

    url = Gravatar(sanitize_email(user.email)).get_image(
        size=500, use_ssl=True, default="404"
    )
    try:
        resp = requests.get(url)
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

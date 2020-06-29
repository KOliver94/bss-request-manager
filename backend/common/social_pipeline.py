import requests
from libgravatar import Gravatar, sanitize_email
from rest_framework.exceptions import ValidationError


def auto_logout(*args, **kwargs):
    """Do not compare current user with new one"""
    return {'user': None}


def check_for_email(backend, uid, user=None, *args, **kwargs):
    if not kwargs['details'].get('email'):
        raise ValidationError('Email was not provided by OAuth provider.')


def set_user_active_when_first_logs_in(backend, uid, user=None, *args, **kwargs):
    if user and not backend.strategy.storage.user.get_social_auth_for_user(user):
        user.is_active = True
        user.save()


def add_phone_number_to_profile(backend, uid, user=None, *args, **kwargs):
    if kwargs['details'].get('mobile'):
        user.userprofile.phone_number = kwargs['details'].get('mobile')
        user.save()


def get_avatar(backend, strategy, details, response, user, *args, **kwargs):
    if backend.name == 'facebook':
        url = f"https://graph.facebook.com/{response['id']}/picture?width=500&height=500"
    elif backend.name == 'google-oauth2':
        url = response['picture']
    else:
        url = Gravatar(sanitize_email(user.email)).get_image(size=500, use_ssl=True, default='404')
        if requests.get(url).status_code == 404:
            url = None

    if url and url != user.userprofile.avatar_url:
        user.userprofile.avatar_url = url
        user.save()

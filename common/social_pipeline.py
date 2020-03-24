from rest_framework.exceptions import ValidationError


def auto_logout(*args, **kwargs):
    """Do not compare current user with new one"""
    return {'user': None}


def check_for_email(backend, uid, user=None, *args, **kwargs):
    if not kwargs['details'].get('email'):
        raise ValidationError("Email wasn't provided by OAuth provider.")

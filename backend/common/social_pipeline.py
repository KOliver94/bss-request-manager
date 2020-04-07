from rest_framework.exceptions import ValidationError


def auto_logout(*args, **kwargs):
    """Do not compare current user with new one"""
    return {'user': None}


def check_for_email(backend, uid, user=None, *args, **kwargs):
    if not kwargs['details'].get('email'):
        raise ValidationError('Email was not provided by OAuth provider.')


def add_phone_number_to_profile(backend, uid, user=None, *args, **kwargs):
    if kwargs['details'].get('mobile'):
        user.userprofile.phone_number = kwargs['details'].get('mobile')
        user.save()

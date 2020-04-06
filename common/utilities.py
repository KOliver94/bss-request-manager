from django.contrib.auth.models import User


def get_editor_in_chief():
    return User.objects.filter(groups__name='FOSZERKESZTO')


def get_production_manager():
    return User.objects.filter(groups__name='GYARTASVEZETO')


def get_pr_responsible():
    return User.objects.filter(groups__name='PR')

import datetime

from django import template
from django.conf import settings
from django.utils import formats

register = template.Library()


@register.filter(expects_localtime=True, is_safe=False)
def date_fallback(value):
    if not isinstance(value, datetime.datetime):
        return value
    return formats.date_format(value, "DATETIME_FORMAT", use_l10n=True)


@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)


@register.simple_tag
def settings_value(name):
    return getattr(settings, name, "")

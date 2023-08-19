from django.conf import settings
from django_filters.rest_framework import BooleanFilter, FilterSet


class UserFilter(FilterSet):
    is_admin = BooleanFilter(method="filter_is_admin")
    is_staff = BooleanFilter()

    @staticmethod
    def filter_is_admin(queryset, name, value):
        if value:
            return queryset.filter(
                is_staff=True, groups__name=settings.ADMIN_GROUP
            ) | queryset.filter(is_staff=True, is_superuser=True)
        return queryset.exclude(
            is_staff=True, groups__name=settings.ADMIN_GROUP
        ).exclude(is_staff=True, is_superuser=True)

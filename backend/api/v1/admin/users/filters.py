from django_filters.rest_framework import BooleanFilter, FilterSet


class UserFilter(FilterSet):
    is_admin = BooleanFilter()
    is_staff = BooleanFilter()

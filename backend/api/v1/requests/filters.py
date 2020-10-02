from django_filters.rest_framework import DateFilter, FilterSet
from video_requests.models import Request


class RequestFilter(FilterSet):
    from_date = DateFilter(field_name="start_datetime", lookup_expr="gte")
    to_date = DateFilter(field_name="end_datetime", lookup_expr="lte")

    class Meta:
        model = Request
        fields = ["from_date", "to_date", "status"]

from django.forms import IntegerField
from django_filters.rest_framework import DateFilter, Filter, FilterSet

from video_requests.models import Request, Video


class IntegerFilter(Filter):
    """
    Helper filter class to change type of value to Integer
    because NumberFilter would use Decimal type which would return empty queryset when filtering.
    """

    field_class = IntegerField


class RequestFilter(FilterSet):
    from_date = DateFilter(field_name="start_datetime__date", lookup_expr="gte")
    to_date = DateFilter(field_name="end_datetime__date", lookup_expr="lte")

    class Meta:
        model = Request
        fields = ["from_date", "to_date", "status"]


class VideoFilter(FilterSet):
    from_date = DateFilter(
        field_name="request__start_datetime__date", lookup_expr="gte"
    )
    to_date = DateFilter(field_name="request__end_datetime__date", lookup_expr="lte")
    length = IntegerFilter(field_name="additional_data__length", lookup_expr="lte")

    class Meta:
        model = Video
        fields = ["from_date", "to_date", "length", "status"]

from collections import OrderedDict

from decouple import strtobool
from django.utils.encoding import force_str
from django.utils.translation import gettext_lazy as _
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class ExtendedPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = "page_size"

    # Client can control if they want pagination using this query parameter.
    # Default is True. If False is passed in, data is returned without pagination.
    pagination_query_param = "pagination"
    pagination_query_description = _("Return paginated response.")  # TODO: Translate

    def paginate_queryset(self, queryset, request, view=None):
        pagination = request.query_params.get(self.pagination_query_param, "true")
        if not strtobool(pagination):
            return None

        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    (
                        "links",
                        OrderedDict(
                            [
                                ("next", self.get_next_link()),
                                ("previous", self.get_previous_link()),
                            ]
                        ),
                    ),
                    ("results", data),
                    ("total_pages", self.page.paginator.num_pages),
                ]
            )
        )

    def get_paginated_response_schema(self, schema):
        return {
            "type": "object",
            "properties": {
                "count": {
                    "type": "integer",
                    "example": 123,
                },
                "links": {
                    "type": "object",
                    "properties": {
                        "next": {
                            "type": "string",
                            "nullable": True,
                            "format": "uri",
                            "example": "http://api.example.org/accounts/?{page_query_param}=4".format(
                                page_query_param=self.page_query_param
                            ),
                        },
                        "previous": {
                            "type": "string",
                            "nullable": True,
                            "format": "uri",
                            "example": "http://api.example.org/accounts/?{page_query_param}=2".format(
                                page_query_param=self.page_query_param
                            ),
                        },
                    },
                },
                "results": schema,
                "total_pages": {
                    "type": "integer",
                    "example": 123,
                },
            },
        }

    def get_schema_operation_parameters(self, view):
        parameters = super().get_schema_operation_parameters(view)
        parameters.append(
            {
                "name": self.pagination_query_param,
                "required": False,
                "in": "query",
                "description": force_str(self.pagination_query_description),
                "schema": {
                    "type": "boolean",
                },
            },
        )
        return parameters

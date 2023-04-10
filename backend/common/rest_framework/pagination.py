from decouple import strtobool
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class ExtendedPagination(PageNumberPagination):
    page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        """
        Controls pagination enable/disable option using query param "pagination".
        If pagination=false is passed in query params, data is returned without pagination.
        """
        pagination = request.query_params.get("pagination", "true")
        if not strtobool(pagination):
            return None

        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response(
            {
                "links": {
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                },
                "count": self.page.paginator.count,
                "total_pages": self.page.paginator.num_pages,
                "results": data,
            }
        )

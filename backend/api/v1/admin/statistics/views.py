from datetime import date, datetime

from api.v1.admin.statistics.serializers import RequestStatisticSerializer
from common.permissions import IsStaffUser
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from video_requests.models import Request, Video


class RequestStatisticView(generics.RetrieveAPIView):
    """
    Get some statistics about Requests and Videos.
    This endpoint is only accessible for staff users.

    Example: /admin/statistics/requests?from_date=2020-09-30&to_date=2020-10-01
    Params:
        @from_date = Date from when we check the requests. If not specified all Requests will be checked.
        @to_date = The date until we want to check the stats. If not specified it will be checked until today.

    Response: (All requests will be filtered by date if specified)
        new_requests = Number of requests with status = 1 which means we have not decided yet to accept it or not.
        in_progress_requests = Number of requests which are accepted but not yet done.
        completed_requests = Number of fully finished requests.
        upcoming_requests = The next 5 upcoming, accepted Request.
        best_videos = Top 5 best rated Video.
    """

    permission_classes = [IsStaffUser]
    serializer_class = RequestStatisticSerializer

    def retrieve(self, request, *args, **kwargs):
        # Get and validate all query parameters by trying to convert them to the corresponding type
        # if not the default value was used.
        try:
            from_date = self.request.query_params.get("from_date", None)
            if from_date:
                from_date = datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date = self.request.query_params.get("to_date", date.today())
            to_date = (
                datetime.strptime(to_date, "%Y-%m-%d").date()
                if type(to_date) is str
                else to_date
            )
        except ValueError:
            raise ValidationError("Invalid filter.")

        # Check if date range is valid
        if from_date and to_date < from_date:
            raise ValidationError("From date must be earlier than to date.")

        instance = {
            "new_requests": Request.objects.filter(
                status=1, start_datetime__lte=to_date
            ).cache(),
            "in_progress_requests": Request.objects.filter(
                status__range=[2, 6], start_datetime__lte=to_date
            ).cache(),
            "completed_requests": Request.objects.filter(
                status=7, start_datetime__lte=to_date
            ).cache(),
            "upcoming_requests": Request.objects.filter(status=2)
            .order_by("start_datetime")
            .cache(),
            "best_videos": Video.objects.order_by("-avg_rating")
            .filter(avg_rating__gt=0, request__start_datetime__lte=to_date)
            .cache(),
        }

        # If from date was specified as a query parameter filter the results
        if from_date:
            instance["new_requests"] = instance["new_requests"].filter(
                start_datetime__gte=from_date
            )
            instance["in_progress_requests"] = instance["in_progress_requests"].filter(
                start_datetime__gte=from_date
            )
            instance["completed_requests"] = instance["completed_requests"].filter(
                start_datetime__gte=from_date
            )
            instance["best_videos"] = instance["best_videos"].filter(
                request__start_datetime__gte=from_date
            )

        # Get the number of requests of the first 3 query sets and the top 5 from the last 2
        instance["new_requests"] = instance["new_requests"].count()
        instance["in_progress_requests"] = instance["in_progress_requests"].count()
        instance["completed_requests"] = instance["completed_requests"].count()
        instance["upcoming_requests"] = instance["upcoming_requests"][:5]
        instance["best_videos"] = instance["best_videos"][:5]

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

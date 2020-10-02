from datetime import date, datetime, timedelta

from api.v1.admin.statistics.serializers import RequestStatisticSerializer
from common.permissions import IsStaffUser
from django.db.models import Avg
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from video_requests.models import Request, Video


class RequestStatisticView(generics.RetrieveAPIView):
    permission_classes = [IsStaffUser]
    serializer_class = RequestStatisticSerializer

    def retrieve(self, request, *args, **kwargs):
        # Get and validate all query parameters by trying to convert them to the corresponding type
        # if not the default value was used.
        try:
            from_date = self.request.query_params.get("from", None)
            if from_date:
                from_date = datetime.strptime(from_date, "%Y-%m-%d").date()
            to_date = self.request.query_params.get("to", date.today())
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
            "best_videos": Video.objects.annotate(avg_rating=Avg("ratings__rating"))
            .order_by("-avg_rating")
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

        # Return only the top 5 result of each part
        instance = {key: instance[key][:5] for key in instance}

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

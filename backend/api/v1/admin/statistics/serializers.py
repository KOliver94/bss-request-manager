from django.db.models import Avg
from rest_framework import serializers
from rest_framework.fields import IntegerField
from video_requests.models import Request, Video


class StatisticRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Request
        fields = (
            "id",
            "title",
            "start_datetime",
            "end_datetime",
            "status",
        )
        read_only_fields = (
            "id",
            "title",
            "start_datetime",
            "end_datetime",
            "status",
        )


class StatisticVideoSerializer(serializers.ModelSerializer):
    request = StatisticRequestSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Video
        fields = ("id", "title", "request", "average_rating")
        read_only_fields = ("id", "title", "request", "average_rating")

    @staticmethod
    def get_average_rating(obj):
        return obj.ratings.aggregate(Avg("rating")).get("rating__avg")


class RequestStatisticSerializer(serializers.Serializer):
    new_requests = IntegerField(read_only=True)
    in_progress_requests = IntegerField(read_only=True)
    completed_requests = IntegerField(read_only=True)
    upcoming_requests = StatisticRequestSerializer(many=True, read_only=True)
    best_videos = StatisticVideoSerializer(many=True, read_only=True)

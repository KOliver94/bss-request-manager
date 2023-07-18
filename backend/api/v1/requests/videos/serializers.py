from drf_spectacular.utils import extend_schema_field
from rest_framework.fields import CharField, IntegerField, SerializerMethodField
from rest_framework.serializers import Serializer

from api.v1.requests.ratings.serializers import RatingRetrieveSerializer
from video_requests.models import Video


class VideoListRetrieveSerializer(Serializer):
    id = IntegerField(read_only=True)
    rating = SerializerMethodField(read_only=True)
    status = IntegerField(read_only=True)
    title = CharField(read_only=True)
    video_url = SerializerMethodField(read_only=True)

    @extend_schema_field(RatingRetrieveSerializer)
    def get_rating(self, obj):
        serializer = RatingRetrieveSerializer(
            obj.ratings.filter(author=self.context["request"].user).first()
        )
        return serializer.data

    @staticmethod
    def get_video_url(obj) -> str | None:
        if obj.status >= Video.Statuses.PUBLISHED and obj.additional_data.get(
            "publishing", {}
        ).get("website"):
            return obj.additional_data["publishing"]["website"]
        return None

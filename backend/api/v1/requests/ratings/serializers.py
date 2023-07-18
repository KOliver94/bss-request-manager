from rest_framework.fields import CharField, DateTimeField, IntegerField
from rest_framework.serializers import ModelSerializer, Serializer

from video_requests.models import Rating


class RatingRetrieveSerializer(Serializer):
    created = DateTimeField(read_only=True)
    rating = IntegerField(read_only=True)
    review = CharField(read_only=True)


class RatingCreateUpdateSerializer(ModelSerializer):
    class Meta:
        model = Rating
        fields = ["created", "rating", "review"]
        read_only_fields = ["created"]

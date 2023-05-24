from rest_framework.fields import CharField, DateTimeField, IntegerField
from rest_framework.serializers import ModelSerializer, Serializer

from api.v1.users.serializers import UserNestedListSerializer
from video_requests.models import Rating


class RatingAdminListDetailSerializer(Serializer):
    author = UserNestedListSerializer(read_only=True)
    created = DateTimeField(read_only=True)
    id = IntegerField(read_only=True)
    rating = IntegerField(read_only=True)
    review = CharField(read_only=True)


class RatingAdminCreateUpdateSerializer(ModelSerializer):
    author = UserNestedListSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ["author", "created", "id", "rating", "review"]
        read_only_fields = ["author", "created", "id"]

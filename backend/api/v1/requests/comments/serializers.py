from rest_framework.fields import CharField, DateTimeField, IntegerField
from rest_framework.serializers import ModelSerializer, Serializer

from api.v1.admin.users.serializers import UserNestedListSerializer
from video_requests.emails import email_crew_new_comment
from video_requests.models import Comment


class CommentListRetrieveSerializer(Serializer):
    author = UserNestedListSerializer(read_only=True)
    created = DateTimeField(read_only=True)
    id = IntegerField(read_only=True)
    text = CharField(read_only=True)


class CommentCreateUpdateSerializer(ModelSerializer):
    author = UserNestedListSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["author", "created", "id", "text"]
        read_only_fields = ["author", "created", "id"]

    def create(self, validated_data):
        comment = super().create(validated_data)
        email_crew_new_comment.delay(comment.id)
        return comment

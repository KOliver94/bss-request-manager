from rest_framework.fields import CharField, DateTimeField, IntegerField
from rest_framework.serializers import ModelSerializer, Serializer

from api.v1.admin.users.serializers import UserNestedListSerializer
from video_requests.models import Todo


class TodoAdminListRetrieveSerializer(Serializer):
    class TodoNestedRequestVideoSerializer(Serializer):
        id = IntegerField(read_only=True)
        title = CharField(read_only=True)

    assignees = UserNestedListSerializer(many=True, read_only=True)
    created = DateTimeField(read_only=True)
    creator = UserNestedListSerializer(read_only=True)
    description = CharField(read_only=True)
    id = IntegerField(read_only=True)
    request = TodoNestedRequestVideoSerializer(read_only=True)
    status = IntegerField(read_only=True)
    video = TodoNestedRequestVideoSerializer(read_only=True)


class TodoAdminCreateUpdateSerializer(ModelSerializer):
    class Meta:
        model = Todo
        fields = ["assignees", "description", "status"]

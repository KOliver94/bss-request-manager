from rest_framework.fields import CharField, IntegerField
from rest_framework.serializers import ModelSerializer, Serializer

from api.v1.users.serializers import UserNestedListSerializer
from video_requests.models import CrewMember


class CrewMemberAdminListRetrieveSerializer(Serializer):
    id = IntegerField(read_only=True)
    member = UserNestedListSerializer(read_only=True)
    position = CharField(read_only=True)


class CrewMemberAdminCreateUpdateSerializer(ModelSerializer):
    class Meta:
        model = CrewMember
        fields = ["id", "member", "position"]
        read_only_fields = ["id"]

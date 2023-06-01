from rest_framework.fields import CharField, DateTimeField
from rest_framework.serializers import Serializer

from api.v1.users.serializers import UserNestedListSerializer


class HistoryChangesSerializer(Serializer):
    field = CharField(read_only=True)
    new = CharField(read_only=True)
    old = CharField(read_only=True)


class HistorySerializer(Serializer):
    changes = HistoryChangesSerializer(many=True, read_only=True)
    date = DateTimeField(read_only=True, source="new_record.history_date")
    user = UserNestedListSerializer(read_only=True, source="new_record.history_user")

from rest_framework import serializers


class HistoricalRecordField(serializers.ListField):
    child = serializers.DictField()

    def to_representation(self, data):
        return super().to_representation(data.values())


class HistorySerializer(serializers.Serializer):
    history = HistoricalRecordField(read_only=True)

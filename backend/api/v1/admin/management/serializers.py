from django_celery_results.models import TaskResult
from rest_framework import serializers


class CeleryTasksSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskResult
        fields = (
            "task_id",
            "task_name",
            "status",
            "result",
            "date_created",
            "date_done",
            "traceback",
        )
        read_only_fields = (
            "task_id",
            "task_name",
            "status",
            "result",
            "date_created",
            "date_done",
            "traceback",
        )

from api.v1.admin.management.serializers import CeleryTasksSerializer
from common.permissions import IsAdminUser
from django_celery_results.models import TaskResult
from manager.tasks import scheduled_flush_expired_jwt_tokens, scheduled_sync_ldap_users
from rest_framework import generics, status
from rest_framework.response import Response


class FlushExpiredTokensView(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        task = scheduled_flush_expired_jwt_tokens.delay()
        return Response(data={"task_id": task.id}, status=status.HTTP_200_OK)


class SyncLdapView(generics.ListAPIView):
    permission_classes = [IsAdminUser]

    def list(self, request, *args, **kwargs):
        task = scheduled_sync_ldap_users.delay()
        return Response(data={"task_id": task.id}, status=status.HTTP_200_OK)


class CeleryTasksView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = CeleryTasksSerializer
    queryset = TaskResult.objects.all()

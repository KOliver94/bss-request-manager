from api.v1.admin.management.serializers import CeleryTasksSerializer
from common.permissions import IsAdminUser
from core.tasks import scheduled_flush_expired_jwt_tokens, scheduled_sync_ldap_users
from django_celery_results.models import TaskResult
from rest_framework import generics, status
from rest_framework.response import Response


class FlushExpiredTokensView(generics.DestroyAPIView):
    """
    Manually call flushexpiredtokens management function to remove exipred JWT tokens from DB.
    The function is called through Celery to be asynchronous.
    Call: DELETE /api/v1/admin/management/flush_expired_tokens
    Return: Celery task id
    """

    permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        task = scheduled_flush_expired_jwt_tokens.delay()
        return Response(data={"task_id": task.id}, status=status.HTTP_200_OK)


class SyncLdapView(generics.ListAPIView):
    """
    Manually call sync_ldap management function to sync users from LDAP (Active Directory).
    The function is called through Celery to be asynchronous.
    Call: GET /api/v1/admin/management/sync_ldap
    Return: Celery task id
    """

    permission_classes = [IsAdminUser]

    def list(self, request, *args, **kwargs):
        task = scheduled_sync_ldap_users.delay()
        return Response(data={"task_id": task.id}, status=status.HTTP_200_OK)


class CeleryTasksView(generics.ListAPIView):
    """
    List Celery tasks.
    Old tasks are deleted after 1 day (by default)
    """

    permission_classes = [IsAdminUser]
    serializer_class = CeleryTasksSerializer
    queryset = TaskResult.objects.all()

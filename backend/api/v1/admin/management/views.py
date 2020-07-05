from common.permissions import IsAdminUser
from django.core import management
from rest_framework import generics, status
from rest_framework.response import Response


class SyncLdap(generics.ListAPIView):
    permission_classes = [IsAdminUser]

    def list(self, request, *args, **kwargs):
        management.call_command("sync_ldap")
        return Response(status=status.HTTP_200_OK)


class FlushExpiredTokens(generics.DestroyAPIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        management.call_command("flushexpiredtokens")
        return Response(status=status.HTTP_200_OK)

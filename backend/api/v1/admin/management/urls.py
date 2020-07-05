from api.v1.admin.management.views import FlushExpiredTokens, SyncLdap
from django.urls import path

urlpatterns = [
    path("sync_ldap", SyncLdap.as_view()),
    path("flush_expired_tokens", FlushExpiredTokens.as_view()),
]

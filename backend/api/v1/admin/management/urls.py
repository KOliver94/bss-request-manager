from django.urls import path

from api.v1.admin.management.views import (
    CeleryTasksView,
    FlushExpiredTokensView,
    SyncLdapView,
)

urlpatterns = [
    path("flush_expired_tokens", FlushExpiredTokensView.as_view()),
    path("sync_ldap", SyncLdapView.as_view()),
    path("tasks", CeleryTasksView.as_view()),
]

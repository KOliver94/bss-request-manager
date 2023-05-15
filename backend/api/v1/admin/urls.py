from django.urls import include, path

from api.v1.admin.requests.views import RequestAdminListCreateView

urlpatterns = [
    path("requests", RequestAdminListCreateView.as_view()),
    path("requests/", include("api.v1.admin.requests.urls")),
]

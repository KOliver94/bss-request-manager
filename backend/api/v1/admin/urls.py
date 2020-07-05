from django.urls import include, path

urlpatterns = [
    path("management", include("api.v1.admin.management.urls")),
    path("", include("api.v1.admin.requests.urls")),
]

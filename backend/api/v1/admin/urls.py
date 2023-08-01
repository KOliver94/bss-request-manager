from django.urls import include, path

urlpatterns = [
    path("", include(("api.v1.admin.requests.urls", "requests"), namespace="requests")),
    path("", include(("api.v1.admin.users.urls", "users"), namespace="users")),
]

from django.urls import path, include

urlpatterns = [
    path('requests/', include('api.v1.admin.requests.urls')),
]

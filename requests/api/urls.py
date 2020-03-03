from django.urls import path, include

urlpatterns = [
    path('/', include('requests.api.user.urls')),
    path('admin/', include('requests.api.admin.urls')),
]

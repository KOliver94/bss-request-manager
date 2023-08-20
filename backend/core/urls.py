"""core URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path("api/", include(("api.urls", "api"), namespace="api")),
    re_path(r"", TemplateView.as_view(template_name="index.html")),  # React frontend
]

# Enable Django Admin when requested
if settings.DJANGO_ADMIN and "django.contrib.admin" in settings.INSTALLED_APPS:
    urlpatterns.insert(0, path("django-admin/", admin.site.urls))

# Enable Django Debug Toolbar
if "debug_toolbar" in settings.INSTALLED_APPS:
    urlpatterns.insert(
        0,
        path("__debug__/", include("debug_toolbar.urls")),
    )

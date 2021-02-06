from api.v1.misc.views import ContactView
from django.urls import path

urlpatterns = [path("contact", ContactView.as_view())]

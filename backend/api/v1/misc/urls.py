from django.urls import path

from api.v1.misc.views import ContactView

urlpatterns = [path("contact", ContactView.as_view(), name="contact")]

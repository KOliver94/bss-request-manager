from api.v1.admin.statistics.views import RequestStatisticView
from django.urls import path

urlpatterns = [
    path("requests", RequestStatisticView.as_view()),
]

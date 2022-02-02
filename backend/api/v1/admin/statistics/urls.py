from django.urls import path

from api.v1.admin.statistics.views import RequestStatisticView

urlpatterns = [
    path("requests", RequestStatisticView.as_view()),
]

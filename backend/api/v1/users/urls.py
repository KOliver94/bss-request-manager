from django.urls import path

from api.v1.users.views import UserDetailView

urlpatterns = [
    path('<int:pk>', UserDetailView.as_view()),
    path('me', UserDetailView.as_view(), kwargs={'pk': 'me'})
]

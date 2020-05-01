from django.urls import path

from api.v1.users.views import UserDetailView, StaffUserListView

urlpatterns = [
    path('<int:pk>', UserDetailView.as_view()),
    path('me', UserDetailView.as_view(), kwargs={'pk': 'me'}),
    path('staff', StaffUserListView.as_view())
]

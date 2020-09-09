from api.v1.users.views import BanUserView, StaffUserListView, UserDetailView
from django.urls import path

urlpatterns = [
    path("staff", StaffUserListView.as_view()),
    path("me", UserDetailView.as_view(), kwargs={"pk": "me"}),
    path("<int:pk>", UserDetailView.as_view()),
    path("<int:pk>/ban", BanUserView.as_view()),
]

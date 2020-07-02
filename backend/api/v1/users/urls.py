from api.v1.users.views import StaffUserListView, UserDetailView
from django.urls import path

urlpatterns = [
    path("<int:pk>", UserDetailView.as_view()),
    path("me", UserDetailView.as_view(), kwargs={"pk": "me"}),
    path("staff", StaffUserListView.as_view()),
]

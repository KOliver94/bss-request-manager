from django.urls import path, re_path

from api.v1.users.views import (
    BanUserCreateDeleteView,
    ConnectDisconnectSocialProfileView,
    StaffUserListView,
    UserDetailView,
    UserWorkedOnListView,
)

urlpatterns = [
    path("staff", StaffUserListView.as_view()),
    path("me", UserDetailView.as_view(), kwargs={"pk": "me"}),
    re_path(
        r"^me/social/(?:(?P<provider>[a-zA-Z0-9_-]+)/?)?$",
        ConnectDisconnectSocialProfileView.as_view(),
    ),
    path("me/worked", UserWorkedOnListView.as_view(), kwargs={"pk": "me"}),
    path("<int:pk>", UserDetailView.as_view()),
    path("<int:pk>/ban", BanUserCreateDeleteView.as_view()),
    path("<int:pk>/worked", UserWorkedOnListView.as_view()),
]

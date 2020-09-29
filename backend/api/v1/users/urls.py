from api.v1.users.views import (
    BanUserView,
    ConnectSocialProfileView,
    DisconnectSocialProfileView,
    StaffUserListView,
    UserDetailView,
)
from django.conf.urls import url
from django.urls import path

urlpatterns = [
    path("staff", StaffUserListView.as_view()),
    path("me", UserDetailView.as_view(), kwargs={"pk": "me"}),
    url(
        r"^me/connect/(?:(?P<provider>[a-zA-Z0-9_-]+)/?)?$",
        ConnectSocialProfileView.as_view(),
    ),
    path("me/disconnect/<str:provider>", DisconnectSocialProfileView.as_view()),
    path("<int:pk>", UserDetailView.as_view()),
    path("<int:pk>/ban", BanUserView.as_view()),
]

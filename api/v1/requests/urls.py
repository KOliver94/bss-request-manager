from django.urls import path

from api.v1.requests.views import RequestDefaultListCreateView, RequestDefaultDetailView, \
    CommentDefaultListCreateView, CommentDefaultDetailView, VideoDefaultListView, VideoDefaultDetailView, \
    RatingDefaultListCreateView, RatingDefaultDetailView

urlpatterns = [
    path('', RequestDefaultListCreateView.as_view()),
    path('<int:pk>', RequestDefaultDetailView.as_view()),
    path('<int:requestId>/comments', CommentDefaultListCreateView.as_view()),
    path('<int:requestId>/comments/<int:pk>', CommentDefaultDetailView.as_view()),
    path('<int:requestId>/videos', VideoDefaultListView.as_view()),
    path('<int:requestId>/videos/<int:pk>', VideoDefaultDetailView.as_view()),
    path('<int:requestId>/videos/<int:videoId>/ratings', RatingDefaultListCreateView.as_view()),
    path('<int:requestId>/videos/<int:videoId>/ratings/<int:pk>', RatingDefaultDetailView.as_view()),
]

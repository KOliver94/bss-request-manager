from django.urls import path

from api.v1.requests.views import RequestDefaultListCreateView, RequestDefaultDetailView, \
    CommentDefaultListCreateView, CommentDefaultDetailView, VideoDefaultListView, VideoDefaultDetailView, \
    RatingDefaultListCreateView, RatingDefaultDetailView

urlpatterns = [
    path('requests', RequestDefaultListCreateView.as_view()),
    path('requests/<int:pk>', RequestDefaultDetailView.as_view()),
    path('requests/<int:request_id>/comments', CommentDefaultListCreateView.as_view()),
    path('requests/<int:request_id>/comments/<int:pk>', CommentDefaultDetailView.as_view()),
    path('requests/<int:request_id>/videos', VideoDefaultListView.as_view()),
    path('requests/<int:request_id>/videos/<int:pk>', VideoDefaultDetailView.as_view()),
    path('requests/<int:request_id>/videos/<int:video_id>/ratings', RatingDefaultListCreateView.as_view()),
    path('requests/<int:request_id>/videos/<int:video_id>/ratings/<int:pk>', RatingDefaultDetailView.as_view()),
]

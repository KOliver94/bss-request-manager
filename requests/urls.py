from django.urls import path

from .views import RequestListCreateView, RequestDetailView, CommentListCreateView, CommentDetailView, \
    CrewListCreateView, CrewDetailView, VideoDetailView, VideoListCreateView, RatingListCreateView, RatingDetailView

urlpatterns = [
    path('', RequestListCreateView.as_view(), name=None),
    path('<int:pk>/', RequestDetailView.as_view(), name=None),
    path('<int:requestId>/comments', CommentListCreateView.as_view(), name=None),
    path('<int:requestId>/comments/<int:pk>', CommentDetailView.as_view(), name=None),
    path('<int:requestId>/crew', CrewListCreateView.as_view(), name=None),
    path('<int:requestId>/crew/<int:pk>', CrewDetailView.as_view(), name=None),
    path('<int:requestId>/videos', VideoListCreateView.as_view(), name=None),
    path('<int:requestId>/videos/<int:pk>', VideoDetailView.as_view(), name=None),
    path('<int:requestId>/videos/<int:videoId>/ratings', RatingListCreateView.as_view(), name=None),
    path('<int:requestId>/videos/<int:videoId>/ratings/<int:pk>', RatingDetailView.as_view(), name=None),
]

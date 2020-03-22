from django.urls import path

from api.v1.admin.requests.views import RequestAdminListCreateView, RequestAdminDetailView, CommentAdminListCreateView, \
    CommentAdminDetailView, CrewAdminListCreateView, CrewAdminDetailView, VideoAdminListCreateView, \
    VideoAdminDetailView, RatingAdminListCreateView, RatingAdminDetailView, HistoryRetrieveView

urlpatterns = [
    path('requests', RequestAdminListCreateView.as_view()),
    path('requests/<int:pk>', RequestAdminDetailView.as_view()),
    path('requests/<int:pk>/history', HistoryRetrieveView.as_view()),
    path('requests/<int:requestId>/comments', CommentAdminListCreateView.as_view()),
    path('requests/<int:requestId>/comments/<int:pk>', CommentAdminDetailView.as_view()),
    path('requests/<int:requestId_comment>/comments/<int:pk>/history', HistoryRetrieveView.as_view()),
    path('requests/<int:requestId>/crew', CrewAdminListCreateView.as_view()),
    path('requests/<int:requestId>/crew/<int:pk>', CrewAdminDetailView.as_view()),
    path('requests/<int:requestId>/videos', VideoAdminListCreateView.as_view()),
    path('requests/<int:requestId>/videos/<int:pk>', VideoAdminDetailView.as_view()),
    path('requests/<int:requestId_video>/videos/<int:pk>/history', HistoryRetrieveView.as_view()),
    path('requests/<int:requestId>/videos/<int:videoId>/ratings', RatingAdminListCreateView.as_view()),
    path('requests/<int:requestId>/videos/<int:videoId>/ratings/<int:pk>', RatingAdminDetailView.as_view()),
    path('requests/<int:requestId>/videos/<int:videoId>/ratings/<int:pk>/history', HistoryRetrieveView.as_view()),
]

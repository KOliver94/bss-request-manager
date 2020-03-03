from django.urls import path

from requests.api.admin.views import RequestAdminListCreateView, RequestAdminDetailView, CommentAdminListCreateView, \
    CommentAdminDetailView, CrewAdminListCreateView, CrewAdminDetailView, VideoAdminListCreateView, \
    VideoAdminDetailView, RatingAdminListCreateView, RatingAdminDetailView

urlpatterns = [
    path('', RequestAdminListCreateView.as_view()),
    path('<int:pk>/', RequestAdminDetailView.as_view()),
    path('<int:requestId>/comments', CommentAdminListCreateView.as_view()),
    path('<int:requestId>/comments/<int:pk>', CommentAdminDetailView.as_view()),
    path('<int:requestId>/crew', CrewAdminListCreateView.as_view()),
    path('<int:requestId>/crew/<int:pk>', CrewAdminDetailView.as_view()),
    path('<int:requestId>/videos', VideoAdminListCreateView.as_view()),
    path('<int:requestId>/videos/<int:pk>', VideoAdminDetailView.as_view()),
    path('<int:requestId>/videos/<int:videoId>/ratings', RatingAdminListCreateView.as_view()),
    path('<int:requestId>/videos/<int:videoId>/ratings/<int:pk>', RatingAdminDetailView.as_view()),
]

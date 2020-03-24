from django.conf.urls import url
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_social_auth import views

urlpatterns = [
    path('', include('api.v1.requests.urls')),
    path('admin/', include('api.v1.admin.urls')),
    path('login', TokenObtainPairView.as_view(), name='login_obtain_jwt_pair'),
    path('login/refresh', TokenRefreshView.as_view(), name='login_refresh_jwt_token'),
    url(r'^login/social/(?:(?P<provider>[a-zA-Z0-9_-]+)/?)?$',
        views.SocialJWTPairOnlyAuthView.as_view(),
        name='login_social_obtain_jwt_pair'),
]

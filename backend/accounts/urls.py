from django.urls import path
from .views import (UserAPIView, UserRegisterAPIView, UserLoginAPIVIew,
                    UserLogoutAPIView, CookieTokenRefreshAPIView)

urlpatterns = [
    path('user/', UserAPIView.as_view()),
    path('register/', UserRegisterAPIView.as_view()),
    path('login/', UserLoginAPIVIew.as_view()),
    path('logout/', UserLogoutAPIView.as_view()),
    path('refresh/', CookieTokenRefreshAPIView.as_view()),
]

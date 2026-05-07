# accounts/urls.py
from django.urls import path
from .views import RegisterView, UserListView, login_view, AddUserToFirmView


urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', login_view),
    path('add-user/', AddUserToFirmView.as_view()),
    path('users/', UserListView.as_view()),
    
]
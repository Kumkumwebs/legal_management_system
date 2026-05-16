# accounts/urls.py
from django.urls import path

from accounts.password_reset_views import ForgotPasswordView, ResetPasswordView
from .views import RegisterView, UserListView, login_view, AddUserToFirmView


urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', login_view),
    path('add-user/', AddUserToFirmView.as_view()),
    path('users/', UserListView.as_view()),
    
    # ── Password reset (NEW) ──
    path('forgot-password/', ForgotPasswordView.as_view()), 
    path('reset-password/',  ResetPasswordView.as_view()),    # POST → sets new password

]
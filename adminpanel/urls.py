# adminpanel/urls.py
from django.urls import path
from .views import AdminCreateFirmView, ChangeFirmAdminView

urlpatterns = [
    path('create-firm/', AdminCreateFirmView.as_view()),
    path('api/auth/change-admin/', ChangeFirmAdminView.as_view())
]
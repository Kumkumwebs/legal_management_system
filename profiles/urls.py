from django.urls import path
from .views import MyProfileView, FirmProfileView
 
urlpatterns = [
    path('me/', MyProfileView.as_view()),
    path('firm/', FirmProfileView.as_view()),
]

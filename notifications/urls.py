from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, save_fcm_token
from .views import NotificationPrefsView as NotificationPrefsView

router = DefaultRouter()
router.register(r'list', NotificationViewSet, basename='notifications')

urlpatterns = [
    path('save-token/', save_fcm_token),   # ✅ must come FIRST
    path('', include(router.urls)),
    path('preferences/', NotificationPrefsView.as_view()),# ✅ then router
]
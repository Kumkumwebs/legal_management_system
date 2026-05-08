from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from django.conf import settings
from django.conf.urls.static import static

# Views
from accounts.views import AcceptInviteView, InviteFirmUserView, InvitePlatformUserView
from clients.views import ClientViewSet
from cases.views import CaseViewSet, HearingViewSet
from documents.views import DocumentViewSet
from firms.views import FirmViewSet
from payments.views import PaymentViewSet
from messaging.views import MessageViewSet
from subscriptions.views import SubscriptionPlanViewSet, FirmSubscriptionViewSet

# Docs
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


router = DefaultRouter()

# Core modules
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'cases', CaseViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'messages', MessageViewSet)

# Firm + Subscription
router.register(r'firms', FirmViewSet)
router.register(r'plans', SubscriptionPlanViewSet)
router.register(r'subscriptions', FirmSubscriptionViewSet)
router.register(r'hearings', HearingViewSet)


urlpatterns = [
    # 📄 API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema')),

    # 🔗 Main API
    path('api/', include(router.urls)),

    # 🔔 Notifications (🔥 IMPORTANT FIX)
    path('api/notifications/', include('notifications.urls')),

    # 🔐 Auth
    path('api/auth/', include('accounts.urls')),
    path('api/auth/invite/firm/', InviteFirmUserView.as_view()),
    path('api/auth/invite/platform/', InvitePlatformUserView.as_view()),
    path('api/auth/accept-invite/', AcceptInviteView.as_view()),
    
     # NEW FEATURES
    path('api/', include('tasks.urls')),
    path('api/', include('support.urls')),
 
    # Profile endpoints
    path('api/profile/', include('profiles.urls')),
 
    # Notification preferences
    path('api/notifications/', include('notifications.urls')),

    # 🛠 Admin
    path('admin/', admin.site.urls),
    path('api/admin/', include('adminpanel.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
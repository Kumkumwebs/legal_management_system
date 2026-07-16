from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework.routers import DefaultRouter

from django.conf import settings
from django.conf.urls.static import static

# ── Views ──────────────────────────────────────────────────────────────────────
from accounts.views import AcceptInviteView, InviteFirmUserView, InvitePlatformUserView
from clients.views import ClientViewSet
from cases.views import CaseViewSet, HearingViewSet
from documents.views import DocumentViewSet
from firms.views import FirmViewSet
from firms.website_serializer import FirmWebsiteSettingsView, PublicFirmWebsiteView
from payments.views import PaymentViewSet
from messaging.views import MessageViewSet
from subscriptions.razorpay_views import CreateOrderView, VerifyPaymentView
from subscriptions.views import SubscriptionPlanViewSet, FirmSubscriptionViewSet

# ── Docs ───────────────────────────────────────────────────────────────────────
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


# ── Router ─────────────────────────────────────────────────────────────────────
router = DefaultRouter()

router.register(r'clients',       ClientViewSet,          basename='client')
router.register(r'cases',         CaseViewSet)
router.register(r'hearings',      HearingViewSet)
router.register(r'documents',     DocumentViewSet)
router.register(r'payments',      PaymentViewSet)
router.register(r'messages',      MessageViewSet)
router.register(r'firms',         FirmViewSet)
router.register(r'plans',         SubscriptionPlanViewSet)
router.register(r'subscriptions', FirmSubscriptionViewSet)


urlpatterns = [

    # ── Django Admin ───────────────────────────────────────────────────────────
    path('admin/', admin.site.urls),

    # ── API Docs ───────────────────────────────────────────────────────────────
    path('api/schema/', SpectacularAPIView.as_view(),                        name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'),   name='swagger-ui'),

    # ── Auth ───────────────────────────────────────────────────────────────────
    path('api/auth/',                    include('accounts.urls')),
    path('api/auth/invite/firm/',        InviteFirmUserView.as_view()),
    path('api/auth/invite/platform/',    InvitePlatformUserView.as_view()),
    path('api/auth/accept-invite/',      AcceptInviteView.as_view()),

    # ── Core Router URLs ───────────────────────────────────────────────────────
    path('api/', include(router.urls)),

    # ── Feature Apps ───────────────────────────────────────────────────────────
    path('api/', include('tasks.urls')),
    path('api/', include('support.urls')),

    # ── Profile ────────────────────────────────────────────────────────────────
    path('api/profile/', include('profiles.urls')),

    # ── Notifications (single registration — no duplicate) ────────────────────
    path('api/notifications/', include('notifications.urls')),

    # ── Admin Panel ────────────────────────────────────────────────────────────
    path('api/admin/', include('adminpanel.urls')),

    # ── Website / Firm Branding ────────────────────────────────────────────────
    path('api/website/<int:firm_id>/',  PublicFirmWebsiteView.as_view()),
    path('api/profile/firm/website/',   FirmWebsiteSettingsView.as_view()),

    # ── Subscriptions / Razorpay ───────────────────────────────────────────────
    path('api/subscriptions/create-order/',   CreateOrderView.as_view()),
    path('api/subscriptions/verify-payment/', VerifyPaymentView.as_view()),

    # ── React SPA Catch-all ────────────────────────────────────────────────────
    # Must be LAST — serves index.html for all non-API routes
    # so React Router handles /, /about, /contact, /login, /dashboard etc.
    re_path(r'^(?!api/|admin/|media/).*$', TemplateView.as_view(template_name='index.html')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
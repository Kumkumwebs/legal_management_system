# ═══════════════════════════════════════════════════════════
# firms/website_serializer.py
# ═══════════════════════════════════════════════════════════
from rest_framework import serializers
from .models import Firm


class FirmWebsiteSerializer(serializers.ModelSerializer):
    """
    Public-facing serializer — only exposes safe fields.
    Used by GET /api/website/{firm_id}/
    """
    logo = serializers.SerializerMethodField()
    hero_image = serializers.SerializerMethodField()

    class Meta:
        model = Firm
        fields = [
            'id', 'name', 'tagline', 'about_text',
            'practice_areas',
            'address', 'city', 'state', 'pincode',
            'website_phone', 'website_email', 'whatsapp_number',
            'bar_registration', 'gstin',
            'theme_color', 'accent_color', 'font_family',
            'website_template', 'website_enabled',
            'logo', 'hero_image',
        ]

    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None

    def get_hero_image(self, obj):
        request = self.context.get('request')
        if obj.hero_image and request:
            return request.build_absolute_uri(obj.hero_image.url)
        return None


class FirmWebsiteAdminSerializer(serializers.ModelSerializer):
    """
    Admin PATCH serializer — for updating website content from settings panel.
    Used by PATCH /api/profile/firm/website/
    """
    logo       = serializers.ImageField(required=False, allow_null=True)
    hero_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Firm
        fields = [
            'website_template', 'website_enabled',
            'tagline', 'about_text', 'practice_areas',
            'website_phone', 'website_email', 'whatsapp_number',
            'theme_color', 'accent_color', 'font_family', 'sidebar_dark',
            'logo', 'hero_image',
        ]


# ═══════════════════════════════════════════════════════════
# firms/website_views.py
# ═══════════════════════════════════════════════════════════
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from .models import Firm
from .website_serializer import FirmWebsiteSerializer, FirmWebsiteAdminSerializer


class PublicFirmWebsiteView(APIView):
    """
    GET /api/website/<firm_id>/
    Public — no auth required. Returns firm website data for rendering templates.
    Also accepts ?slug=firm-slug lookup.
    """
    permission_classes = [AllowAny]

    def get(self, request, firm_id=None):
        try:
            if firm_id:
                firm = Firm.objects.get(id=firm_id, is_active=True)
            else:
                return Response({'error': 'firm_id required'}, status=404)

            if not firm.website_enabled:
                return Response({'error': 'Website not enabled for this firm'}, status=404)

            serializer = FirmWebsiteSerializer(firm, context={'request': request})
            return Response(serializer.data)

        except Firm.DoesNotExist:
            return Response({'error': 'Firm not found'}, status=404)


class FirmWebsiteSettingsView(APIView):
    """
    GET  /api/profile/firm/website/  — get current website settings
    PATCH /api/profile/firm/website/ — update website content + template
    Only firm admin can access.
    """
    permission_classes = [IsAuthenticated]

    def _get_firm(self, request):
        profile = getattr(request.user, 'userprofile', None)
        if not profile or profile.role != 'admin':
            return None, Response({'error': 'Admin access required'}, status=403)
        if not profile.firm:
            return None, Response({'error': 'No firm linked'}, status=400)
        return profile.firm, None

    def get(self, request):
        firm, err = self._get_firm(request)
        if err: return err
        serializer = FirmWebsiteAdminSerializer(firm, context={'request': request})
        # Also return logo/hero full URLs
        data = serializer.data
        if firm.logo:
            data['logo'] = request.build_absolute_uri(firm.logo.url)
        if firm.hero_image:
            data['hero_image'] = request.build_absolute_uri(firm.hero_image.url)
        return Response(data)

    def patch(self, request):
        firm, err = self._get_firm(request)
        if err: return err

        serializer = FirmWebsiteAdminSerializer(
            firm, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Website settings updated', **serializer.data})
        return Response(serializer.errors, status=400)


# ═══════════════════════════════════════════════════════════
# Add to legal_management_system/urls.py:
# ═══════════════════════════════════════════════════════════
"""
from firms.website_views import PublicFirmWebsiteView, FirmWebsiteSettingsView

# In urlpatterns:
path('api/website/<int:firm_id>/',     PublicFirmWebsiteView.as_view()),
path('api/profile/firm/website/',      FirmWebsiteSettingsView.as_view()),
"""


# ═══════════════════════════════════════════════════════════
# Update profiles/views.py  — add website fields to FirmProfileView.patch()
# ═══════════════════════════════════════════════════════════
"""
# In FirmProfileView.patch(), update the 'updatable' list:
updatable = [
    'name', 'email', 'phone', 'address', 'city', 'state',
    'pincode', 'gstin', 'bar_registration',
    # ── new whitelabel fields ──
    'theme_color', 'accent_color', 'font_family', 'sidebar_dark',
    'website_template', 'website_enabled',
    'tagline', 'about_text', 'practice_areas',
    'website_phone', 'website_email', 'whatsapp_number',
]

# Also handle hero_image upload:
if 'hero_image' in request.FILES:
    firm.hero_image = request.FILES['hero_image']
"""
# profiles/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import User

from accounts.models import UserProfile
from firms.models import Firm
from .serializers import ProfileSerializer, FirmProfileSerializer


class MyProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'userprofile', None)
        firm = profile.firm if profile else None

        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': profile.role if profile else None,
            'profile_picture': (
                request.build_absolute_uri(profile.profile_picture.url)
                if profile and profile.profile_picture else None
            ),
            'firm': {
                'id': firm.id,
                'name': firm.name,
                'email': getattr(firm, 'email', ''),
                'phone': getattr(firm, 'phone', ''),
                'address': getattr(firm, 'address', ''),
                'logo': (
                    request.build_absolute_uri(firm.logo.url)
                    if getattr(firm, 'logo', None) else None
                ),
            } if firm else None
        }

        return Response(data)

    def patch(self, request):
        user = request.user
        profile = getattr(user, 'userprofile', None)

        # Update basic user fields
        for field in ['first_name', 'last_name', 'email']:
            if field in request.data:
                setattr(user, field, request.data[field])

        user.save()

        # Update profile picture
        if 'profile_picture' in request.FILES and profile:
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()

        # Change password
        new_password = request.data.get('new_password')
        old_password = request.data.get('old_password')

        if new_password and old_password:
            if not user.check_password(old_password):
                return Response(
                    {'error': 'Old password incorrect'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)
            user.save()

        return Response({
            'message': 'Profile updated successfully'
        })


class FirmProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_firm(self, user):
        if hasattr(user, 'userprofile'):
            return user.userprofile.firm
        return None

    def get(self, request):
        firm = self.get_firm(request.user)

        if not firm:
            return Response(
                {'error': 'Firm not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'id': firm.id,
            'name': firm.name,
            'email': getattr(firm, 'email', ''),
            'phone': getattr(firm, 'phone', ''),
            'address': getattr(firm, 'address', ''),
            'city': getattr(firm, 'city', ''),
            'state': getattr(firm, 'state', ''),
            'pincode': getattr(firm, 'pincode', ''),
            'gstin': getattr(firm, 'gstin', ''),
            'bar_registration': getattr(firm, 'bar_registration', ''),

            'logo': (
                request.build_absolute_uri(firm.logo.url)
                if getattr(firm, 'logo', None) else None
            ),

            'hero_image': (
                request.build_absolute_uri(firm.hero_image.url)
                if getattr(firm, 'hero_image', None) else None
            ),

            'created_at': getattr(firm, 'created_at', None),

            # Branding / Theme
            'theme_color': getattr(firm, 'theme_color', '#0D1B2A'),
            'accent_color': getattr(firm, 'accent_color', '#C9A84C'),
            'font_family': getattr(firm, 'font_family', 'DM Sans, sans-serif'),
            'sidebar_dark': getattr(firm, 'sidebar_dark', True),

            # Website Settings
            'website_template': getattr(firm, 'website_template', 'default'),
            'website_enabled': getattr(firm, 'website_enabled', False),

            # Website Content
            'tagline': getattr(firm, 'tagline', ''),
            'about_text': getattr(firm, 'about_text', ''),
            'practice_areas': getattr(firm, 'practice_areas', ''),

            # Contact
            'website_phone': getattr(firm, 'website_phone', ''),
            'website_email': getattr(firm, 'website_email', ''),
            'whatsapp_number': getattr(firm, 'whatsapp_number', ''),
        })

    def patch(self, request):
        profile = getattr(request.user, 'userprofile', None)

        if not profile or profile.role != 'admin':
            return Response(
                {'error': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )

        firm = profile.firm

        updatable_fields = [
            'name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'pincode',
            'gstin',
            'bar_registration',

            # Theme / Branding
            'theme_color',
            'accent_color',
            'font_family',
            'sidebar_dark',

            # Website
            'website_template',
            'website_enabled',

            # Website Content
            'tagline',
            'about_text',
            'practice_areas',

            # Contact
            'website_phone',
            'website_email',
            'whatsapp_number',
        ]

        for field in updatable_fields:
            if field in request.data:

                value = request.data[field]

                # Convert boolean strings to real booleans
                if field in ['sidebar_dark', 'website_enabled']:
                    value = str(value).lower() == 'true'

                setattr(firm, field, value)

        # Upload Logo
        if 'logo' in request.FILES:
            firm.logo = request.FILES['logo']

        # Upload Hero Image
        if 'hero_image' in request.FILES:
            firm.hero_image = request.FILES['hero_image']

        firm.save()

        return Response({
            'message': 'Firm profile updated successfully'
        }, status=status.HTTP_200_OK)
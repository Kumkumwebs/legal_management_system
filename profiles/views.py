from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.contrib.auth.models import User

from accounts.models import UserProfile
from firms.models import Firm
from .serializers import ProfileSerializer, FirmProfileSerializer


class MyProfileView(APIView):
    """GET/PATCH current user's profile"""
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
            'profile_picture': request.build_absolute_uri(profile.profile_picture.url) if profile and profile.profile_picture else None,
            'firm': {
                'id': firm.id,
                'name': firm.name,
                'email': firm.email if hasattr(firm, 'email') else '',
                'phone': firm.phone if hasattr(firm, 'phone') else '',
                'address': firm.address if hasattr(firm, 'address') else '',
                'logo': request.build_absolute_uri(firm.logo.url) if hasattr(firm, 'logo') and firm.logo else None,
            } if firm else None
        }
        return Response(data)

    def patch(self, request):
        user = request.user
        profile = getattr(user, 'userprofile', None)

        # Update user fields
        for field in ['first_name', 'last_name', 'email']:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        # Update profile picture
        if 'profile_picture' in request.FILES and profile:
            profile.profile_picture = request.FILES['profile_picture']
            profile.save()

        # Password change
        new_password = request.data.get('new_password')
        old_password = request.data.get('old_password')
        if new_password and old_password:
            if not user.check_password(old_password):
                return Response({'error': 'Old password incorrect'}, status=400)
            user.set_password(new_password)
            user.save()

        return Response({'message': 'Profile updated successfully'})


class FirmProfileView(APIView):
    """GET/PATCH firm details — admin only"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_firm(self, user):
        if hasattr(user, 'userprofile'):
            return user.userprofile.firm
        return None

    def get(self, request):
        firm = self.get_firm(request.user)
        if not firm:
            return Response({'error': 'Firm not found'}, status=404)

        data = {
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
            'logo': request.build_absolute_uri(firm.logo.url) if hasattr(firm, 'logo') and firm.logo else None,
            'created_at': firm.created_at if hasattr(firm, 'created_at') else None,
        }
        return Response(data)

    def patch(self, request):
        profile = getattr(request.user, 'userprofile', None)
        if not profile or profile.role != 'admin':
            return Response({'error': 'Admin access required'}, status=403)

        firm = profile.firm
        updatable = ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'gstin', 'bar_registration']
        for field in updatable:
            if field in request.data:
                setattr(firm, field, request.data[field])

        if 'logo' in request.FILES:
            firm.logo = request.FILES['logo']

        firm.save()
        return Response({'message': 'Firm profile updated successfully'})
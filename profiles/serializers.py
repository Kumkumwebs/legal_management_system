from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import UserProfile
from firms.models import Firm


class FirmSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()

    class Meta:
        model = Firm
        fields = [
            'id', 'name', 'email', 'phone', 'address',
            'city', 'state', 'pincode', 'gstin',
            'bar_registration', 'logo', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_logo(self, obj):
        request = self.context.get('request')
        if obj.logo and request:
            return request.build_absolute_uri(obj.logo.url)
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['role', 'profile_picture']
        read_only_fields = ['role']


class ProfileSerializer(serializers.ModelSerializer):
    """Full profile — user + profile + firm"""
    role = serializers.SerializerMethodField()
    profile_picture = serializers.SerializerMethodField()
    firm = serializers.SerializerMethodField()

    # Writable fields
    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'role', 'profile_picture', 'firm'
        ]
        read_only_fields = ['id', 'username', 'role', 'profile_picture', 'firm']

    def get_role(self, obj):
        if hasattr(obj, 'userprofile'):
            return obj.userprofile.role
        if obj.is_superuser:
            return 'super_admin'
        return None

    def get_profile_picture(self, obj):
        request = self.context.get('request')
        if hasattr(obj, 'userprofile') and obj.userprofile.profile_picture:
            if request:
                return request.build_absolute_uri(obj.userprofile.profile_picture.url)
        return None

    def get_firm(self, obj):
        if not hasattr(obj, 'userprofile') or not obj.userprofile.firm:
            return None
        firm = obj.userprofile.firm
        request = self.context.get('request')
        return {
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
            'logo': request.build_absolute_uri(firm.logo.url)
                    if request and getattr(firm, 'logo', None) else None,
        }

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.email = validated_data.get('email', instance.email)
        instance.save()
        return instance


class FirmProfileSerializer(serializers.ModelSerializer):
    """Used for admin PATCH on firm details"""
    logo = serializers.ImageField(required=False)

    class Meta:
        model = Firm
        fields = [
            'id', 'name', 'email', 'phone', 'address',
            'city', 'state', 'pincode', 'gstin',
            'bar_registration', 'logo'
        ]
        read_only_fields = ['id']

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request')
        if instance.logo and request:
            rep['logo'] = request.build_absolute_uri(instance.logo.url)
        return rep
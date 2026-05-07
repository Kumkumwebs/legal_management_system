from rest_framework import serializers
from django.contrib.auth.models import User
from firms.models import Firm
from accounts.models import UserProfile

class AdminCreateFirmSerializer(serializers.Serializer):
    # Firm
    firm_name = serializers.CharField()
    email = serializers.EmailField()
    phone = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    pincode = serializers.CharField()
    pan_number = serializers.CharField()
    gst_number = serializers.CharField(required=False)

    # Owner (Admin)
    username = serializers.CharField()
    password = serializers.CharField()

    def create(self, validated_data):
        # 🔹 1. Create Firm
        firm = Firm.objects.create(
            name=validated_data['firm_name'],
            email=validated_data['email'],
            phone=validated_data['phone'],
            address=validated_data['address'],
            city=validated_data['city'],
            state=validated_data['state'],
            pincode=validated_data['pincode'],
            pan_number=validated_data['pan_number'],
            gst_number=validated_data.get('gst_number')
        )

        # 🔹 2. Create Owner User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # 🔥 3. Link Owner to Firm
        UserProfile.objects.create(
            user=user,
            firm=firm,
            role='admin'
        )

        return {"firm": firm.id, "user": user.username}
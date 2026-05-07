from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Firm
from .models import Invite
from django.core.mail import send_mail
from accounts.models import UserProfile
from adminpanel.models import PlatformUser



class RegisterSerializer(serializers.Serializer):
    # User fields
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    # Firm fields
    firm_name = serializers.CharField()
    phone = serializers.CharField()
    address = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    pincode = serializers.CharField()

    pan_number = serializers.CharField()
    gst_number = serializers.CharField(required=False)

    def create(self, validated_data):
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Create firm
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

        # Create profile (ADMIN)
        UserProfile.objects.create(
            user=user,
            firm=firm,
            role='admin'
        )

        return user
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'
        
class AddUserToFirmSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.ChoiceField(choices=['lawyer', 'staff'])
    firm = serializers.PrimaryKeyRelatedField(
        queryset=Firm.objects.all(),
        required=False,
        help_text="Required for super admin. Regular users auto-assign their own firm."
    )
 
    def create(self, validated_data):
        request = self.context['request']
 
        # Determine the firm
        if 'firm' in validated_data and validated_data['firm']:
            # Firm explicitly passed (super admin flow)
            firm = validated_data['firm']
        elif hasattr(request.user, 'userprofile'):
            # Regular admin — use their own firm
            firm = request.user.userprofile.firm
            
        else:
            raise serializers.ValidationError({
                "firm": "This field is required. Super admin must specify a firm."
            })
 
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
 
        UserProfile.objects.create(
            user=user,
            firm=firm,
            role=validated_data['role']
        )
 
        return user
 
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()
    role = serializers.ChoiceField(choices=['lawyer', 'staff'])

    def create(self, validated_data):
        request = self.context['request']
        firm = request.user.userprofile.firm

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        UserProfile.objects.create(
            user=user,
            firm=firm,
            role=validated_data['role']
        )


        return user
class InviteFirmUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=['lawyer','staff'])
    firm = serializers.PrimaryKeyRelatedField(
        queryset=Firm.objects.all(),
        required=False
    )

    def create(self, validated_data):
        request = self.context['request']
        user = request.user

        # ✅ CASE 1: Firm user
        if hasattr(user, "userprofile"):
            firm = user.userprofile.firm

        # ✅ CASE 2: Super admin
        elif user.is_superuser or (
            hasattr(user, 'platformuser') and user.platformuser.role == 'super_admin'
        ):
            firm = validated_data.get("firm")

            if not firm:
                raise serializers.ValidationError({
                    "firm": "Super admin must select a firm"
                })

        # ❌ Invalid user
        else:
            raise serializers.ValidationError("User has no firm assigned")

        invite = Invite.objects.create(
            email=validated_data['email'],
            invite_type='firm',
            firm=firm,
            role=validated_data['role']
        )

        link = f"http://localhost:5173/accept-invite?token={invite.token}"

        send_mail(
            "Firm Invitation",
            f"Join firm using this link:\n{link}",
            None,
            [invite.email]
        )

        return invite
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=['lawyer','staff'])

    def create(self, validated_data):
        request = self.context['request']
        firm = request.user.userprofile.firm

        invite = Invite.objects.create(
            email=validated_data['email'],
            invite_type='firm',
            firm=firm,
            role=validated_data['role']
        )

        link = f"http://localhost:5173/accept-invite?token={invite.token}"

        send_mail(
            "Firm Invitation",
            f"Join firm using this link:\n{link}",
            None,
            [invite.email]
        )

        return invite

class InvitePlatformUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=['super_admin','support','sales'])

    def create(self, validated_data):
        invite = Invite.objects.create(
            email=validated_data['email'],
            invite_type='platform',
            role=validated_data['role']
        )

        link = f"http://localhost:5173/accept-invite?token={invite.token}"

        send_mail(
            "Platform Invitation",
            f"Join platform:\n{link}",
            None,
            [invite.email]
        )

        return invite


class AcceptInviteSerializer(serializers.Serializer):
    token = serializers.CharField()
    username = serializers.CharField()
    password = serializers.CharField()

    def create(self, validated_data):
        invite = Invite.objects.get(token=validated_data['token'], is_used=False)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=invite.email,
            password=validated_data['password']
        )

        if invite.invite_type == 'firm':
            UserProfile.objects.create(
                user=user,
                firm=invite.firm,
                role=invite.role
            )
        else:
            PlatformUser.objects.create(
                user=user,
                role=invite.role
            )

        invite.is_used = True
        invite.save()

        return user
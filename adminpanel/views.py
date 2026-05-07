from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AdminCreateFirmSerializer
from .permissions import IsSuperAdmin
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User
from accounts.models import UserProfile


class AdminCreateFirmView(APIView):
    permission_classes = [IsSuperAdmin]

    def post(self, request):
        serializer = AdminCreateFirmSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.save()
            return Response({
                "message": "Firm created successfully",
                "data": data
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ChangeFirmAdminView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_user = request.user

        # 🔐 Only current admin or super admin allowed
        if hasattr(current_user, "platformuser") and current_user.platformuser.role == "super_admin":
            pass
        elif hasattr(current_user, "userprofile") and current_user.userprofile.role == "admin":
            pass
        else:
            raise PermissionDenied("Only admin can change firm owner")

        new_admin_id = request.data.get("user_id")

        try:
            new_admin = User.objects.get(id=new_admin_id)
            new_profile = new_admin.userprofile
        except:
            return Response({"error": "User not found"}, status=404)

        firm = new_profile.firm

        # 🔥 Ensure same firm
        if hasattr(current_user, "userprofile") and current_user.userprofile.firm != firm:
            raise PermissionDenied("Cannot assign admin outside your firm")

        # 🔥 Remove old admin role
        old_admin = UserProfile.objects.filter(firm=firm, role="admin").first()
        if old_admin:
            old_admin.role = "lawyer"   # downgrade
            old_admin.save()

        # 🔥 Assign new admin
        new_profile.role = "admin"
        new_profile.save()

        return Response({"message": "Admin changed successfully"})
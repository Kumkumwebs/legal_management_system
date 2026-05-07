from rest_framework.permissions import BasePermission

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        # ✅ Allow Django superuser
        if user.is_superuser:
            return True

        # ✅ Allow PlatformUser super_admin
        if hasattr(user, 'platformuser') and user.platformuser.role == 'super_admin':
            return True

        return False
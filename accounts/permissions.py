from rest_framework.permissions import BasePermission
from django.utils import timezone
from subscriptions.models import FirmSubscription



# ─────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────
def get_user_role(user):
    if not user or not user.is_authenticated:
        return None

    if hasattr(user, "userprofile"):
        return user.userprofile.role

    return None


def get_user_firm(user):
    if hasattr(user, "userprofile"):
        return user.userprofile.firm
    return None


# ─────────────────────────────────────────────
# Role Permissions
# ─────────────────────────────────────────────
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role == "admin"


class IsLawyer(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ["admin", "lawyer"]


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        role = get_user_role(request.user)
        return role in ["admin", "lawyer", "staff"]


# ─────────────────────────────────────────────
# Subscription Permission (AUTO EXPIRE)
# ─────────────────────────────────────────────
class HasActiveSubscription(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        firm = get_user_firm(user)
        if not firm:
            return False

        subscription = FirmSubscription.objects.filter(
            firm=firm
        ).order_by('-end_date').first()

        if not subscription:
            return False

        # 🔥 AUTO EXPIRE
        if subscription.is_active and subscription.end_date < timezone.now():
            subscription.is_active = False
            subscription.save(update_fields=['is_active'])
            return False

        return subscription.is_active
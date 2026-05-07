from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Firm
from .serializers import FirmSerializer
from adminpanel.permissions import IsSuperAdmin
from accounts.models import UserProfile


def is_super_admin(user):
    return user.is_superuser or (
        hasattr(user, "platformuser") and user.platformuser.role == "super_admin"
    )


class FirmViewSet(viewsets.ModelViewSet):
    queryset = Firm.objects.all()
    serializer_class = FirmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if is_super_admin(user):
            return Firm.objects.all()

        if hasattr(user, "userprofile"):
            return Firm.objects.filter(id=user.userprofile.firm.id)

        return Firm.objects.none()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user

        if is_super_admin(user):
            return obj

        if hasattr(user, "userprofile") and obj.id == user.userprofile.firm.id:
            return obj

        raise PermissionDenied("You don't have access to this firm")

    def perform_create(self, serializer):
        if not is_super_admin(self.request.user):
            raise PermissionDenied("Only super admin can create firm")
        serializer.save()

    def perform_update(self, serializer):
        if not is_super_admin(self.request.user):
            raise PermissionDenied("Only super admin can update firm")
        serializer.save()

    def perform_destroy(self, instance):
        if not is_super_admin(self.request.user):
            raise PermissionDenied("Only super admin can delete firm")
        instance.delete()

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def toggle_active(self, request, pk=None):
        firm = self.get_object()
        firm.is_active = not firm.is_active
        firm.save()

        return Response({
            "message": "Firm status updated",
            "is_active": firm.is_active
        })

    @action(detail=True, methods=["post"], permission_classes=[IsSuperAdmin])
    def toggle_block(self, request, pk=None):
        firm = self.get_object()
        firm.is_blocked = not firm.is_blocked
        firm.save()

        return Response({
            "message": "Firm block status updated",
            "is_blocked": firm.is_blocked
        })

    @action(detail=True, methods=["get"], permission_classes=[IsSuperAdmin])
    def stats(self, request, pk=None):
        firm = self.get_object()

        return Response({
            "clients": firm.clients.count() if hasattr(firm, "clients") else 0,
            "cases": firm.cases.count() if hasattr(firm, "cases") else 0,
            "users": UserProfile.objects.filter(firm=firm).count(),
        })
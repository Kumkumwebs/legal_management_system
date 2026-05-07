from django.shortcuts import render
from rest_framework import permissions
from legal_management_system.utils.views import FirmBaseViewSet
from .models import Payment
from .serializers import PaymentSerializer
from accounts.permissions import IsAdmin

from rest_framework.exceptions import PermissionDenied

class PaymentViewSet(FirmBaseViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        user = self.request.user

        if hasattr(user, "userprofile"):
            serializer.save(firm=user.userprofile.firm)
        else:
            raise PermissionDenied("User has no firm assigned")
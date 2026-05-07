from django.shortcuts import render
from rest_framework import permissions
from legal_management_system.utils.views import FirmBaseViewSet
from .models import Client
from .serializers import ClientSerializer
from accounts.permissions import IsStaff

class ClientViewSet(FirmBaseViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated, IsStaff]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Client.objects.all()

        if hasattr(user, "firm") and user.firm:
            return Client.objects.filter(firm=user.firm)

        return Client.objects.all()
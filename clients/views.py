from rest_framework import permissions
from legal_management_system.utils.views import FirmBaseViewSet
from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(FirmBaseViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Client.objects.all()

        if hasattr(user, 'userprofile') and user.userprofile.firm:
            return Client.objects.filter(
                firm=user.userprofile.firm
            )

        return Client.objects.none()
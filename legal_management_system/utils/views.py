# utils/views.py
from rest_framework import viewsets

class FirmBaseViewSet(viewsets.ModelViewSet):

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, "userprofile"):
            return self.queryset.filter(firm=user.userprofile.firm, is_deleted=False)
        return self.queryset.none()

    def perform_create(self, serializer):
        serializer.save(firm=self.request.user.userprofile.firm)
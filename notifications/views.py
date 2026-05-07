from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Notification, NotificationToken
from .serializers import NotificationSerializer


# 🔔 Notification ViewSet
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        return Response({"error": "Not allowed"}, status=403)

    # ✅ Mark single
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"message": "Marked as read"})

    # ✅ Mark all
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({"message": "All marked as read"})


# 📱 SAVE TOKEN API (IMPORTANT)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_fcm_token(request):
    token = request.data.get("token")

    if not token:
        return Response({"error": "Token required"}, status=400)

    NotificationToken.objects.update_or_create(
        token=token,                 # 🔥 unique per device
        defaults={"user": request.user}
    )

    return Response({"message": "Token saved"})
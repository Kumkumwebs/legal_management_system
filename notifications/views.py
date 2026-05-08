from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Notification, NotificationToken
from .serializers import NotificationSerializer
from .models import NotificationPreference
from rest_framework.views import APIView
from rest_framework import permissions



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

class NotificationPrefsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
 
    def get(self, request):
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        return Response({
            'email': {
                'enabled': prefs.email_enabled,
                'task_assigned': prefs.email_task_assigned,
                'hearing_reminder': prefs.email_hearing_reminder,
                'ticket_update': prefs.email_ticket_update,
                'payment_receipt': prefs.email_payment_receipt,
                'plan_expiry': prefs.email_plan_expiry,
            },
            'push': {
                'enabled': prefs.push_enabled,
                'task_assigned': prefs.push_task_assigned,
                'hearing_reminder': prefs.push_hearing_reminder,
                'ticket_update': prefs.push_ticket_update,
                'case_update': prefs.push_case_update,
            },
            'whatsapp': {
                'enabled': prefs.whatsapp_enabled,
                'task_assigned': prefs.whatsapp_task_assigned,
                'hearing_reminder': prefs.whatsapp_hearing_reminder,
                'payment_receipt': prefs.whatsapp_payment_receipt,
                'ticket_update': prefs.whatsapp_ticket_update,
            }
        })
 
    def patch(self, request):
        prefs, _ = NotificationPreference.objects.get_or_create(user=request.user)
        data = request.data
 
        # Email
        email = data.get('email', {})
        for key, field in {
            'enabled': 'email_enabled',
            'task_assigned': 'email_task_assigned',
            'hearing_reminder': 'email_hearing_reminder',
            'ticket_update': 'email_ticket_update',
            'payment_receipt': 'email_payment_receipt',
            'plan_expiry': 'email_plan_expiry',
        }.items():
            if key in email:
                setattr(prefs, field, email[key])
 
        # Push
        push = data.get('push', {})
        for key, field in {
            'enabled': 'push_enabled',
            'task_assigned': 'push_task_assigned',
            'hearing_reminder': 'push_hearing_reminder',
            'ticket_update': 'push_ticket_update',
            'case_update': 'push_case_update',
        }.items():
            if key in push:
                setattr(prefs, field, push[key])
 
        # WhatsApp
        wa = data.get('whatsapp', {})
        for key, field in {
            'enabled': 'whatsapp_enabled',
            'task_assigned': 'whatsapp_task_assigned',
            'hearing_reminder': 'whatsapp_hearing_reminder',
            'payment_receipt': 'whatsapp_payment_receipt',
            'ticket_update': 'whatsapp_ticket_update',
        }.items():
            if key in wa:
                setattr(prefs, field, wa[key])
 
        prefs.save()
        return Response({'message': 'Preferences updated'})
 
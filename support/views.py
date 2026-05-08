from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import SupportTicket, TicketReply
from .serializers import SupportTicketSerializer, TicketReplySerializer
from email_service.tasks_email import (
    send_ticket_created_email,
    send_ticket_resolved_email
)


def get_firm(user):
    if hasattr(user, 'userprofile'):
        return user.userprofile.firm
    return None


def get_role(user):
    if hasattr(user, 'userprofile'):
        return user.userprofile.role
    if user.is_superuser:
        return 'super_admin'
    return None


class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = get_role(user)

        if role == 'super_admin':
            qs = SupportTicket.objects.all()
        else:
            firm = get_firm(user)
            qs = SupportTicket.objects.filter(firm=firm)

        # Filters
        s = self.request.query_params.get('status')
        if s:
            qs = qs.filter(status=s)

        return qs.select_related('firm', 'created_by', 'assigned_to').prefetch_related('replies__author')

    def perform_create(self, serializer):
        firm = get_firm(self.request.user)
        ticket = serializer.save(created_by=self.request.user, firm=firm)
        send_ticket_created_email(ticket)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        ticket = self.get_object()
        ticket.status = 'resolved'
        ticket.resolved_at = timezone.now()
        ticket.save()
        send_ticket_resolved_email(ticket)
        return Response(SupportTicketSerializer(ticket).data)

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        ticket = self.get_object()
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'error': 'Message required'}, status=400)

        role = get_role(request.user)
        reply = TicketReply.objects.create(
            ticket=ticket,
            author=request.user,
            message=message,
            is_staff_reply=(role in ['super_admin', 'admin'])
        )
        return Response(TicketReplySerializer(reply).data, status=201)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'open': qs.filter(status='open').count(),
            'in_progress': qs.filter(status='in_progress').count(),
            'resolved': qs.filter(status='resolved').count(),
        })
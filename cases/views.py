from django.shortcuts import render
from httpcore import Response
from rest_framework import permissions, viewsets
from legal_management_system.utils.views import FirmBaseViewSet
from .models import Case
from .serializers import CaseSerializer
from accounts.permissions import IsLawyer
from .serializers import HearingSerializer
from .models import Hearing
from rest_framework.decorators import action


class CaseViewSet(FirmBaseViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsLawyer]

class HearingViewSet(viewsets.ModelViewSet):
    queryset = Hearing.objects.all()
    serializer_class = HearingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Hearing.objects.filter(
            created_by=self.request.user
        )

        # ✅ Filter by case
        case_id = self.request.query_params.get('case')

        if case_id:
            queryset = queryset.filter(case_id=case_id)
        # import pdb; pdb.set_trace();
        print("HEARINGS QUERYSET:", queryset.query)
        # ✅ Calendar filter (by date range)
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')

        if start and end:
            queryset = queryset.filter(
                date__range=[start, end]
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )
    queryset = Hearing.objects.all()
    serializer_class = HearingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Hearing.objects.filter(created_by=self.request.user)
        case_id = self.request.query_params.get('case')

        if case_id:
            queryset = queryset.filter(case_id=case_id)
        # import pdb; pdb.set_trace();
        # 🔥 Calendar filter (by date range)
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')

        if start and end:
            queryset = queryset.filter(date__range=[start, end])

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
@action(detail=False, methods=['get'])
def upcoming_hearings(self, request):
    days = int(request.query_params.get('days', 7))
    today    = timezone.now().date()
    end_date = today + timedelta(days=days)
 
    firm = request.user.userprofile.firm
 
    hearings = Hearing.objects.filter(
        case__firm=firm,
        date__gte=today,
        date__lte=end_date,
    ).select_related('case', 'case__client').order_by('date', 'start_time')
 
    data = [{
        'id':           h.id,
        'case_id':      h.case_id,
        'case_title':   h.case.title,
        'case_number':  h.case.case_number,
        'client_name':  h.case.client.name if h.case.client else '',
        'title':        h.title,
        'date':         str(h.date),
        'start_time':   str(h.start_time) if h.start_time else None,
        'court_name':   h.court_name,
        'judge_name':   h.judge_name or '',
        'days_until':   (h.date - today).days,
    } for h in hearings]
 
    return Response(data)


@action(detail=True, methods=['post'], url_path='notify-client')
def notify_client(self, request, pk=None):
    hearing = self.get_object()
    case    = hearing.case
    client  = case.client
 
    results = {}
 
    # Email
    if client and client.email:
        from email_service.tasks_email import send_new_hearing_email
        from django.contrib.auth.models import User
        dummy = type('obj', (object,), {'email': client.email, 'username': client.name})()
        send_new_hearing_email([dummy], hearing, case.title, request.user.username)
        results['email'] = f'Sent to {client.email}'
 
    # WhatsApp
    if client and client.phone:
        from cases.tasks import _send_whatsapp_hearing_reminder
        _send_whatsapp_hearing_reminder(client, hearing, case)
        results['whatsapp'] = f'Sent to {client.phone}'
 
    if not results:
        return Response({'error': 'Client has no email or phone on file'}, status=400)
 
    return Response({'message': 'Notifications sent', 'results': results})


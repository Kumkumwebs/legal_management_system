from django.shortcuts import render
from rest_framework import permissions, viewsets
from legal_management_system.utils.views import FirmBaseViewSet
from .models import Case
from .serializers import CaseSerializer
from accounts.permissions import IsLawyer
from .serializers import HearingSerializer
from .models import Hearing


class CaseViewSet(FirmBaseViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsLawyer]

class HearingViewSet(viewsets.ModelViewSet):
    queryset = Hearing.objects.all()
    serializer_class = HearingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Hearing.objects.filter(created_by=self.request.user)

        # 🔥 Calendar filter (by date range)
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')

        if start and end:
            queryset = queryset.filter(date__range=[start, end])

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
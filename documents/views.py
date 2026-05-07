from django.shortcuts import render
from rest_framework import permissions
from rest_framework.decorators import action
from django.http import FileResponse
import os

from legal_management_system.utils.views import FirmBaseViewSet
from .models import Document
from .serializers import DocumentSerializer
from accounts.permissions import IsLawyer


class DocumentViewSet(FirmBaseViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsLawyer]

    def perform_create(self, serializer):
        serializer.save(firm=self.request.user.userprofile.firm)

    # ✅ ADD THIS FUNCTION
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        document = self.get_object()

        if not document.file:
            return Response({"error": "No file found"}, status=404)

        file_path = document.file.path

        return FileResponse(
            open(file_path, 'rb'),
            as_attachment=True,
            filename=os.path.basename(file_path)
        )
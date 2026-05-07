from django.shortcuts import render
from rest_framework import permissions
from legal_management_system.utils.views import FirmBaseViewSet
from .models import Message
from .serializers import MessageSerializer
from accounts.permissions import IsStaff

class MessageViewSet(FirmBaseViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsStaff]
from rest_framework import serializers
from .models import SupportTicket, TicketReply
from django.contrib.auth.models import User


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class TicketReplySerializer(serializers.ModelSerializer):
    author = SimpleUserSerializer(read_only=True)

    class Meta:
        model = TicketReply
        fields = ['id', 'author', 'message', 'is_staff_reply', 'created_at']
        read_only_fields = ['id', 'author', 'is_staff_reply', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    
    firm = serializers.PrimaryKeyRelatedField(read_only=True)
    created_by = SimpleUserSerializer(read_only=True)
    assigned_to = SimpleUserSerializer(read_only=True)
    replies = TicketReplySerializer(many=True, read_only=True)
    firm_name = serializers.CharField(source='firm.name', read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_number', 'firm', 'firm_name',
            'created_by', 'assigned_to',
            'subject', 'description', 'category', 'priority', 'status',
            'created_at', 'updated_at', 'resolved_at', 'replies'
        ]
        read_only_fields = ['id', 'ticket_number', 'created_by', 'created_at', 'updated_at', 'resolved_at']
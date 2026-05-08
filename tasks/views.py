from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCommentSerializer
from email_service.tasks_email import send_task_assignment_email


def get_firm(user):
    if hasattr(user, 'userprofile'):
        return user.userprofile.firm
    return None


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        firm = get_firm(user)
        if not firm:
            return Task.objects.none()

        qs = Task.objects.filter(firm=firm).select_related(
            'assigned_to', 'created_by', 'case'
        ).prefetch_related('comments__author')

        # Lawyers/Staff only see their own tasks
        role = getattr(user.userprofile, 'role', None) if hasattr(user, 'userprofile') else None
        if role in ['lawyer', 'staff']:
            qs = qs.filter(assigned_to=user)

        # Filters
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        priority_filter = self.request.query_params.get('priority')
        if priority_filter:
            qs = qs.filter(priority=priority_filter)

        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            qs = qs.filter(assigned_to_id=assigned_to)

        return qs

    def perform_create(self, serializer):
        firm = get_firm(self.request.user)
        task = serializer.save(created_by=self.request.user, firm=firm)

        # Send assignment email
        if task.assigned_to and task.assigned_to.email:
            send_task_assignment_email(task)

    def perform_update(self, serializer):
        old_assigned = serializer.instance.assigned_to
        task = serializer.save()

        # Send email if assignment changed
        if task.assigned_to and task.assigned_to != old_assigned:
            if task.assigned_to.email:
                send_task_assignment_email(task)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        task = self.get_object()
        task.status = 'pending'
        task.completed_at = None
        task.save()
        return Response(TaskSerializer(task).data)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Comment text required'}, status=400)
        comment = TaskComment.objects.create(task=task, author=request.user, text=text)
        return Response(TaskCommentSerializer(comment).data, status=201)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'pending': qs.filter(status='pending').count(),
            'in_progress': qs.filter(status='in_progress').count(),
            'completed': qs.filter(status='completed').count(),
            'overdue': qs.filter(
                due_date__lt=timezone.now().date(),
                status__in=['pending', 'in_progress']
            ).count(),
        })
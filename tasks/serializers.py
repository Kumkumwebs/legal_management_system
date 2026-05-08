from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, TaskComment
from django.utils import timezone


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # ✅ Only real User model fields — no 'clients'
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class TaskCommentSerializer(serializers.ModelSerializer):
    author = SimpleUserSerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = ['id', 'author', 'text', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    assigned_to = SimpleUserSerializer(read_only=True)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_to',
        write_only=True,
        required=False,
        allow_null=True,
    )
    created_by = SimpleUserSerializer(read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)

    # ✅ case_title is safe — Task has a 'case' FK to Case which has 'title'
    case_title = serializers.SerializerMethodField()

    def get_case_title(self, obj):
        try:
            return obj.case.title if obj.case_id else None
        except Exception:
            return None

    class Meta:
        model = Task
        # ✅ ONLY fields that exist on the Task model — 'client' and 'client_name' REMOVED
        fields = [
            'id',
            'title',
            'description',
            'case',
            'case_title',
            'assigned_to',
            'assigned_to_id',
            'created_by',
            'priority',
            'status',
            'due_date',
            'completed_at',
            'created_at',
            'updated_at',
            'comments',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'completed_at']

    def update(self, instance, validated_data):
        if validated_data.get('status') == 'completed' and instance.status != 'completed':
            validated_data['completed_at'] = timezone.now()
        elif validated_data.get('status') and validated_data.get('status') != 'completed':
            validated_data['completed_at'] = None
        return super().update(instance, validated_data)
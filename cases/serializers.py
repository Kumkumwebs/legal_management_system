from rest_framework import serializers
from .models import Case, Hearing


class HearingSerializer(serializers.ModelSerializer):

    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()

    class Meta:
        model = Hearing
        fields = "__all__"

    def get_start(self, obj):
        return f"{obj.date}T{obj.start_time}"

    def get_end(self, obj):
        if obj.end_time:
            return f"{obj.date}T{obj.end_time}"
        return None

class CaseSerializer(serializers.ModelSerializer):
    hearings = HearingSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = '__all__'
        
class CaseSerializer(serializers.ModelSerializer):
    hearings   = HearingSerializer(many=True, read_only=True)
    # ✅ Add these computed fields
    client_name   = serializers.CharField(source='client.name', read_only=True)
    assigned_name = serializers.CharField(source='assigned_to.username', read_only=True, default='')
    upcoming_hearing = serializers.SerializerMethodField()
 
    def get_upcoming_hearing(self, obj):
        from django.utils import timezone
        next_h = obj.hearings.filter(date__gte=timezone.now().date()).order_by('date').first()
        if next_h:
            return {
                'id':         next_h.id,
                'title':      next_h.title,
                'date':       str(next_h.date),
                'start_time': str(next_h.start_time) if next_h.start_time else None,
                'court_name': next_h.court_name,
            }
        return None
 
    class Meta:
        model = Case
        fields = '__all__'
 
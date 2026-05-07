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
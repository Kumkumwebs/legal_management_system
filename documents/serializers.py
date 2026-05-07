from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    case_title = serializers.CharField(source="case.title", read_only=True)

    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['firm']
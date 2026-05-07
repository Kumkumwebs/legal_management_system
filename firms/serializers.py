from rest_framework import serializers
from .models import Firm

class FirmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firm
        fields = '__all__'
        read_only_fields = ['is_verified', 'is_blocked']

    def validate(self, data):
        gst = data.get("gst_number")
        pan = data.get("pan_number")

        if gst and len(gst) != 15:
            raise serializers.ValidationError("Invalid GST number")

        if pan and len(pan) != 10:
            raise serializers.ValidationError("Invalid PAN number")

        return data
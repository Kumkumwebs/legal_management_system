from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    case_title = serializers.CharField(source="case.title", read_only=True)

    # if your model uses choices for method:
    payment_method_display = serializers.CharField(
        source="get_payment_method_display", read_only=True
    )

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['firm']
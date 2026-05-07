from rest_framework import serializers
from .models import SubscriptionPlan, FirmSubscription


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = "__all__"


class FirmSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FirmSubscription
        fields = "__all__"
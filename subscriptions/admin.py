from django.contrib import admin
from .models import SubscriptionPlan, FirmSubscription


@admin.register(SubscriptionPlan)
class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'monthly_price',
        'yearly_price',
        'max_clients',
        'max_team_members',
        'storage_limit_gb',
    )
    search_fields = ('name',)
    list_filter = ('created_at',)


@admin.register(FirmSubscription)
class FirmSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        'firm',
        'plan',
        'billing_cycle',
        'start_date',
        'end_date',
        'is_active',
        'is_trial'
    )
    list_filter = ('billing_cycle', 'is_active', 'is_trial')
    search_fields = ('firm__name',)
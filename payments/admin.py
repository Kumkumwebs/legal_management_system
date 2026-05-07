from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'client','case', 'amount', 'status', 'payment_date')
    list_filter = ('status',)
    search_fields = ('client__name', 'case__name')
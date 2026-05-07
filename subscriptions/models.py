from django.db import models
from firms.models import Firm
from legal_management_system.utils.base import BaseModel
from django.utils import timezone
from datetime import timedelta


class SubscriptionPlan(BaseModel):
    name = models.CharField(max_length=50)

    monthly_price = models.DecimalField(max_digits=10, decimal_places=2)
    yearly_price = models.DecimalField(max_digits=10, decimal_places=2)

    max_clients = models.IntegerField()
    max_team_members = models.IntegerField()
    storage_limit_gb = models.IntegerField()
    message_limit = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


class FirmSubscription(BaseModel):
    BILLING_CHOICES = (
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    )

    firm = models.ForeignKey(
        Firm,
        on_delete=models.CASCADE,
        related_name="subscriptions"
    )

    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.SET_NULL,
        null=True
    )

    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(blank=True, null=True)

    billing_cycle = models.CharField(
        max_length=10,
        choices=BILLING_CHOICES
    )

    is_active = models.BooleanField(default=True)
    is_trial = models.BooleanField(default=False)

    # ✅ AUTO CALCULATE END DATE
    def save(self, *args, **kwargs):
        if not self.end_date:
            if self.billing_cycle == 'monthly':
                self.end_date = self.start_date + timedelta(days=30)
            else:
                self.end_date = self.start_date + timedelta(days=365)

        super().save(*args, **kwargs)

    # ✅ AUTO EXPIRE CHECK (NO CELERY NEEDED)
    def check_expiry(self):
        if self.is_active and self.end_date < timezone.now():
            self.is_active = False
            self.save(update_fields=['is_active'])
            return True
        return False

    # ✅ CHECK IF ACTIVE
    def is_valid(self):
        if not self.is_active:
            return False
        return self.end_date >= timezone.now()

    def __str__(self):
        plan_name = self.plan.name if self.plan else "No Plan"
        return f"{self.firm.name} - {plan_name}"
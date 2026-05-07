from django.utils import timezone
from .models import FirmSubscription

def expire_subscriptions():
    now = timezone.now()

    expired = FirmSubscription.objects.filter(
        is_active=True,
        end_date__lt=now
    )

    count = expired.update(is_active=False)

    print(f"Expired {count} subscriptions")
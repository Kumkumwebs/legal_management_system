from django.db import models
from django.contrib.auth.models import User
from legal_management_system.utils.base import BaseModel


# 🔔 Notification (for UI history)
class Notification(BaseModel):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=255)
    message = models.TextField()

    is_read = models.BooleanField(default=False)

    notification_type = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    redirect_url = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"


# 📱 FCM Token model
class NotificationToken(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="fcm_tokens"
    )

    token = models.TextField(unique=True)

    device_type = models.CharField(
        max_length=20,
        default="web"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.device_type}"
from django.db import models
from legal_management_system.utils.base import BaseModel


class Firm(BaseModel):
    name = models.CharField(max_length=255)

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)

    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)

    # 🔥 Legal Fields (India)
    pan_number = models.CharField(max_length=10, unique=True)
    gst_number = models.CharField(
        max_length=15,
        null=True,
        blank=True,
        unique=True
    )

    # 🔐 System fields
    is_active = models.BooleanField(default=True)
    is_blocked = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    # 📄 Agreement (optional)
    agreement_file = models.FileField(
        upload_to='firm_agreements/',
        null=True,
        blank=True
    )

    def save(self, *args, **kwargs):
        # 🔥 Normalize before saving
        if self.pan_number:
            self.pan_number = self.pan_number.upper().strip()

        if self.gst_number:
            self.gst_number = self.gst_number.upper().strip()

        if self.email:
            self.email = self.email.lower().strip()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.pan_number})"

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['pan_number']),
            models.Index(fields=['gst_number']),
            models.Index(fields=['email']),
        ]
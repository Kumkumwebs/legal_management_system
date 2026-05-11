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

    # Legal Fields
    pan_number = models.CharField(max_length=10, unique=True)
    gst_number = models.CharField(max_length=15, null=True, blank=True, unique=True)

    # System fields
    is_active = models.BooleanField(default=True)
    is_blocked = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    # Agreement
    agreement_file = models.FileField(upload_to='firm_agreements/', null=True, blank=True)

    # ✅ Branding fields (NEW)
    logo         = models.ImageField(upload_to='firm_logos/', null=True, blank=True)
    theme_color  = models.CharField(max_length=20, default='#0D1B2A')
    accent_color = models.CharField(max_length=20, default='#C9A84C')
    font_family  = models.CharField(max_length=100, default='DM Sans, sans-serif')
    sidebar_dark = models.BooleanField(default=True)

    # ✅ Website fields (NEW)
    tagline          = models.CharField(max_length=200, blank=True, default='')
    about_text       = models.TextField(blank=True, default='')
    practice_areas   = models.JSONField(default=list, blank=True)
    website_phone    = models.CharField(max_length=20, blank=True, default='')
    website_email    = models.EmailField(blank=True, default='')
    whatsapp_number  = models.CharField(max_length=20, blank=True, default='')
    bar_registration = models.CharField(max_length=100, blank=True, default='')
    gstin            = models.CharField(max_length=20, blank=True, default='')
    hero_image       = models.ImageField(upload_to='firm_hero/', null=True, blank=True)
    website_template = models.CharField(max_length=30, default='classic', blank=True)
    website_enabled  = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
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
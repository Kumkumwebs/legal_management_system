from django.db import models
# Create your models here.
from django.contrib.auth.models import User
from django.db import models
from legal_management_system.utils.base import BaseModel

class PlatformUser(BaseModel):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('support', 'Support'),
        ('sales', 'Sales'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
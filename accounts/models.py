from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.db import models
from firms.models import Firm
from legal_management_system.utils.base import BaseModel
from django.utils.crypto import get_random_string
from firms.models import Firm
class UserProfile(BaseModel):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('lawyer', 'Lawyer'),
        ('staff', 'Staff'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name="users")

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
class Invite(models.Model):
    TYPE_CHOICES = (('firm','Firm'), ('platform','Platform'))


    email = models.EmailField()
    invite_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    firm = models.ForeignKey(Firm, null=True, blank=True, on_delete=models.CASCADE)
    role = models.CharField(max_length=20)

    token = models.CharField(max_length=100, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self,*args,**kwargs):
        if not self.token:
            self.token = get_random_string(50)
        super().save(*args,**kwargs)
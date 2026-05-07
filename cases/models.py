from django.db import models
from django.contrib.auth.models import User
from firms.models import Firm
from clients.models import Client
from legal_management_system.utils.base import BaseModel


class Case(BaseModel):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('closed', 'Closed'),
    )

    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name="cases")

    title = models.CharField(max_length=255)
    case_number = models.CharField(max_length=100)

    case_type = models.CharField(max_length=50)
    court_name = models.CharField(max_length=255)

    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    next_hearing_date = models.DateField(null=True, blank=True)


class Hearing(models.Model):
    case = models.ForeignKey('Case', on_delete=models.CASCADE, related_name='hearings')

    title = models.CharField(max_length=255, default="Hearing")

    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    court_name = models.CharField(max_length=255, default="General Court")  # ✅ FIX
    judge_name = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # ✅ FIX: allow null temporarily to avoid migration error
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.title} - {self.date}"
from django.db import models
from firms.models import Firm
from cases.models import Case
from clients.models import Client
from legal_management_system.utils.base import BaseModel

class Payment(BaseModel):
    STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('pending', 'Pending'),
    )

    firm = models.ForeignKey(Firm, on_delete=models.CASCADE)

    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True)
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)

    payment_date = models.DateTimeField(auto_now_add=True)
    
    payment_method = models.CharField(
    max_length=50,
    choices=[
        ("cash", "Cash"),
        ("upi", "UPI"),
        ("bank_transfer", "Bank Transfer"),
        ("card", "Card"),
    ],
    default="cash"
)
from django.db import models
from firms.models import Firm
from legal_management_system.utils.base import BaseModel

class Client(BaseModel):
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE, related_name="clients")

    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=100, null=True, blank=True)

    id_proof = models.FileField(upload_to='client_docs/', null=True, blank=True)

    def __str__(self):
        return self.name
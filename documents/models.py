from django.db import models
from django.contrib.auth.models import User
from firms.models import Firm
from cases.models import Case
from legal_management_system.utils.base import BaseModel

class Document(BaseModel):
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name="documents")

    file = models.FileField(upload_to='documents/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
from django.db import models
from django.contrib.auth.models import User
from firms.models import Firm
from cases.models import Case
from legal_management_system.utils.base import BaseModel

class Message(BaseModel):
    firm = models.ForeignKey(Firm, on_delete=models.CASCADE)

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_messages")

    case = models.ForeignKey(Case, on_delete=models.CASCADE, null=True, blank=True)

    content = models.TextField()
    is_read = models.BooleanField(default=False)
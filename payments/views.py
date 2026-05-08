from django.conf import settings

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from legal_management_system.utils.views import FirmBaseViewSet
from .models import Payment
from .serializers import PaymentSerializer
from accounts.permissions import IsAdmin

# ✅ Import your existing email function directly
from email_service.tasks_email import send_client_invoice_email


class PaymentViewSet(FirmBaseViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAdmin]

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "userprofile"):
            serializer.save(firm=user.userprofile.firm)
        else:
            raise PermissionDenied("User has no firm assigned")

    # ─────────────────────────────────────────────────────────
    # 📧 SEND EMAIL INVOICE  →  POST /payments/{id}/notify-email/
    #
    # Calls your existing: send_client_invoice_email(
    #   client_email, client_name, payment, case_title, firm_name
    # )
    # ─────────────────────────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='notify-email')
    def notify_email(self, request, pk=None):
        payment = self.get_object()
        client  = payment.client

        if not client or not client.email:
            return Response(
                {"error": "Client has no email address on file."},
                status=400
            )

        firm_name = "HP HCMS"
        if hasattr(request.user, "userprofile") and request.user.userprofile.firm:
            firm_name = request.user.userprofile.firm.name

        case_title = payment.case.title if payment.case else "General"

        try:
            # ✅ Calls your existing branded template email
            send_client_invoice_email(
                client_email=client.email,
                client_name=client.name,
                payment=payment,
                case_title=case_title,
                firm_name=firm_name,
            )
            return Response({"message": f"Invoice emailed to {client.email}"})

        except Exception as e:
            return Response({"error": f"Failed to send email: {str(e)}"}, status=500)

    # ─────────────────────────────────────────────────────────
    # 💬 SEND WHATSAPP INVOICE  →  POST /payments/{id}/notify-whatsapp/
    #
    # Uses Twilio WhatsApp API.
    # Add to settings.py:
    #   TWILIO_ACCOUNT_SID   = 'ACxxxxxxxxxxxxxxxx'
    #   TWILIO_AUTH_TOKEN    = 'xxxxxxxxxxxxxxxx'
    #   TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886'
    # Then: pip install twilio
    # ─────────────────────────────────────────────────────────
    @action(detail=True, methods=['post'], url_path='notify-whatsapp')
    def notify_whatsapp(self, request, pk=None):
        payment = self.get_object()
        client  = payment.client

        if not client or not client.phone:
            return Response(
                {"error": "Client has no phone number on file."},
                status=400
            )

        # Normalize phone number — ensure country code
        phone = client.phone.strip().replace(" ", "").replace("-", "")
        if not phone.startswith("+"):
            phone = "+91" + phone   # Default to India

        firm_name = "HP HCMS"
        if hasattr(request.user, "userprofile") and request.user.userprofile.firm:
            firm_name = request.user.userprofile.firm.name

        invoice_number = f"INV-{payment.id:06d}"
        amount         = f"₹{payment.amount:,.2f}"
        date           = payment.created_at.strftime('%d %B %Y') if hasattr(payment.created_at, 'strftime') else str(payment.created_at)
        case_title     = payment.case.title if payment.case else "General"
        method         = (getattr(payment, 'payment_method', 'N/A') or 'N/A').replace("_", " ").title()
        status         = (payment.status or "pending").title()

        # WhatsApp message mirrors your invoice email template content
        message = (
            f"🏛️ *{firm_name}*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"*Payment Invoice*\n"
            f"━━━━━━━━━━━━━━━━━━\n\n"
            f"Dear *{client.name}*,\n\n"
            f"Please find your payment invoice for legal services rendered.\n\n"
            f"📋 *Invoice Details:*\n"
            f"• Invoice No.: *{invoice_number}*\n"
            f"• Client: {client.name}\n"
            f"• Case: {case_title}\n"
            f"• Date: {date}\n"
            f"• Method: {method}\n"
            f"• Status: ✅ {status}\n\n"
            f"💰 *Total Amount: {amount}*\n\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"This invoice was issued by *{firm_name}*.\n"
            f"For any queries, please contact your legal team."
        )

        try:
            from twilio.rest import Client as TwilioClient
            twilio_client = TwilioClient(
                settings.TWILIO_ACCOUNT_SID,
                settings.TWILIO_AUTH_TOKEN,
            )
            twilio_client.messages.create(
                body=message,
                from_=settings.TWILIO_WHATSAPP_FROM,
                to=f"whatsapp:{phone}",
            )
            return Response({"message": f"WhatsApp invoice sent to {phone}"})

        except ImportError:
            return Response(
                {"error": "Twilio not installed. Run: pip install twilio"},
                status=500
            )
        except AttributeError:
            return Response(
                {"error": "Twilio not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM to settings.py"},
                status=500
            )
        except Exception as e:
            return Response({"error": f"Failed to send WhatsApp: {str(e)}"}, status=500)
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from legal_management_system.utils.views import FirmBaseViewSet
from .models import Payment
from .serializers import PaymentSerializer
from accounts.permissions import IsAdmin


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
    # Uses your existing HTML template.
    # Template path: email_service/templates/emails/payment_invoice.html
    #   (or wherever your template lives — update the path below)
    #
    # Template context variables passed:
    #   - client_name
    #   - amount
    #   - payment_date
    #   - case_title
    #   - payment_method
    #   - status
    #   - notes
    #   - firm_name
    #   - firm_email
    #   - firm_phone
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

        # ── Firm info ──
        firm      = None
        firm_name = "HP HCMS"
        firm_email = settings.DEFAULT_FROM_EMAIL
        firm_phone = ""
        if hasattr(request.user, "userprofile") and request.user.userprofile.firm:
            firm       = request.user.userprofile.firm
            firm_name  = firm.name
            firm_email = firm.email or settings.DEFAULT_FROM_EMAIL
            firm_phone = getattr(firm, "phone", "")

        # ── Build context for your template ──
        context = {
            "client_name":     client.name,
            "amount":          f"₹{payment.amount}",
            "payment_date":    payment.payment_date.strftime('%d %B %Y') if payment.payment_date else "N/A",
            "case_title":      payment.case.title if payment.case else "General",
            "payment_method":  (payment.payment_method or "N/A").replace("_", " ").title(),
            "status":          (payment.status or "pending").title(),
            "notes":           payment.notes or "",
            "firm_name":       firm_name,
            "firm_email":      firm_email,
            "firm_phone":      firm_phone,
        }

        subject = f"Payment Invoice — {context['amount']} | {firm_name}"

        # ── Render HTML using your existing template ──
        # 🔧 UPDATE THIS PATH to match your actual template file location:
        #    e.g. "emails/payment_invoice.html"  if stored in email_service/templates/emails/
        #    e.g. "payment_invoice.html"         if stored in email_service/templates/
        try:
            html_content = render_to_string("emails/payment_invoice.html", context)
        except Exception:
            # Fallback: try alternate common template paths
            try:
                html_content = render_to_string("payment_invoice.html", context)
            except Exception as e:
                return Response(
                    {"error": f"Template not found. Check template path. Details: {str(e)}"},
                    status=500
                )

        # Plain-text fallback
        text_content = (
            f"Dear {context['client_name']},\n\n"
            f"Payment Details:\n"
            f"Amount: {context['amount']}\n"
            f"Date: {context['payment_date']}\n"
            f"Case: {context['case_title']}\n"
            f"Method: {context['payment_method']}\n"
            f"Status: {context['status']}\n"
            f"{'Notes: ' + context['notes'] if context['notes'] else ''}\n\n"
            f"Regards,\n{firm_name}"
        )

        try:
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[client.email],
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)

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

        # Normalize phone number
        phone = client.phone.strip().replace(" ", "").replace("-", "")
        if not phone.startswith("+"):
            phone = "+91" + phone   # Default to India country code

        firm_name = "HP HCMS"
        if hasattr(request.user, "userprofile") and request.user.userprofile.firm:
            firm_name = request.user.userprofile.firm.name

        amount     = f"₹{payment.amount}"
        date       = payment.payment_date.strftime('%d %b %Y') if payment.payment_date else "N/A"
        case_title = payment.case.title if payment.case else "General"
        method     = (payment.payment_method or "N/A").replace("_", " ").title()
        status     = (payment.status or "pending").title()

        message = (
            f"*Payment Invoice — {firm_name}*\n\n"
            f"Dear *{client.name}*,\n\n"
            f"Here are your payment details:\n"
            f"━━━━━━━━━━━━━━━━\n"
            f"📁 *Case:* {case_title}\n"
            f"💰 *Amount:* {amount}\n"
            f"📅 *Date:* {date}\n"
            f"💳 *Method:* {method}\n"
            f"📊 *Status:* {status}\n"
            f"━━━━━━━━━━━━━━━━\n"
            + (f"📝 *Notes:* {payment.notes}\n" if payment.notes else "")
            + f"\nFor any queries, contact us.\n\n— {firm_name}"
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
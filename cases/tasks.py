from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Hearing
from notifications.utils import send_notification
from email_service.tasks_email import send_new_hearing_email
from twilio.rest import Client as TwilioClient
 
@shared_task
def send_hearing_reminders():
    now      = timezone.now()
    tomorrow = now + timedelta(days=1)
 
    # Find hearings in the next 24–25 hours
    hearings = Hearing.objects.filter(
        date=tomorrow.date(),
    ).select_related('case', 'case__firm', 'case__client', 'case__assigned_to')
 
    for hearing in hearings:
        case      = hearing.case
        firm      = case.firm
        assigned  = case.assigned_to
 
        # ── Email alert to assigned lawyer ──
        if assigned:
            send_new_hearing_email(
                recipients=[assigned],
                hearing=hearing,
                case_title=case.title,
                assigned_by=firm.name,
            )
 
        # ── Push notification ──
        if assigned:
            send_notification(
                user=assigned,
                title=f"Hearing Tomorrow — {case.title}",
                body=f"{hearing.title} at {hearing.court_name} on {hearing.date}",
            )
 
        # ── WhatsApp to client (if phone exists) ──
        client = case.client
        if client and client.phone:
            _send_whatsapp_hearing_reminder(client, hearing, case)
 
 
def _send_whatsapp_hearing_reminder(client, hearing, case):
    from django.conf import settings
    phone = client.phone.strip().replace(' ', '').replace('-', '')
    if not phone.startswith('+'): phone = '+91' + phone
 
    message = (
        f"*Hearing Reminder — {case.firm.name}*\n\n"
        f"Dear *{client.name}*,\n\n"
        f"This is a reminder for your upcoming court hearing:\n"
        f"━━━━━━━━━━━━━━━━\n"
        f"📁 Case: {case.title} ({case.case_number})\n"
        f"🏛️ Court: {hearing.court_name}\n"
        f"📅 Date: {hearing.date.strftime('%d %B %Y')}\n"
        f"⏰ Time: {hearing.start_time.strftime('%I:%M %p') if hearing.start_time else 'TBD'}\n"
        f"━━━━━━━━━━━━━━━━\n"
        f"Please ensure you are present on time.\n"
        f"For any queries contact your legal team."
    )
 
    try:
        twilio = TwilioClient(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        twilio.messages.create(
            body=message,
            from_=settings.TWILIO_WHATSAPP_FROM,
            to=f'whatsapp:{phone}',
        )
    except Exception as e:
        print(f"WhatsApp hearing reminder failed: {e}")

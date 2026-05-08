"""
HP Highcourt Management System — Email Service
All transactional email templates rendered and sent via Django email backend.
"""

from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import threading


BRAND_COLOR = "#1a3c5e"
BRAND_ACCENT = "#c9a84c"
BRAND_NAME = "HP Highcourt Management System"
BRAND_SHORT = "HP HCMS"


# ─────────────────────────────────────────────────────
# BASE HTML EMAIL TEMPLATE
# ─────────────────────────────────────────────────────
def _base_email_html(content_html: str, preheader: str = "") -> str:
    """
    Wraps any content in the standard HP HCMS branded email shell.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>{BRAND_NAME}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <!-- Preheader hidden text -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:#F5F4F0;">{preheader}&nbsp;&#847;&nbsp;&#847;</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,{BRAND_COLOR} 0%,#0d2440 100%);
                     border-radius:16px 16px 0 0;padding:36px 48px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <div style="display:inline-flex;align-items:center;gap:12px;">
                    <div style="width:42px;height:42px;background:{BRAND_ACCENT};border-radius:10px;
                                display:inline-block;line-height:42px;text-align:center;font-size:22px;">⚖</div>
                    <div style="text-align:left;display:inline-block;vertical-align:middle;">
                      <div style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">HP HCMS</div>
                      <div style="font-size:10px;color:rgba(255,255,255,0.45);letter-spacing:0.12em;text-transform:uppercase;">Highcourt Management System</div>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr>
          <td style="background:#ffffff;padding:48px;border-left:1px solid #E8E6DF;border-right:1px solid #E8E6DF;">
            {content_html}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0d1b2e;border-radius:0 0 16px 16px;padding:28px 48px;text-align:center;">
            <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.35);">
              © 2025 {BRAND_NAME}. All rights reserved.
            </p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
              This email was sent because you are registered on the HP HCMS platform.
              If you believe this is an error, please contact support.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""


def _button(text: str, url: str, color: str = None) -> str:
    bg = color or BRAND_ACCENT
    return f"""
    <div style="text-align:center;margin:32px 0;">
      <a href="{url}" style="display:inline-block;background:{bg};color:#0d1b2e;
         font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;
         text-decoration:none;letter-spacing:0.02em;">{text}</a>
    </div>"""


def _divider() -> str:
    return '<div style="border-top:1px solid #F0EDE5;margin:28px 0;"></div>'


def _heading(text: str) -> str:
    return f'<h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:{BRAND_COLOR};line-height:1.2;">{text}</h1>'


def _subheading(text: str) -> str:
    return f'<p style="margin:0 0 24px;font-size:14px;color:#8B8B80;font-weight:500;">{text}</p>'


def _body(text: str) -> str:
    return f'<p style="margin:0 0 16px;font-size:15px;color:#3A3A35;line-height:1.7;">{text}</p>'


def _highlight_box(content: str) -> str:
    return f"""
    <div style="background:#F5F4F0;border-left:4px solid {BRAND_ACCENT};
                border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
      {content}
    </div>"""


def _info_row(label: str, value: str) -> str:
    return f"""
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #F0EDE5;
                 font-size:13px;color:#8B8B80;width:45%;vertical-align:top;">{label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #F0EDE5;
                 font-size:13px;color:{BRAND_COLOR};font-weight:600;vertical-align:top;">{value}</td>
    </tr>"""


# ─────────────────────────────────────────────────────
# SEND HELPER
# ─────────────────────────────────────────────────────
def _send_email(subject: str, html_body: str, to_emails: list, preheader: str = ""):
    """Send email in background thread."""
    full_html = _base_email_html(html_body, preheader)
    plain_text = strip_tags(html_body)

    def _send():
        try:
            msg = EmailMultiAlternatives(
                subject=f"[HP HCMS] {subject}",
                body=plain_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=to_emails,
            )
            msg.attach_alternative(full_html, "text/html")
            msg.send()
        except Exception as e:
            print(f"[EmailService] Failed to send '{subject}': {e}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


# ═══════════════════════════════════════════════════════
# 1. SIGNUP WELCOME EMAIL
# ═══════════════════════════════════════════════════════
def send_signup_welcome_email(user, firm_name: str):
    content = f"""
    {_heading(f"Welcome to HP HCMS, {user.first_name or user.username}!")}
    {_subheading("Your firm is now live on the Highcourt Management System")}
    {_body(f"We're delighted to have <strong>{firm_name}</strong> on board. Your account has been created and your firm workspace is ready to use.")}
    {_body("You can now manage clients, track cases, schedule hearings, handle payments, and collaborate with your legal team — all from one powerful dashboard.")}
    {_highlight_box(f"""
      <p style="margin:0 0 4px;font-size:12px;color:#8B8B80;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Your Firm</p>
      <p style="margin:0;font-size:16px;font-weight:700;color:{BRAND_COLOR};">{firm_name}</p>
    """)}
    {_button("Go to Dashboard", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + "/dashboard")}
    {_divider()}
    {_body("Need help getting started? Visit our documentation or contact our support team.")}
    """
    _send_email(
        subject="Welcome to HP Highcourt Management System",
        html_body=content,
        to_emails=[user.email],
        preheader=f"Welcome aboard, {user.first_name or user.username}! Your firm workspace is ready."
    )


# ═══════════════════════════════════════════════════════
# 2. INVITATION EMAIL
# ═══════════════════════════════════════════════════════
def send_invitation_email(invite_email: str, firm_name: str, role: str, invite_token: str):
    accept_url = f"{getattr(settings, "FRONTEND_URL", "http://localhost:5173")}/accept-invite?token={invite_token}"
    role_display = role.replace('_', ' ').title()
    content = f"""
    {_heading("You've Been Invited")}
    {_subheading(f"Join {firm_name} on HP HCMS as {role_display}")}
    {_body(f"You have been invited to join <strong>{firm_name}</strong> on the HP Highcourt Management System.")}
    {_body(f"Your role will be: <strong>{role_display}</strong>")}
    {_highlight_box(f"""
      <p style="margin:0 0 4px;font-size:12px;color:#8B8B80;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Invitation Details</p>
      <table style="width:100%;border-collapse:collapse;margin-top:8px;">
        <tr><td style="font-size:13px;color:#8B8B80;padding:4px 0;">Firm</td><td style="font-size:13px;font-weight:600;color:{BRAND_COLOR};">{firm_name}</td></tr>
        <tr><td style="font-size:13px;color:#8B8B80;padding:4px 0;">Role</td><td style="font-size:13px;font-weight:600;color:{BRAND_COLOR};">{role_display}</td></tr>
      </table>
    """)}
    {_body("Click the button below to accept your invitation and set up your account. This link expires in <strong>48 hours</strong>.")}
    {_button("Accept Invitation", accept_url)}
    {_divider()}
    {_body("If you didn't expect this invitation, you can safely ignore this email.")}
    """
    _send_email(
        subject=f"You're invited to join {firm_name} on HP HCMS",
        html_body=content,
        to_emails=[invite_email],
        preheader=f"Join {firm_name} as {role_display} on HP Highcourt Management System."
    )


# ═══════════════════════════════════════════════════════
# 3. FORGOT PASSWORD EMAIL
# ═══════════════════════════════════════════════════════
def send_forgot_password_email(user, reset_token: str):
    reset_url = f"{getattr(settings, "FRONTEND_URL", "http://localhost:5173")}/reset-password?token={reset_token}"
    content = f"""
    {_heading("Reset Your Password")}
    {_subheading("A password reset was requested for your account")}
    {_body(f"Hi {user.first_name or user.username}, we received a request to reset your HP HCMS password.")}
    {_body("Click the button below to set a new password. This link is valid for <strong>30 minutes</strong>.")}
    {_button("Reset My Password", reset_url, "#c0392b")}
    {_divider()}
    {_body("If you did not request a password reset, please ignore this email. Your password will remain unchanged.")}
    {_highlight_box(f'<p style="margin:0;font-size:13px;color:#8B8B80;">For security, never share this link with anyone. HP HCMS will never ask for your password.</p>')}
    """
    _send_email(
        subject="Password Reset Request",
        html_body=content,
        to_emails=[user.email],
        preheader="Reset your HP HCMS account password. Valid for 30 minutes."
    )


# ═══════════════════════════════════════════════════════
# 4. PLAN ACTIVATION EMAIL
# ═══════════════════════════════════════════════════════
def send_plan_activation_email(user, firm_name: str, plan_name: str, start_date, end_date, amount):
    content = f"""
    {_heading("Plan Activated Successfully")}
    {_subheading(f"{plan_name} is now active for {firm_name}")}
    {_body(f"Congratulations! Your subscription has been activated. Here are the details of your plan:")}
    {_highlight_box(f"""
      <table style="width:100%;border-collapse:collapse;">
        {_info_row("Plan", plan_name)}
        {_info_row("Firm", firm_name)}
        {_info_row("Start Date", str(start_date))}
        {_info_row("End Date", str(end_date))}
        {_info_row("Amount Paid", f"₹{amount:,.2f}")}
        {_info_row("Status", "✅ Active")}
      </table>
    """)}
    {_button("View My Plan", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + "/plans")}
    {_divider()}
    {_body("You now have full access to all features included in your plan. If you have questions, contact our support team.")}
    """
    _send_email(
        subject=f"Plan Activated — {plan_name}",
        html_body=content,
        to_emails=[user.email],
        preheader=f"Your {plan_name} plan is now active for {firm_name}."
    )


# ═══════════════════════════════════════════════════════
# 5. NEW HEARING NOTIFICATION (TEAM)
# ═══════════════════════════════════════════════════════
def send_new_hearing_email(recipients: list, hearing, case_title: str, assigned_by: str):
    """recipients: list of User objects"""
    hearing_date = hearing.date.strftime("%d %B %Y") if hasattr(hearing.date, 'strftime') else str(hearing.date)
    hearing_time = hearing.time.strftime("%I:%M %p") if hasattr(hearing, 'time') and hearing.time else "TBD"
    content = f"""
    {_heading("New Hearing Scheduled")}
    {_subheading(f"Case: {case_title}")}
    {_body(f"A new hearing has been scheduled. Please review the details and be prepared.")}
    {_highlight_box(f"""
      <table style="width:100%;border-collapse:collapse;">
        {_info_row("Case", case_title)}
        {_info_row("Date", hearing_date)}
        {_info_row("Time", hearing_time)}
        {_info_row("Court", getattr(hearing, 'court', 'To be confirmed'))}
        {_info_row("Assigned by", assigned_by)}
      </table>
    """)}
    {_button("View Hearing Details", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + f"/cases/{hearing.case_id}/hearings")}
    {_divider()}
    {_body("Please ensure all case files and documents are prepared before the hearing date.")}
    """
    emails = [u.email for u in recipients if u.email]
    if emails:
        _send_email(
            subject=f"Hearing Scheduled — {case_title} on {hearing_date}",
            html_body=content,
            to_emails=emails,
            preheader=f"Hearing on {hearing_date} for {case_title}."
        )


# ═══════════════════════════════════════════════════════
# 6. PLAN EXPIRING SOON
# ═══════════════════════════════════════════════════════
def send_plan_expiry_warning_email(user, firm_name: str, plan_name: str, expiry_date, days_left: int):
    content = f"""
    {_heading("Your Plan is Expiring Soon")}
    {_subheading(f"{days_left} days remaining on {plan_name}")}
    {_body(f"Hi {user.first_name or user.username}, your subscription for <strong>{firm_name}</strong> is expiring soon.")}
    {_highlight_box(f"""
      <table style="width:100%;border-collapse:collapse;">
        {_info_row("Plan", plan_name)}
        {_info_row("Firm", firm_name)}
        {_info_row("Expiry Date", str(expiry_date))}
        {_info_row("Days Remaining", f"⚠️ {days_left} days")}
      </table>
    """)}
    {_body("Renew your plan to avoid interruption of service. After expiry, access to your firm dashboard will be restricted.")}
    {_button("Renew My Plan", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + "/plans")}
    {_divider()}
    {_body("If you have already renewed, please ignore this reminder.")}
    """
    _send_email(
        subject=f"Action Required — Plan Expiring in {days_left} Days",
        html_body=content,
        to_emails=[user.email],
        preheader=f"Your {plan_name} for {firm_name} expires in {days_left} days. Renew now."
    )


# ═══════════════════════════════════════════════════════
# 7. INVOICE EMAIL — CLIENT (from Payments section)
# ═══════════════════════════════════════════════════════
def send_client_invoice_email(client_email: str, client_name: str, payment, case_title: str, firm_name: str):
    payment_date = payment.created_at.strftime("%d %B %Y") if hasattr(payment.created_at, 'strftime') else str(payment.created_at)
    invoice_number = f"INV-{payment.id:06d}"
    content = f"""
    {_heading("Payment Invoice")}
    {_subheading(f"Invoice from {firm_name}")}
    {_body(f"Dear {client_name}, please find your payment invoice for legal services rendered.")}
    {_highlight_box(f"""
      <table style="width:100%;border-collapse:collapse;">
        {_info_row("Invoice No.", invoice_number)}
        {_info_row("Client", client_name)}
        {_info_row("Case", case_title)}
        {_info_row("Date", payment_date)}
        {_info_row("Amount", f"₹{payment.amount:,.2f}")}
        {_info_row("Status", "✅ " + payment.status.title())}
        {_info_row("Method", getattr(payment, 'payment_method', 'N/A').title())}
      </table>
    """)}
    <div style="margin-top:24px;padding:16px;background:{BRAND_COLOR};border-radius:8px;text-align:center;">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);">Total Amount</p>
      <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#c9a84c;">₹{payment.amount:,.2f}</p>
    </div>
    {_button("Download Invoice", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + f"/payments/{payment.id}/invoice")}
    {_divider()}
    {_body(f"This invoice was issued by <strong>{firm_name}</strong>. For any queries, please contact your legal team.")}
    """
    _send_email(
        subject=f"Invoice {invoice_number} from {firm_name}",
        html_body=content,
        to_emails=[client_email],
        preheader=f"Your invoice from {firm_name} for ₹{payment.amount:,.2f}."
    )


# ═══════════════════════════════════════════════════════
# 8. INVOICE EMAIL — FIRM (for plan activation)
# ═══════════════════════════════════════════════════════
def send_firm_plan_invoice_email(admin_email: str, firm_name: str, plan_name: str, amount, payment_id, start_date, end_date):
    invoice_number = f"HCMS-{payment_id:06d}"
    content = f"""
    {_heading("Plan Subscription Invoice")}
    {_subheading(f"HP HCMS Platform Invoice for {firm_name}")}
    {_body("Thank you for subscribing to HP Highcourt Management System. Here is your official invoice.")}
    {_highlight_box(f"""
      <table style="width:100%;border-collapse:collapse;">
        {_info_row("Invoice No.", invoice_number)}
        {_info_row("Firm", firm_name)}
        {_info_row("Plan", plan_name)}
        {_info_row("Billing Period", f"{start_date} to {end_date}")}
        {_info_row("Amount", f"₹{amount:,.2f}")}
        {_info_row("GST", "Included")}
        {_info_row("Status", "✅ Paid")}
      </table>
    """)}
    <div style="margin-top:24px;padding:16px;background:{BRAND_COLOR};border-radius:8px;text-align:center;">
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.6);">Total Charged</p>
      <p style="margin:4px 0 0;font-size:28px;font-weight:700;color:#c9a84c;">₹{amount:,.2f}</p>
    </div>
    {_button("View My Subscription", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + "/plans")}
    {_divider()}
    {_body("This invoice is issued by HP Highcourt Management System Platform. Please retain it for your records.")}
    """
    _send_email(
        subject=f"Platform Invoice {invoice_number} — {plan_name}",
        html_body=content,
        to_emails=[admin_email],
        preheader=f"Your HP HCMS plan invoice for ₹{amount:,.2f}."
    )


# ═══════════════════════════════════════════════════════
# 9. SUPPORT TICKET CREATED
# ═══════════════════════════════════════════════════════
def send_ticket_created_email(ticket):
    user_email = ticket.created_by.email
    username = ticket.created_by.first_name or ticket.created_by.username
    content = f"""
    {_heading("Support Ticket Created")}
    {_subheading(f"Ticket #{ticket.ticket_number} has been received")}
    {_body(f"Hi {username}, we've received your support request and our team will respond shortly.")}
    {_highlight_box(f"""
      <table style="width:100%;border-collapse:collapse;">
        {_info_row("Ticket No.", ticket.ticket_number)}
        {_info_row("Subject", ticket.subject)}
        {_info_row("Category", ticket.get_category_display())}
        {_info_row("Priority", ticket.get_priority_display())}
        {_info_row("Status", "🟡 Open")}
      </table>
    """)}
    {_button("Track My Ticket", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + "/support")}
    {_divider()}
    {_body("Our support team typically responds within 24 hours. You will receive an email when your ticket is updated.")}
    """
    _send_email(
        subject=f"Ticket #{ticket.ticket_number} Received — {ticket.subject[:40]}",
        html_body=content,
        to_emails=[user_email],
        preheader=f"We got your ticket #{ticket.ticket_number}. We'll be in touch soon."
    )


# ═══════════════════════════════════════════════════════
# 10. SUPPORT TICKET RESOLVED
# ═══════════════════════════════════════════════════════
def send_ticket_resolved_email(ticket):
    user_email = ticket.created_by.email
    username = ticket.created_by.first_name or ticket.created_by.username
    content = f"""
    {_heading("Ticket Resolved")}
    {_subheading(f"Ticket #{ticket.ticket_number} has been resolved")}
    {_body(f"Hi {username}, great news! Your support ticket has been resolved.")}
    {_highlight_box(f"""
      <table style="width:100%;border-collapse:collapse;">
        {_info_row("Ticket No.", ticket.ticket_number)}
        {_info_row("Subject", ticket.subject)}
        {_info_row("Resolved On", ticket.resolved_at.strftime('%d %B %Y') if ticket.resolved_at else 'Today')}
        {_info_row("Status", "✅ Resolved")}
      </table>
    """)}
    {_body("If your issue has not been fully resolved or if you have further questions, please reply to this email or open a new ticket.")}
    {_button("View Ticket", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + "/support")}
    """
    _send_email(
        subject=f"Ticket #{ticket.ticket_number} Resolved",
        html_body=content,
        to_emails=[user_email],
        preheader=f"Your support ticket #{ticket.ticket_number} has been resolved."
    )


# ═══════════════════════════════════════════════════════
# 11. TASK ASSIGNMENT EMAIL
# ═══════════════════════════════════════════════════════
def send_task_assignment_email(task):
    if not task.assigned_to or not task.assigned_to.email:
        return
    username = task.assigned_to.first_name or task.assigned_to.username
    due = task.due_date.strftime("%d %B %Y") if task.due_date else "No due date"
    assigned_by = task.created_by.first_name or task.created_by.username
    content = f"""
    {_heading("New Task Assigned to You")}
    {_subheading(f"Task: {task.title}")}
    {_body(f"Hi {username}, a new task has been assigned to you by <strong>{assigned_by}</strong>.")}
    {_highlight_box(f"""
      <table style="width:100%;border-collapse:collapse;">
        {_info_row("Task", task.title)}
        {_info_row("Priority", task.get_priority_display())}
        {_info_row("Due Date", due)}
        {_info_row("Assigned By", assigned_by)}
        {_info_row("Status", task.get_status_display())}
        {_info_row("Case", task.case.title if task.case else "General")}
      </table>
    """)}
    {f'<div style="margin:20px 0;padding:16px;background:#FFF9E6;border-radius:8px;font-size:14px;color:#5A4A00;"><strong>Description:</strong><br>{task.description}</div>' if task.description else ''}
    {_button("View Task", getattr(settings, "FRONTEND_URL", "http://localhost:5173") + "/tasks")}
    {_divider()}
    {_body("Please log in to your dashboard to view full task details and update the status.")}
    """
    _send_email(
        subject=f"Task Assigned — {task.title}",
        html_body=content,
        to_emails=[task.assigned_to.email],
        preheader=f"You have a new task: {task.title}. Due: {due}."
    )
# accounts/password_reset_views.py
#
# ADD these two views to your accounts app.
# They plug into send_forgot_password_email() which already exists
# in email_service/tasks_email.py.
#
# ── Required: add PasswordResetToken model (see bottom of file) ──

import secrets
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .models import PasswordResetToken                    # model defined below
from email_service.tasks_email import send_forgot_password_email

User = get_user_model()


# ═══════════════════════════════════════════════════════
# POST /api/auth/forgot-password/
# Body: { "email": "user@example.com" }
# ═══════════════════════════════════════════════════════
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip().lower()

        if not email:
            return Response({"error": "Email is required."}, status=400)

        # Always return 200 even if email not found — prevents user enumeration
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"message": "If this email is registered, you will receive a reset link shortly."},
                status=200,
            )

        # Invalidate any existing unused tokens for this user
        PasswordResetToken.objects.filter(user=user, used=False).update(used=True)

        # Generate a secure token
        raw_token = secrets.token_urlsafe(48)

        # Save to DB with 30-min expiry
        PasswordResetToken.objects.create(
            user=user,
            token=raw_token,
            expires_at=timezone.now() + timedelta(minutes=30),
        )

        # Send email (uses your existing email service)
        send_forgot_password_email(user, raw_token)

        return Response(
            {"message": "If this email is registered, you will receive a reset link shortly."},
            status=200,
        )


# ═══════════════════════════════════════════════════════
# POST /api/auth/reset-password/
# Body: { "token": "<token>", "password": "<new_password>" }
# ═══════════════════════════════════════════════════════
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token    = request.data.get("token", "").strip()
        password = request.data.get("password", "").strip()

        if not token or not password:
            return Response({"error": "Token and new password are required."}, status=400)

        # Validate password length
        if len(password) < 8:
            return Response({"error": "Password must be at least 8 characters."}, status=400)

        # Look up the token
        try:
            reset_obj = PasswordResetToken.objects.select_related("user").get(
                token=token,
                used=False,
            )
        except PasswordResetToken.DoesNotExist:
            return Response({"error": "Invalid or expired reset link."}, status=400)

        # Check expiry
        if reset_obj.expires_at < timezone.now():
            reset_obj.used = True
            reset_obj.save(update_fields=["used"])
            return Response({"error": "This reset link has expired. Please request a new one."}, status=400)

        # Set new password
        user = reset_obj.user
        user.set_password(password)
        user.save(update_fields=["password"])

        # Mark token as used
        reset_obj.used = True
        reset_obj.save(update_fields=["used"])

        return Response({"message": "Password updated successfully."}, status=200)


# ═══════════════════════════════════════════════════════
# MODEL — add this to accounts/models.py
# ═══════════════════════════════════════════════════════

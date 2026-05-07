import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings

from .models import NotificationToken, Notification

# 🔐 Initialize once
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)


def send_notification(user, title, body):
    print("🚀 FUNCTION CALLED")

    tokens = list(
        NotificationToken.objects.filter(user=user)
        .values_list("token", flat=True)
    )
    print("TOKENS:", tokens)

    # ✅ Save to DB first
    Notification.objects.create(
        user=user,
        title=title,
        message=body
    )
    print("✅ Notification saved in DB")

    if not tokens:
        print("❌ No tokens found")
        return

    try:
        message = messaging.MulticastMessage(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            tokens=tokens,
        )

        # 🔥 For firebase-admin v7+
        response = messaging.send_each_for_multicast(message)

        print("✅ FCM success:", response.success_count)
        print("❌ FCM failed:", response.failure_count)

    except Exception as e:
        print("🔥 FCM ERROR:", e)
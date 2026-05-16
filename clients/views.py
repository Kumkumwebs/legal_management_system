# clients/views.py
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from legal_management_system.utils.views import FirmBaseViewSet
from .models import Client
from .serializers import ClientSerializer
from subscriptions.models import FirmSubscription


def _get_active_subscription(firm):
    """Return the active FirmSubscription for a firm, or None."""
    from django.utils import timezone
    sub = FirmSubscription.objects.filter(
        firm=firm,
        is_active=True,
    ).select_related('plan').first()

    if sub and sub.end_date and sub.end_date < timezone.now():
        sub.is_active = False
        sub.save(update_fields=['is_active'])
        return None

    return sub


class ClientViewSet(FirmBaseViewSet):
    serializer_class   = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_superuser:
            return Client.objects.all()

        if hasattr(user, 'userprofile') and user.userprofile.firm:
            return Client.objects.filter(firm=user.userprofile.firm)

        return Client.objects.none()

    # ── Plan-restricted create ──────────────────────────
    def perform_create(self, serializer):
        user = self.request.user

        if not hasattr(user, 'userprofile') or not user.userprofile.firm:
            raise ValidationError("User is not linked to a firm.")

        firm = user.userprofile.firm

        # Get active subscription and plan
        sub = _get_active_subscription(firm)

        if sub and sub.plan:
            max_clients = sub.plan.max_clients  # e.g. 10, 50, 0 = unlimited

            # 0 or None = unlimited
            if max_clients and max_clients > 0:
                current_count = Client.objects.filter(firm=firm).count()
                if current_count >= max_clients:
                    raise ValidationError(
                        f"Client limit reached. Your '{sub.plan.name}' plan allows "
                        f"{max_clients} client{'s' if max_clients != 1 else ''}. "
                        f"You currently have {current_count}. "
                        f"Please upgrade your plan to add more clients."
                    )

        serializer.save(firm=firm)

    # ── Usage stats endpoint ────────────────────────────
    # GET /api/clients/usage/
    @action(detail=False, methods=['get'], url_path='usage')
    def usage(self, request):
        user = request.user

        if not hasattr(user, 'userprofile') or not user.userprofile.firm:
            return Response({'error': 'No firm linked'}, status=400)

        firm = user.userprofile.firm
        current_count = Client.objects.filter(firm=firm).count()

        sub = _get_active_subscription(firm)

        if not sub or not sub.plan:
            return Response({
                'used':      current_count,
                'limit':     None,   # no plan → no limit enforced
                'plan_name': None,
                'unlimited': True,
            })

        max_clients = sub.plan.max_clients
        unlimited   = not max_clients or max_clients == 0

        return Response({
            'used':      current_count,
            'limit':     max_clients if not unlimited else None,
            'plan_name': sub.plan.name,
            'unlimited': unlimited,
            'percent':   round((current_count / max_clients) * 100) if not unlimited else 0,
        })
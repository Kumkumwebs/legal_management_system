from django.utils import timezone
from datetime import timedelta

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import SubscriptionPlan, FirmSubscription
from .serializers import SubscriptionPlanSerializer, FirmSubscriptionSerializer


# =========================================================
# ✅ Subscription Plan ViewSet
# =========================================================
class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [IsAuthenticated]

    # 🔒 Only super admin can create/update/delete
    def _check_super_admin(self):
        if not self.request.user.is_superuser:
            raise PermissionDenied("Only super admin can manage plans")

    def perform_create(self, serializer):
        self._check_super_admin()
        serializer.save()

    def perform_update(self, serializer):
        self._check_super_admin()
        serializer.save()

    def perform_destroy(self, instance):
        self._check_super_admin()
        instance.delete()

    # 🔥 IMPORTANT: force correct serializer always
    def get_serializer_class(self):
        return SubscriptionPlanSerializer


    # =====================================================
    # 🔥 SUBSCRIBE (SEPARATE FROM PLAN CREATION)
    # =====================================================
    @action(detail=True, methods=["post"])
    def subscribe(self, request, pk=None):
        plan = self.get_object()

        # 🔐 Ensure user has firm
        if not hasattr(request.user, "userprofile") or not request.user.userprofile.firm:
            return Response({"error": "User not linked to a firm"}, status=400)

        firm = request.user.userprofile.firm
        billing = request.data.get("billing", "monthly")

        end_date = timezone.now() + (
            timedelta(days=30) if billing == "monthly" else timedelta(days=365)
        )

        # deactivate old plan
        FirmSubscription.objects.filter(
            firm=firm,
            is_active=True
        ).update(is_active=False)

        # create new subscription
        subscription = FirmSubscription.objects.create(
            firm=firm,
            plan=plan,
            billing_cycle=billing,
            start_date=timezone.now(),
            end_date=end_date,
            is_active=True,
        )

        return Response({
            "message": "Plan activated",
            "plan": subscription.plan.name
        }, status=status.HTTP_200_OK)


# =========================================================
# ✅ Firm Subscription ViewSet
# =========================================================
class FirmSubscriptionViewSet(viewsets.ModelViewSet):
    queryset = FirmSubscription.objects.all()
    serializer_class = FirmSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, "userprofile"):
            return FirmSubscription.objects.none()

        return FirmSubscription.objects.filter(
            firm=self.request.user.userprofile.firm
        )

    # 🔥 Active Plan API
    @action(detail=False, methods=["get"])
    def active(self, request):
        if not hasattr(request.user, "userprofile"):
            return Response({"message": "No firm"}, status=400)

        firm = request.user.userprofile.firm

        sub = FirmSubscription.objects.filter(
            firm=firm,
            is_active=True
        ).first()

        if sub:
            return Response({
                "plan": sub.plan.id,
                "plan_name": sub.plan.name
            })

        return Response({"message": "No active plan"}, status=404)
import razorpay
import hmac, hashlib
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SubscriptionPlan, FirmSubscription, RazorpayOrder
 
GST_RATE = 0.18   # 18%
 
client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
 
 
class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        plan_id = request.data.get('plan_id')
        billing = request.data.get('billing', 'monthly')  # monthly | yearly
 
        plan = SubscriptionPlan.objects.get(id=plan_id)
        base_price = float(plan.monthly_price if billing == 'monthly' else plan.yearly_price)
        gst_amount = round(base_price * GST_RATE, 2)
        total      = round(base_price + gst_amount, 2)
        amount_paise = int(total * 100)   # Razorpay uses paise
 
        order = client.order.create({
            'amount':   amount_paise,
            'currency': 'INR',
            'receipt':  f'rcpt_{plan_id}_{request.user.id}',
            'notes': {
                'plan_id':   str(plan_id),
                'billing':   billing,
                'user_id':   str(request.user.id),
                'base':      str(base_price),
                'gst':       str(gst_amount),
            }
        })
 
               # Save order reference
        RazorpayOrder.objects.create(
            user=request.user,
            plan=plan,
            razorpay_order_id=order['id'],
            amount=total,
            gst_amount=gst_amount,
            billing_cycle=billing,
            status='created',
        )
 
        return Response({
            'order_id':   order['id'],
            'amount':     amount_paise,
            'currency':   'INR',
            'key_id':     settings.RAZORPAY_KEY_ID,
            'plan_name':  plan.name,
            'base_price': base_price,
            'gst_amount': gst_amount,
            'total':      total,
        })
 
 
class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]
 
    def post(self, request):
        razorpay_order_id   = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature  = request.data.get('razorpay_signature')
 
        # Verify signature
        msg    = f'{razorpay_order_id}|{razorpay_payment_id}'
        secret = settings.RAZORPAY_KEY_SECRET.encode()
        digest = hmac.new(secret, msg.encode(), hashlib.sha256).hexdigest()
 
        if digest != razorpay_signature:
            return Response({'error': 'Invalid payment signature'}, status=400)
 
        # Update order
        order_obj = RazorpayOrder.objects.get(razorpay_order_id=razorpay_order_id)
        order_obj.razorpay_payment_id = razorpay_payment_id
        order_obj.status = 'paid'
        order_obj.save()
 
        # Activate subscription
        firm = request.user.userprofile.firm
        billing = order_obj.billing_cycle
 
        FirmSubscription.objects.filter(firm=firm, is_active=True).update(is_active=False)
 
        end_date = timezone.now() + (
            timedelta(days=30) if billing == 'monthly' else timedelta(days=365)
        )
 
        FirmSubscription.objects.create(
            firm=firm,
            plan=order_obj.plan,
            billing_cycle=billing,
            start_date=timezone.now(),
            end_date=end_date,
            is_active=True,
            razorpay_payment_id=razorpay_payment_id,
        )
 
        # Send confirmation email
        from email_service.tasks_email import send_plan_activated_email
        send_plan_activated_email(request.user, firm.name, order_obj.plan.name)
 
        return Response({
            'message':  'Subscription activated',
            'plan':     order_obj.plan.name,
            'end_date': end_date,
        })

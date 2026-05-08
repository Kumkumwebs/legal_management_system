import { useState } from 'react';
import {
  Box, Button, Typography, CircularProgress,
  Dialog, DialogContent, Divider,
} from '@mui/material';
import {
  PaymentRounded, CheckCircleRounded, ReceiptRounded,
} from '@mui/icons-material';
import api from '../api/client';
 
// Load Razorpay SDK
const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);
  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload  = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});
 
export function RazorpayCheckout({ plan, billing, onSuccess, onCancel }) {
  const [loading,      setLoading]      = useState(false);
  const [invoice,      setInvoice]      = useState(null);
  const [showInvoice,  setShowInvoice]  = useState(false);
 
  const basePrice = billing === 'monthly' ? plan.monthly_price : plan.yearly_price;
  const gst       = Math.round(basePrice * 0.18 * 100) / 100;
  const total     = Math.round((basePrice + gst) * 100) / 100;
 
  const handlePay = async () => {
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { alert('Razorpay SDK failed to load.'); return; }
 
      // Create order on backend
      const { data: order } = await api.post('/subscriptions/create-order/', {
        plan_id: plan.id,
        billing,
      });
 
      const user = JSON.parse(localStorage.getItem('user') || '{}');
 
      const options = {
        key:         order.key_id,
        amount:      order.amount,
        currency:    'INR',
        name:        'HP HCMS',
        description: `${plan.name} — ${billing === 'monthly' ? 'Monthly' : 'Annual'} Plan`,
        image:       '/logo.png',
        order_id:    order.order_id,
        prefill: {
          name:  user.first_name || user.username,
          email: user.email,
        },
        theme: { color: '#0D1B2A' },
        handler: async (response) => {
          try {
            const { data } = await api.post('/subscriptions/verify-payment/', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            setInvoice({ ...order, payment_id: response.razorpay_payment_id, plan_name: plan.name, billing });
            setShowInvoice(true);
            onSuccess?.(data);
          } catch {
            alert('Payment verification failed. Contact support.');
          }
        },
        modal: { ondismiss: () => onCancel?.() },
      };
 
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <>
      {/* Price breakdown card */}
      <Box sx={{ bgcolor: '#F8F7F4', borderRadius: '12px', p: 2.5, mb: 2, border: '1px solid #E8E4DC' }}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
          Price Breakdown
        </Typography>
        {[
          { label: `${plan.name} (${billing})`, value: `₹${basePrice}` },
          { label: 'GST (18%)',                  value: `₹${gst}` },
        ].map(row => (
          <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography sx={{ fontSize: 13, color: '#64748B' }}>{row.label}</Typography>
            <Typography sx={{ fontSize: 13, color: '#0D1B2A', fontWeight: 600 }}>{row.value}</Typography>
          </Box>
        ))}
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0D1B2A' }}>Total</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0D1B2A' }}>₹{total}</Typography>
        </Box>
      </Box>
 
      <Button fullWidth onClick={handlePay} disabled={loading}
        startIcon={loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <PaymentRounded />}
        sx={{
          bgcolor: '#0D1B2A', color: '#fff', borderRadius: '12px', py: 1.5,
          fontWeight: 800, textTransform: 'none', fontSize: 15,
          boxShadow: '0 4px 20px rgba(13,27,42,0.25)',
          '&:hover': { bgcolor: '#1B3050' },
        }}>
        {loading ? 'Processing…' : `Pay ₹${total} via Razorpay`}
      </Button>
      <Typography sx={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', mt: 1 }}>
        🔒 Secured by Razorpay · UPI, Cards, NetBanking accepted
      </Typography>
 
      {/* Payment Success Invoice Dialog */}
      {invoice && (
        <Dialog open={showInvoice} onClose={() => { setShowInvoice(false); }} maxWidth="xs" fullWidth
          PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
          <Box sx={{ bgcolor: '#0D1B2A', px: 3, py: 3, textAlign: 'center' }}>
            <CheckCircleRounded sx={{ fontSize: 44, color: '#34D399', mb: 1 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>Payment Successful!</Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mt: 0.5 }}>
              {invoice.plan_name} plan activated
            </Typography>
          </Box>
          <DialogContent sx={{ p: 3 }}>
            {[
              { label: 'Payment ID',  value: invoice.payment_id?.slice(-12) },
              { label: 'Plan',        value: invoice.plan_name },
              { label: 'Billing',     value: invoice.billing === 'monthly' ? 'Monthly' : 'Annual' },
              { label: 'Base Amount', value: `₹${invoice.base_price}` },
              { label: 'GST (18%)',   value: `₹${invoice.gst_amount}` },
              { label: 'Total Paid',  value: `₹${invoice.total}` },
            ].map(row => (
              <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.8, borderBottom: '1px solid #F5F4F0' }}>
                <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>{row.label}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0D1B2A' }}>{row.value}</Typography>
              </Box>
            ))}
            <Typography sx={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center', mt: 2 }}>
              A tax invoice has been emailed to your registered address
            </Typography>
            <Button fullWidth onClick={() => setShowInvoice(false)}
              sx={{ mt: 2, bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
              Continue
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
 























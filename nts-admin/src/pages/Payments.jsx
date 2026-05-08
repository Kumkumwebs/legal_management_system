import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogContent, DialogActions,
  IconButton, MenuItem, CircularProgress, Typography, TextField,
  Tooltip, Snackbar, Alert, Menu,
} from '@mui/material';
import {
  AddRounded, CloseRounded, EditRounded, DeleteRounded,
  WhatsApp, EmailRounded, MoreVertRounded, ReceiptRounded,
  AccountBalanceWalletRounded, WarningAmberRounded,
  CheckCircleRounded, HourglassTopRounded,
} from '@mui/icons-material';
import { paymentsAPI, casesAPI, clientsAPI } from '../api/services';
import api from '../api/client';   // ✅ needed for notify endpoints

const EMPTY_FORM = {
  client: '', case: '', amount: '', payment_date: '',
  payment_method: 'cash', status: 'pending', notes: ''
};

const METHOD_LABELS = { cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank Transfer', cheque: 'Cheque' };

const STATUS_CONFIG = {
  paid:    { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', label: 'Paid',    icon: CheckCircleRounded },
  pending: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', label: 'Pending', icon: HourglassTopRounded },
  overdue: { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', label: 'Overdue', icon: WarningAmberRounded },
  partial: { color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', label: 'Partial',  icon: AccountBalanceWalletRounded },
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#F8F7F4',
    '& fieldset': { borderColor: '#E8E4DC' },
    '&:hover fieldset': { borderColor: '#C9A84C' },
    '&.Mui-focused fieldset': { borderColor: '#0D1B2A', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0D1B2A' },
};

// ── Status Badge ──
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <Icon sx={{ fontSize: 11, color: cfg.color }} />
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
    </Box>
  );
};

// ── Action Menu with per-button loading ──
const ActionMenu = ({ payment, onEdit, onDelete, onNotifyEmail, onNotifyWhatsApp, sendingEmail, sendingWA }) => {
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>

        {/* ✅ WhatsApp — calls backend POST /payments/{id}/notify-whatsapp/ */}
        <Tooltip title={
          sendingWA
            ? 'Sending…'
            : payment.client_phone
              ? `Send invoice to ${payment.client_phone}`
              : 'No phone number on file for this client'
        }>
          <span>
            <IconButton
              size="small"
              disabled={sendingWA}
              onClick={() => onNotifyWhatsApp(payment)}
              sx={{
                color: '#25D366',
                bgcolor: '#F0FDF4',
                borderRadius: '8px', width: 30, height: 30,
                '&:hover': { bgcolor: '#D1FAE5', transform: 'scale(1.08)' },
                '&:disabled': { bgcolor: '#F8FAFC', color: '#CBD5E1' },
                transition: 'all 0.15s',
              }}
            >
              {sendingWA
                ? <CircularProgress size={13} sx={{ color: '#25D366' }} />
                : <WhatsApp sx={{ fontSize: 15 }} />
              }
            </IconButton>
          </span>
        </Tooltip>

        {/* ✅ Email — calls backend POST /payments/{id}/notify-email/ */}
        <Tooltip title={
          sendingEmail
            ? 'Sending…'
            : payment.client_email
              ? `Send invoice to ${payment.client_email}`
              : 'No email address on file for this client'
        }>
          <span>
            <IconButton
              size="small"
              disabled={sendingEmail}
              onClick={() => onNotifyEmail(payment)}
              sx={{
                color: '#3B82F6',
                bgcolor: '#EFF6FF',
                borderRadius: '8px', width: 30, height: 30,
                '&:hover': { bgcolor: '#DBEAFE', transform: 'scale(1.08)' },
                '&:disabled': { bgcolor: '#F8FAFC', color: '#CBD5E1' },
                transition: 'all 0.15s',
              }}
            >
              {sendingEmail
                ? <CircularProgress size={13} sx={{ color: '#3B82F6' }} />
                : <EmailRounded sx={{ fontSize: 15 }} />
              }
            </IconButton>
          </span>
        </Tooltip>

        {/* More (edit / delete) */}
        <Tooltip title="More actions">
          <IconButton size="small" onClick={e => setAnchor(e.currentTarget)}
            sx={{ color: '#64748B', bgcolor: '#F8F7F4', borderRadius: '8px', width: 30, height: 30, '&:hover': { bgcolor: '#F1F5F9' }, transition: 'all 0.15s' }}>
            <MoreVertRounded sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #F0EDE5', minWidth: 150 } }}>
        <MenuItem onClick={() => { onEdit(payment); setAnchor(null); }}
          sx={{ gap: 1.5, fontSize: 13, fontWeight: 600, color: '#0D1B2A', py: 1.2, '&:hover': { bgcolor: '#F8F7F4' } }}>
          <EditRounded sx={{ fontSize: 16, color: '#64748B' }} /> Edit Payment
        </MenuItem>
        <MenuItem onClick={() => { onDelete(payment); setAnchor(null); }}
          sx={{ gap: 1.5, fontSize: 13, fontWeight: 600, color: '#EF4444', py: 1.2, '&:hover': { bgcolor: '#FEF2F2' } }}>
          <DeleteRounded sx={{ fontSize: 16 }} /> Delete
        </MenuItem>
      </Menu>
    </>
  );
};

export default function PaymentsPage() {
  const [payments,        setPayments]        = useState([]);
  const [cases,           setCases]           = useState([]);
  const [clients,         setClients]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [dialog,          setDialog]          = useState(false);
  const [form,            setForm]            = useState(EMPTY_FORM);
  const [saving,          setSaving]          = useState(false);
  const [editingId,       setEditingId]       = useState(null);
  const [deleteDialog,    setDeleteDialog]    = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [deleting,        setDeleting]        = useState(false);
  const [snack,           setSnack]           = useState({ open: false, msg: '', severity: 'success' });

  // ✅ Per-row sending state — tracks which payment is being notified
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [sendingWAId,    setSendingWAId]    = useState(null);

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, caseRes, clientRes] = await Promise.allSettled([
        paymentsAPI.getAll(),
        casesAPI.getAll(),
        clientsAPI.getAll(),
      ]);
      if (payRes.status    === 'fulfilled') setPayments(payRes.value.data?.results    ?? payRes.value.data    ?? []);
      if (caseRes.status   === 'fulfilled') setCases(caseRes.value.data?.results      ?? caseRes.value.data   ?? []);
      if (clientRes.status === 'fulfilled') setClients(clientRes.value.data?.results  ?? clientRes.value.data ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange      = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleOpenCreate  = ()  => { setEditingId(null); setForm(EMPTY_FORM); setDialog(true); };
  const handleOpenEdit    = (p) => {
    setEditingId(p.id);
    setForm({ client: p.client ?? '', case: p.case ?? '', amount: p.amount ?? '', payment_date: p.payment_date ?? '', payment_method: p.payment_method || 'cash', status: p.status ?? 'pending', notes: p.notes ?? '' });
    setDialog(true);
  };
  const handleCloseDialog = () => { setDialog(false); setEditingId(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, payment_method: form.payment_method || 'cash' };
      editingId ? await paymentsAPI.update(editingId, payload) : await paymentsAPI.create(payload);
      await fetchData();
      handleCloseDialog();
      notify(editingId ? 'Payment updated' : 'Payment added');
    } catch (e) { notify('Failed to save payment', 'error'); console.error(e); }
    finally { setSaving(false); }
  };

  const handleOpenDelete    = (p) => { setDeletingPayment(p); setDeleteDialog(true); };
  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;
    setDeleting(true);
    try {
      await paymentsAPI.delete(deletingPayment.id);
      await fetchData();
      setDeleteDialog(false);
      setDeletingPayment(null);
      notify('Payment deleted');
    } catch { notify('Failed to delete', 'error'); }
    finally { setDeleting(false); }
  };

  // ✅ FIXED: Send email via backend — uses your existing email template
  // Calls: POST /api/payments/{id}/notify-email/
  // Backend: send_client_invoice_email() from email_service/tasks_email.py
  const handleNotifyEmail = async (payment) => {
    setSendingEmailId(payment.id);
    try {
      await api.post(`/payments/${payment.id}/notify-email/`);
      notify(`✅ Invoice sent to ${payment.client_email || 'client'}`, 'success');
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.detail || 'Failed to send email';
      notify(msg, 'error');
    } finally {
      setSendingEmailId(null);
    }
  };

  // ✅ FIXED: Send WhatsApp via backend — uses Twilio
  // Calls: POST /api/payments/{id}/notify-whatsapp/
  const handleNotifyWhatsApp = async (payment) => {
    setSendingWAId(payment.id);
    try {
      await api.post(`/payments/${payment.id}/notify-whatsapp/`);
      notify(`✅ WhatsApp invoice sent to ${payment.client_phone || 'client'}`, 'success');
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.detail || 'Failed to send WhatsApp';
      notify(msg, 'error');
    } finally {
      setSendingWAId(null);
    }
  };

  // ── Stats ──
  const totalPaid    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status !== 'paid').reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const filteredCases = cases.filter(c => String(c.client) === String(form.client));

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>

      {/* ══ HERO HEADER ══ */}
      <Box sx={{
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3050 60%, #0D1B2A 100%)',
        p: { xs: 3, md: 4 }, mb: 3, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.12)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: -15, right: -15, width: 110, height: 110, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.08)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: 100, width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'rgba(201,168,76,0.15)', borderRadius: '9px', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ReceiptRounded sx={{ color: '#C9A84C', fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase' }}>
                HP HCMS · Payments
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#fff', lineHeight: 1.15, mb: 0.5 }}>
              Payment Records
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
              {payments.length} payment record{payments.length !== 1 ? 's' : ''} · Track, notify and manage billing
            </Typography>
          </Box>
          <Button startIcon={<AddRounded />} onClick={handleOpenCreate} sx={{
            bgcolor: '#C9A84C', color: '#0D1B2A', borderRadius: '12px', px: 3, py: 1.4,
            fontWeight: 800, textTransform: 'none', fontSize: 14,
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
            '&:hover': { bgcolor: '#DFC070', transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(201,168,76,0.5)' },
            transition: 'all 0.2s',
          }}>
            Add Payment
          </Button>
        </Box>

        {/* Stats inside header */}
        <Box sx={{ display: 'flex', gap: 4, mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Revenue',  value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#fff' },
            { label: 'Total Received', value: `₹${totalPaid.toLocaleString('en-IN')}`,    color: '#34D399' },
            { label: 'Pending Amount', value: `₹${totalPending.toLocaleString('en-IN')}`, color: '#FCD34D' },
            { label: 'Records',        value: payments.length,                             color: '#93C5FD' },
          ].map(s => (
            <Box key={s.label}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, mt: 0.3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ PAYMENTS TABLE ══ */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* Table header bar */}
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F5F4F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, color: '#0D1B2A', fontSize: 14 }}>All Payments</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <WhatsApp sx={{ fontSize: 14, color: '#25D366' }} />
              <EmailRounded sx={{ fontSize: 14, color: '#3B82F6' }} />
            </Box>
            <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>Send invoice directly to client</Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <CircularProgress sx={{ color: '#0D1B2A' }} size={28} />
          </Box>
        ) : payments.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: '#F5F4F0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <ReceiptRounded sx={{ fontSize: 30, color: '#D0CEC7' }} />
            </Box>
            <Typography sx={{ color: '#0D1B2A', fontSize: 15, fontWeight: 600, mb: 0.5 }}>No payments yet</Typography>
            <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 3 }}>Add your first payment record to get started</Typography>
            <Button onClick={handleOpenCreate} startIcon={<AddRounded />}
              sx={{ bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', px: 3, textTransform: 'none', fontWeight: 700 }}>
              Add Payment
            </Button>
          </Box>
        ) : (
          <>
            {/* Column headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1.2fr 1.3fr 1.5fr', gap: 2, px: 3, py: 1.5, bgcolor: '#FAFAF8', borderBottom: '1px solid #F0EDE5' }}>
              {['Client', 'Case', 'Amount', 'Method', 'Date', 'Status', 'Notify & Actions'].map(h => (
                <Typography key={h} sx={{ fontSize: 10, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</Typography>
              ))}
            </Box>

            {/* Rows */}
            {payments.map((p, idx) => (
              <Box key={p.id} sx={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1.2fr 1.3fr 1.5fr',
                gap: 2, px: 3, py: 2.5, alignItems: 'center',
                borderBottom: idx === payments.length - 1 ? 'none' : '1px solid #F5F4F0',
                transition: 'background 0.12s',
                '&:hover': { bgcolor: '#FAFAF8' },
              }}>
                {/* Client */}
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.client_name || '—'}
                  </Typography>
                  {/* Show email/phone hint under name */}
                  {(p.client_email || p.client_phone) && (
                    <Typography sx={{ fontSize: 10, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.client_email || p.client_phone}
                    </Typography>
                  )}
                </Box>

                {/* Case */}
                <Typography sx={{ fontSize: 12, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.case_title || '—'}
                </Typography>

                {/* Amount */}
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0D1B2A' }}>
                  ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                </Typography>

                {/* Method */}
                <Box sx={{ px: 1.5, py: 0.4, borderRadius: '8px', bgcolor: '#F5F4F0', display: 'inline-flex', width: 'fit-content' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'capitalize' }}>
                    {METHOD_LABELS[p.payment_method] || p.payment_method || '—'}
                  </Typography>
                </Box>

                {/* Date */}
                <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                  {p.payment_date ? new Date(p.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </Typography>

                {/* Status */}
                <StatusBadge status={p.status} />

                {/* ✅ Actions — now passes correct notify handlers */}
                <ActionMenu
                  payment={p}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onNotifyEmail={handleNotifyEmail}
                  onNotifyWhatsApp={handleNotifyWhatsApp}
                  sendingEmail={sendingEmailId === p.id}
                  sendingWA={sendingWAId === p.id}
                />
              </Box>
            ))}
          </>
        )}
      </Box>

      {/* ══ CREATE / EDIT DIALOG ══ */}
      <Dialog open={dialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#0D1B2A', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>
              {editingId ? 'Edit Payment' : 'Add New Payment'}
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mt: 0.2 }}>
              {editingId ? 'Update the payment details below' : 'Fill in the payment details'}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
            <CloseRounded />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField select fullWidth label="Client" name="client" value={form.client} onChange={handleChange} sx={inputSx}>
              {clients.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Case" name="case" value={form.case} onChange={handleChange} sx={inputSx}>
              <MenuItem value=""><em>None</em></MenuItem>
              {filteredCases.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Amount (₹)" name="amount" value={form.amount} onChange={handleChange} type="number" sx={inputSx} />
            <TextField fullWidth label="Payment Date" type="date" name="payment_date" value={form.payment_date} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={inputSx} />
            <TextField select fullWidth label="Payment Method" name="payment_method" value={form.payment_method} onChange={handleChange} sx={inputSx}>
              <MenuItem value="cash">💵 Cash</MenuItem>
              <MenuItem value="upi">📱 UPI</MenuItem>
              <MenuItem value="bank_transfer">🏦 Bank Transfer</MenuItem>
              <MenuItem value="cheque">📄 Cheque</MenuItem>
            </TextField>
            <TextField select fullWidth label="Status" name="status" value={form.status} onChange={handleChange} sx={inputSx}>
              <MenuItem value="paid">✅ Paid</MenuItem>
              <MenuItem value="pending">⏳ Pending</MenuItem>
              <MenuItem value="partial">🔵 Partial</MenuItem>
              <MenuItem value="overdue">🔴 Overdue</MenuItem>
            </TextField>
          </Box>
          <TextField fullWidth label="Notes (optional)" name="notes" value={form.notes} onChange={handleChange} multiline rows={2} sx={inputSx} />

          {/* Hint */}
          <Box sx={{ bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <WhatsApp sx={{ color: '#25D366', fontSize: 18, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: '#065F46' }}>
              After saving, use the <strong>📧 Email</strong> or <strong>💬 WhatsApp</strong> buttons in the table to send the invoice directly to the client.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', color: '#9CA3AF', fontWeight: 600, borderRadius: '10px' }}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving} sx={{
            bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', px: 3.5,
            borderRadius: '10px', fontWeight: 700,
            '&:hover': { bgcolor: '#1B3050' },
            '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
          }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : editingId ? 'Update Payment' : 'Save Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ DELETE CONFIRM ══ */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#FEF2F2', px: 3, py: 2.5, borderBottom: '1px solid #FECACA' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteRounded sx={{ fontSize: 18, color: '#EF4444' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#991B1B' }}>Delete Payment</Typography>
              <Typography sx={{ fontSize: 12, color: '#EF4444' }}>This action cannot be undone</Typography>
            </Box>
          </Box>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: 13, color: '#3A3A35', lineHeight: 1.6 }}>
            Are you sure you want to delete the payment
            {deletingPayment?.client_name ? <strong> for {deletingPayment.client_name}</strong> : ''}
            {deletingPayment?.amount ? <> of <strong>₹{Number(deletingPayment.amount).toLocaleString('en-IN')}</strong></> : ''}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteDialog(false)} disabled={deleting}
            sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600, borderRadius: '10px' }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} disabled={deleting}
            sx={{ bgcolor: '#EF4444', color: '#fff', textTransform: 'none', px: 3, borderRadius: '10px', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>
            {deleting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, CircularProgress, Snackbar, Alert, Avatar
} from '@mui/material';
import {
  WhatsApp, EmailRounded, SupportAgentRounded, AddRounded,
  CloseRounded, SendRounded, CheckCircleRounded, ArrowForwardRounded,
  HeadsetMicRounded, AccessTimeRounded, FiberManualRecordRounded
} from '@mui/icons-material';
import api from '../api/client';
import PageHero from '../components/PageHero';

const STATUS = {
  open:        { color: '#F59E0B', bg: '#FFFBEB', label: 'Open' },
  in_progress: { color: '#3B82F6', bg: '#EFF6FF', label: 'In Progress' },
  resolved:    { color: '#10B981', bg: '#ECFDF5', label: 'Resolved' },
  closed:      { color: '#9CA3AF', bg: '#F9FAFB', label: 'Closed' },
};
const PRIORITY = {
  low:      { color: '#10B981', label: 'Low' },
  normal:   { color: '#3B82F6', label: 'Normal' },
  high:     { color: '#F97316', label: 'High' },
  critical: { color: '#EF4444', label: 'Critical' },
};
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', backgroundColor: '#F8F7F4',
    '& fieldset': { borderColor: '#E8E4DC' },
    '&:hover fieldset': { borderColor: '#C9A84C' },
    '&.Mui-focused fieldset': { borderColor: '#0D1B2A', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0D1B2A' },
};

export default function SupportPage() {
  const [tickets,        setTickets]        = useState([]);
  const [stats,          setStats]          = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });
  const [loading,        setLoading]        = useState(true);
  const [openCreate,     setOpenCreate]     = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply,          setReply]          = useState('');
  const [snack,          setSnack]          = useState({ open: false, msg: '', severity: 'success' });
  const [form, setForm]  = useState({ subject: '', description: '', category: 'technical', priority: 'normal' });

  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);
  const notify  = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.allSettled([api.get('/support/'), api.get('/support/stats/')]);
      if (tRes.status === 'fulfilled') setTickets(tRes.value.data?.results ?? tRes.value.data ?? []);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
    } catch { notify('Failed to load tickets', 'error'); }
    finally   { setLoading(false); }
  };

  const handleCreate = async () => {
    try {
      await api.post('/support/', form);
      notify('Ticket submitted successfully');
      setOpenCreate(false);
      setForm({ subject: '', description: '', category: 'technical', priority: 'normal' });
      fetchTickets();
    } catch { notify('Failed to create ticket', 'error'); }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      await api.post(`/support/${selectedTicket.id}/reply/`, { message: reply });
      setReply('');
      const res = await api.get(`/support/${selectedTicket.id}/`);
      setSelectedTicket(res.data);
      notify('Reply sent');
    } catch { notify('Failed to send reply', 'error'); }
  };

  const handleResolve = async (ticket) => {
    try {
      await api.post(`/support/${ticket.id}/resolve/`);
      notify('Ticket resolved');
      fetchTickets();
      if (selectedTicket?.id === ticket.id) {
        const res = await api.get(`/support/${ticket.id}/`);
        setSelectedTicket(res.data);
      }
    } catch { notify('Failed to resolve ticket', 'error'); }
  };

  const FIRM_WHATSAPP = '+919999999999';
  const FIRM_EMAIL    = 'support@hphcms.in';

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>

      {/* ✅ HERO — uses theme colors */}
      <PageHero
        label="HP HCMS"
        icon={<HeadsetMicRounded />}
        title="Support Center"
        subtitle="We're here to help — choose your preferred support channel"
        action={
          <Button startIcon={<AddRounded />} onClick={() => setOpenCreate(true)} sx={{
            bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', borderRadius: '12px', px: 3, py: 1.4,
            fontWeight: 800, textTransform: 'none', fontSize: 14,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'translateY(-1px)' },
            transition: 'all 0.2s',
          }}>
            New Ticket
          </Button>
        }
      />

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',       value: stats.total,       color: '#0D1B2A', bg: '#F1F5F9' },
          { label: 'Open',        value: stats.open,        color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'In Progress', value: stats.in_progress, color: '#3B82F6', bg: '#EFF6FF' },
          { label: 'Resolved',    value: stats.resolved,    color: '#10B981', bg: '#ECFDF5' },
        ].map(s => (
          <Box key={s.label} sx={{ px: 2.5, py: 1.5, bgcolor: s.bg, borderRadius: '12px', border: `1px solid ${s.color}20`, minWidth: 80 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: 10, color: s.color, fontWeight: 700, mt: 0.3, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Contact channels */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
        {[
          { icon: <WhatsApp />, title: 'WhatsApp Support', sub: 'Quick replies during business hours', color: '#25D366', bg: '#F0FFF4', href: `https://wa.me/${FIRM_WHATSAPP}` },
          { icon: <EmailRounded />, title: 'Email Support', sub: 'Get email updates and full tracking', color: '#3B82F6', bg: '#EFF6FF', onClick: () => setOpenCreate(true) },
        ].map((c, i) => (
          <Box key={i} onClick={c.onClick || (() => window.open(c.href, '_blank'))} sx={{ p: 2.5, bgcolor: c.bg, borderRadius: '16px', border: `1px solid ${c.color}20`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${c.color}20` } }}>
            <Box sx={{ width: 44, height: 44, bgcolor: c.color, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>{c.icon}</Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0D1B2A' }}>{c.title}</Typography>
              <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.3 }}>{c.sub}</Typography>
            </Box>
            <ArrowForwardRounded sx={{ fontSize: 16, color: c.color }} />
          </Box>
        ))}
      </Box>

      {/* Tickets list */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0EDE5' }}>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0D1B2A', fontSize: 15 }}>Your Tickets</Typography>
            <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2 }}>{tickets.length} total</Typography>
          </Box>
          <Button startIcon={<AddRounded />} onClick={() => setOpenCreate(true)} sx={{ bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', borderRadius: '10px', px: 2.5, py: 1, fontSize: 13, fontWeight: 600, '&:hover': { bgcolor: '#1B3050' } }}>
            New Ticket
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress sx={{ color: '#0D1B2A' }} /></Box>
        ) : tickets.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: '#F5F4F0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <SupportAgentRounded sx={{ fontSize: 30, color: '#D0CEC7' }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#0D1B2A', mb: 0.5 }}>No tickets yet</Typography>
            <Typography sx={{ fontSize: 13, color: '#9CA3AF', mb: 3 }}>Create your first support ticket to get help</Typography>
            <Button onClick={() => setOpenCreate(true)} startIcon={<AddRounded />} sx={{ bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', borderRadius: '10px', px: 3, fontWeight: 600 }}>Create Ticket</Button>
          </Box>
        ) : (
          tickets.map((ticket, idx) => {
            const st = STATUS[ticket.status] || STATUS.open;
            const pr = PRIORITY[ticket.priority] || PRIORITY.normal;
            return (
              <Box key={ticket.id} onClick={() => setSelectedTicket(ticket)} sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2.5, borderBottom: idx === tickets.length - 1 ? 'none' : '1px solid #F5F4F0', cursor: 'pointer', transition: 'background 0.15s', '&:hover': { bgcolor: '#FAFAF8' } }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: pr.color, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.05em', flexShrink: 0 }}>{ticket.ticket_number}</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>{ticket.category}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#C0BCBA' }}>·</Typography>
                    <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(ticket.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                  </Box>
                </Box>
                <Chip label={st.label} size="small" sx={{ bgcolor: st.bg, color: st.color, fontWeight: 700, fontSize: 11, border: 'none' }} />
                <ArrowForwardRounded sx={{ fontSize: 16, color: '#CBD5E1' }} />
              </Box>
            );
          })
        )}
      </Box>

      {/* Create dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>
          New Support Ticket
          <IconButton size="small" onClick={() => setOpenCreate(false)} sx={{ position: 'absolute', right: 16, top: 14 }}><CloseRounded /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField fullWidth label="Subject *" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} sx={inputSx} />
            <TextField fullWidth label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={3} sx={inputSx} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Category</InputLabel>
                <Select value={form.category} label="Category" onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['technical', 'billing', 'feature', 'other'].map(c => <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} label="Priority" onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {Object.entries(PRIORITY).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: '10px', textTransform: 'none', color: '#64748B', border: '1px solid #E2E8F0' }}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.subject.trim()} sx={{ borderRadius: '10px', textTransform: 'none', bgcolor: '#0D1B2A', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#1B2D41' }, '&.Mui-disabled': { bgcolor: '#CBD5E1', color: '#fff' } }}>
            Submit Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ticket detail dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#C9A84C' }}>{selectedTicket.ticket_number}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0D1B2A' }}>{selectedTicket.subject}</Typography>
            </Box>
            <IconButton size="small" onClick={() => setSelectedTicket(null)} sx={{ position: 'absolute', right: 16, top: 14 }}><CloseRounded /></IconButton>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ fontSize: 13, color: '#64748B', mb: 2 }}>{selectedTicket.description}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip label={STATUS[selectedTicket.status]?.label || selectedTicket.status} size="small" sx={{ bgcolor: STATUS[selectedTicket.status]?.bg, color: STATUS[selectedTicket.status]?.color, fontWeight: 700 }} />
              <Chip label={PRIORITY[selectedTicket.priority]?.label || selectedTicket.priority} size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700 }} />
            </Box>
            {(selectedTicket.replies || []).map((r, i) => (
              <Box key={i} sx={{ p: 1.5, bgcolor: '#F8F7F4', borderRadius: '10px', mb: 1 }}>
                <Typography sx={{ fontSize: 11, color: '#9CA3AF', mb: 0.5 }}>{r.user?.username || 'Support'}</Typography>
                <Typography sx={{ fontSize: 13, color: '#0D1B2A' }}>{r.message}</Typography>
              </Box>
            ))}
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <TextField fullWidth size="small" placeholder="Add a reply..." value={reply} onChange={e => setReply(e.target.value)} sx={inputSx} />
              <IconButton onClick={handleReply} disabled={!reply.trim()} sx={{ bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', '&:hover': { bgcolor: '#1B2D41' }, '&.Mui-disabled': { bgcolor: '#CBD5E1' } }}>
                <SendRounded sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            {selectedTicket.status !== 'resolved' && (
              <Button onClick={() => handleResolve(selectedTicket)} startIcon={<CheckCircleRounded />} sx={{ borderRadius: '10px', textTransform: 'none', bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, '&:hover': { bgcolor: '#D1FAE5' } }}>
                Mark Resolved
              </Button>
            )}
            <Button onClick={() => setSelectedTicket(null)} sx={{ borderRadius: '10px', textTransform: 'none', color: '#64748B', border: '1px solid #E2E8F0', ml: 'auto' }}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
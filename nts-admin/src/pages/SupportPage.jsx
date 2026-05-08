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
    borderRadius: '10px',
    backgroundColor: '#F8F7F4',
    '& fieldset': { borderColor: '#E8E4DC' },
    '&:hover fieldset': { borderColor: '#C9A84C' },
    '&.Mui-focused fieldset': { borderColor: '#0D1B2A', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0D1B2A' },
};

export default function SupportPage() {
  const [tickets,       setTickets]       = useState([]);
  const [stats,         setStats]         = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 });
  const [loading,       setLoading]       = useState(true);
  const [openCreate,    setOpenCreate]    = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply,         setReply]         = useState('');
  const [snack,         setSnack]         = useState({ open: false, msg: '', severity: 'success' });

  const user    = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = ['admin', 'super_admin'].includes(user?.role);

  const [form, setForm] = useState({
    subject: '', description: '', category: 'technical', priority: 'normal'
  });

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.allSettled([
        api.get('/support/'),
        api.get('/support/stats/'),
      ]);
      if (tRes.status === 'fulfilled') setTickets(tRes.value.data?.results ?? tRes.value.data ?? []);
      if (sRes.status === 'fulfilled') setStats(sRes.value.data);
    } catch { notify('Failed to load tickets', 'error'); }
    finally { setLoading(false); }
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
      notify('Ticket marked as resolved');
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

      {/* ── Hero Header ── */}
      <Box sx={{
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3050 60%, #0D1B2A 100%)',
        p: { xs: 3, md: 4 }, mb: 3, position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }} />
        <Box sx={{ position: 'absolute', top: -10, right: -10, width: 100, height: 100, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.1)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, left: 120, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.05)' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, bgcolor: 'rgba(201,168,76,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(201,168,76,0.3)' }}>
                <HeadsetMicRounded sx={{ color: '#C9A84C', fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase' }}>HP HCMS</Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#fff', lineHeight: 1.2, mb: 0.5 }}>
              Support Center
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              We're here to help — choose your preferred channel
            </Typography>
          </Box>
          <Button
            startIcon={<AddRounded />}
            onClick={() => setOpenCreate(true)}
            sx={{
              bgcolor: '#C9A84C', color: '#0D1B2A', borderRadius: '12px', px: 3, py: 1.4,
              fontWeight: 800, textTransform: 'none', fontSize: 14,
              boxShadow: '0 4px 20px rgba(201,168,76,0.35)',
              '&:hover': { bgcolor: '#DFC070', transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(201,168,76,0.45)' },
              transition: 'all 0.2s'
            }}
          >
            New Ticket
          </Button>
        </Box>

        {/* Mini stats inside header */}
        <Box sx={{ display: 'flex', gap: 3, mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Tickets', value: stats.total, color: '#fff' },
            { label: 'Open',          value: stats.open,  color: '#F59E0B' },
            { label: 'In Progress',   value: stats.in_progress, color: '#60A5FA' },
            { label: 'Resolved',      value: stats.resolved,    color: '#34D399' },
          ].map(s => (
            <Box key={s.label}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500, mt: 0.2 }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Contact Channels ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>

        {/* WhatsApp */}
        <Box
          onClick={() => window.open(`https://wa.me/${FIRM_WHATSAPP.replace(/\D/g, '')}?text=Hello, I need support regarding HP HCMS`, '_blank')}
          sx={{
            bgcolor: '#fff', borderRadius: '16px', p: 3, cursor: 'pointer',
            border: '1px solid #E8F5E9', position: 'relative', overflow: 'hidden',
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(37,211,102,0.15)', borderColor: '#25D366' },
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, bgcolor: '#25D36608', borderRadius: '0 16px 0 80px' }} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ width: 44, height: 44, bgcolor: '#25D366', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(37,211,102,0.35)' }}>
              <WhatsApp sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FiberManualRecordRounded sx={{ fontSize: 8, color: '#25D366' }} />
              <Typography sx={{ fontSize: 11, color: '#25D366', fontWeight: 700 }}>Online</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0D1B2A', mb: 0.5 }}>WhatsApp</Typography>
          <Typography sx={{ fontSize: 12, color: '#9CA3AF', mb: 2.5, lineHeight: 1.5 }}>Instant replies from our team. Fastest support channel.</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#25D366' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Start Chat</Typography>
            <ArrowForwardRounded sx={{ fontSize: 14 }} />
          </Box>
        </Box>

        {/* Email */}
        <Box
          onClick={() => window.open(`mailto:${FIRM_EMAIL}?subject=Support Request - HP HCMS`)}
          sx={{
            bgcolor: '#fff', borderRadius: '16px', p: 3, cursor: 'pointer',
            border: '1px solid #E0EAFF', position: 'relative', overflow: 'hidden',
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(59,130,246,0.15)', borderColor: '#3B82F6' },
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, bgcolor: '#3B82F608', borderRadius: '0 16px 0 80px' }} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ width: 44, height: 44, bgcolor: '#3B82F6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
              <EmailRounded sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeRounded sx={{ fontSize: 11, color: '#9CA3AF' }} />
              <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>24h reply</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0D1B2A', mb: 0.5 }}>Email Support</Typography>
          <Typography sx={{ fontSize: 12, color: '#9CA3AF', mb: 2.5, lineHeight: 1.5 }}>For detailed queries and formal communications.</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#3B82F6' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Send Email</Typography>
            <ArrowForwardRounded sx={{ fontSize: 14 }} />
          </Box>
        </Box>

        {/* Ticket */}
        <Box
          onClick={() => setOpenCreate(true)}
          sx={{
            bgcolor: '#0D1B2A', borderRadius: '16px', p: 3, cursor: 'pointer',
            position: 'relative', overflow: 'hidden',
            transition: 'all 0.2s',
            '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 12px 32px rgba(13,27,42,0.35)' },
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, bgcolor: 'rgba(201,168,76,0.08)', borderRadius: '0 16px 0 80px' }} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ width: 44, height: 44, bgcolor: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SupportAgentRounded sx={{ color: '#C9A84C', fontSize: 22 }} />
            </Box>
            <Chip label="Tracked" size="small" sx={{ height: 20, fontSize: 10, bgcolor: 'rgba(201,168,76,0.15)', color: '#C9A84C', fontWeight: 700, border: '1px solid rgba(201,168,76,0.2)' }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#fff', mb: 0.5 }}>Support Ticket</Typography>
          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mb: 2.5, lineHeight: 1.5 }}>Submit a formal ticket. Get email updates and full tracking.</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#C9A84C' }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Create Ticket</Typography>
            <ArrowForwardRounded sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      </Box>

      {/* ── Tickets List ── */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>

        {/* List Header */}
        <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F0EDE5' }}>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#0D1B2A', fontSize: 15 }}>Your Tickets</Typography>
            <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2 }}>{tickets.length} total</Typography>
          </Box>
          <Button
            startIcon={<AddRounded />}
            onClick={() => setOpenCreate(true)}
            sx={{
              bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', borderRadius: '10px',
              px: 2.5, py: 1, fontSize: 13, fontWeight: 600,
              '&:hover': { bgcolor: '#1B3050' }
            }}
          >
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
            <Typography sx={{ color: '#0D1B2A', fontSize: 15, fontWeight: 600, mb: 0.5 }}>No tickets yet</Typography>
            <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 3 }}>Create your first support ticket to get help</Typography>
            <Button onClick={() => setOpenCreate(true)} startIcon={<AddRounded />}
              sx={{ bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', borderRadius: '10px', px: 3, fontWeight: 600 }}>
              Create Ticket
            </Button>
          </Box>
        ) : (
          tickets.map((ticket, idx) => {
            const st = STATUS[ticket.status] || STATUS.open;
            const pr = PRIORITY[ticket.priority] || PRIORITY.normal;
            return (
              <Box
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2.5,
                  borderBottom: idx === tickets.length - 1 ? 'none' : '1px solid #F5F4F0',
                  cursor: 'pointer', transition: 'background 0.15s',
                  '&:hover': { bgcolor: '#FAFAF8' },
                }}
              >
                {/* Priority dot */}
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: pr.color, flexShrink: 0 }} />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.05em', flexShrink: 0 }}>
                      {ticket.ticket_number}
                    </Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ticket.subject}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
                      {ticket.category}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#C0BCBA' }}>·</Typography>
                    <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
                      {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>

                {/* Priority badge */}
                <Box sx={{ px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: pr.color + '12', border: `1px solid ${pr.color}25`, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: pr.color }}>{pr.label}</Typography>
                </Box>

                {/* Status badge */}
                <Box sx={{ px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: st.bg, border: `1px solid ${st.color}30`, flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: st.color }}>{st.label}</Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* ── Create Ticket Dialog ── */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#0D1B2A', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>New Support Ticket</Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mt: 0.2 }}>We'll respond within 24 hours</Typography>
          </Box>
          <IconButton onClick={() => setOpenCreate(false)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
            <CloseRounded />
          </IconButton>
        </Box>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
          <TextField label="Subject *" fullWidth value={form.subject}
            onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} sx={inputSx} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Category</InputLabel>
              <Select value={form.category} label="Category"
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {[['technical','Technical Issue'],['billing','Billing'],['feature','Feature Request'],['account','Account'],['legal','Legal Query'],['other','Other']].map(([v,l]) => (
                  <MenuItem key={v} value={v}>{l}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority"
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {[['low','🟢 Low'],['normal','🔵 Normal'],['high','🟠 High'],['critical','🔴 Critical']].map(([v,l]) => (
                  <MenuItem key={v} value={v}>{l}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField label="Description *" fullWidth multiline rows={4} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Describe your issue in detail..."
            sx={inputSx} />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenCreate(false)}
            sx={{ textTransform: 'none', color: '#9CA3AF', fontWeight: 600, borderRadius: '10px', px: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!form.subject || !form.description}
            sx={{
              bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', px: 3, borderRadius: '10px',
              fontWeight: 700, '&:hover': { bgcolor: '#1B3050' },
              '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' }
            }}>
            Submit Ticket
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Ticket Detail Dialog ── */}
      {selectedTicket && (() => {
        const st = STATUS[selectedTicket.status] || STATUS.open;
        return (
          <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="md" fullWidth
            PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>

            {/* Dialog Header */}
            <Box sx={{ bgcolor: '#0D1B2A', px: 3, py: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.1em' }}>
                      {selectedTicket.ticket_number}
                    </Typography>
                    <Box sx={{ px: 1.5, py: 0.3, borderRadius: '20px', bgcolor: st.color + '20', border: `1px solid ${st.color}40` }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: st.color }}>{st.label}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1.3 }}>
                    {selectedTicket.subject}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  {isAdmin && selectedTicket.status !== 'resolved' && (
                    <Button onClick={() => handleResolve(selectedTicket)}
                      startIcon={<CheckCircleRounded sx={{ fontSize: 16 }} />}
                      sx={{ textTransform: 'none', color: '#34D399', fontWeight: 700, fontSize: 13, borderRadius: '10px', px: 2, border: '1px solid rgba(52,211,153,0.3)', '&:hover': { bgcolor: 'rgba(52,211,153,0.08)' } }}>
                      Resolve
                    </Button>
                  )}
                  <IconButton onClick={() => setSelectedTicket(null)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                    <CloseRounded />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            <DialogContent sx={{ p: 0 }}>
              {/* Description */}
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F0EDE5', bgcolor: '#FAFAF8' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
                  Description
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#3A3A35', lineHeight: 1.7 }}>
                  {selectedTicket.description}
                </Typography>
              </Box>

              {/* Conversation */}
              <Box sx={{ px: 3, pt: 2.5 }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 2 }}>
                  Conversation · {selectedTicket.replies?.length || 0} messages
                </Typography>

                <Box sx={{ maxHeight: 280, overflowY: 'auto', mb: 2.5, pr: 0.5,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 4 },
                }}>
                  {!(selectedTicket.replies?.length) ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography sx={{ fontSize: 13, color: '#C0BCBA', fontStyle: 'italic' }}>No replies yet — be the first to respond</Typography>
                    </Box>
                  ) : (
                    selectedTicket.replies.map(r => (
                      <Box key={r.id} sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexDirection: r.is_staff_reply ? 'row-reverse' : 'row' }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: r.is_staff_reply ? '#C9A84C' : '#0D1B2A', flexShrink: 0 }}>
                          {(r.author?.username || '?')[0].toUpperCase()}
                        </Avatar>
                        <Box sx={{ maxWidth: '72%' }}>
                          <Box sx={{
                            bgcolor: r.is_staff_reply ? '#FFF8E7' : '#F5F4F0',
                            borderRadius: r.is_staff_reply ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                            px: 2, py: 1.5,
                            border: r.is_staff_reply ? '1px solid #F3E9C6' : '1px solid #ECEAE5',
                          }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: r.is_staff_reply ? '#8B6B00' : '#0D1B2A', mb: 0.5 }}>
                              {r.author?.username} {r.is_staff_reply && <span style={{ color: '#C9A84C' }}>· Support</span>}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#3A3A35', lineHeight: 1.6 }}>{r.message}</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 10, color: '#C0BCBA', mt: 0.5, px: 0.5, textAlign: r.is_staff_reply ? 'right' : 'left' }}>
                            {new Date(r.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>

                {/* Reply Input */}
                <Box sx={{ display: 'flex', gap: 1.5, pb: 3 }}>
                  <TextField
                    placeholder="Type your reply..."
                    fullWidth multiline maxRows={3} value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleReply()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px', bgcolor: '#F8F7F4',
                        '& fieldset': { borderColor: '#E8E4DC' },
                        '&.Mui-focused fieldset': { borderColor: '#0D1B2A' },
                      }
                    }}
                  />
                  <IconButton onClick={handleReply} disabled={!reply.trim()}
                    sx={{
                      bgcolor: '#0D1B2A', color: '#fff', borderRadius: '12px', width: 48, height: 48,
                      '&:hover': { bgcolor: '#1B3050' },
                      '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
                      transition: 'all 0.2s', flexShrink: 0
                    }}>
                    <SendRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </DialogContent>
          </Dialog>
        );
      })()}

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
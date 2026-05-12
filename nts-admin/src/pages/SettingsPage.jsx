import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, CircularProgress, Snackbar, Alert,
} from '@mui/material';
import {
  EmailRounded, NotificationsRounded, CheckCircleRounded,
  SaveRounded, LockRounded, FiberManualRecordRounded,
} from '@mui/icons-material';
import { WhatsApp } from '@mui/icons-material';
import { SettingsRounded } from '@mui/icons-material';
import api from '../api/client';
import PageHero from '../components/PageHero';

// ── Channel config ──
const CHANNELS = {
  email: {
    label: 'Email Notifications', description: 'Receive updates via email',
    icon: EmailRounded, color: '#3B82F6', bg: '#EFF6FF', iconBg: '#DBEAFE',
    events: [
      { key: 'task_assigned',    label: 'Task Assigned',     desc: 'When a task is assigned to you' },
      { key: 'hearing_reminder', label: 'Hearing Reminder',  desc: 'Reminder before a hearing' },
      { key: 'ticket_update',    label: 'Ticket Update',     desc: 'When your support ticket is updated' },
      { key: 'payment_receipt',  label: 'Payment Receipt',   desc: 'When a payment is recorded' },
      { key: 'plan_expiry',      label: 'Plan Expiry',       desc: 'Before your subscription expires' },
    ],
  },
  push: {
    label: 'Push Notifications', description: 'Browser / device push alerts',
    icon: NotificationsRounded, color: '#8B5CF6', bg: '#F5F3FF', iconBg: '#EDE9FE',
    events: [
      { key: 'task_assigned',    label: 'Task Assigned',    desc: 'Push alert for new task' },
      { key: 'hearing_reminder', label: 'Hearing Reminder', desc: 'Push alert before hearing' },
      { key: 'ticket_update',    label: 'Ticket Update',    desc: 'Push alert for ticket changes' },
      { key: 'case_update',      label: 'Case Update',      desc: 'Push alert for case changes' },
    ],
  },
  whatsapp: {
    label: 'WhatsApp Notifications', description: 'Get messages on WhatsApp',
    icon: WhatsApp, color: '#25D366', bg: '#F0FFF4', iconBg: '#D1FAE5',
    events: [
      { key: 'task_assigned',    label: 'Task Assigned',    desc: 'WhatsApp message for new tasks' },
      { key: 'hearing_reminder', label: 'Hearing Reminder', desc: 'WhatsApp reminder before hearing' },
      { key: 'payment_receipt',  label: 'Payment Receipt',  desc: 'WhatsApp message for payments' },
      { key: 'ticket_update',    label: 'Ticket Update',    desc: 'WhatsApp message for tickets' },
    ],
  },
};

// ── Toggle pill ──
const TogglePill = ({ checked, onChange, color }) => (
  <Box onClick={onChange} sx={{
    position: 'relative', width: 42, height: 22, borderRadius: '99px', cursor: 'pointer',
    bgcolor: checked ? color : '#E2E8F0',
    border: `1px solid ${checked ? color : '#CBD5E1'}`,
    transition: 'background 0.25s, border-color 0.25s',
    flexShrink: 0,
    boxShadow: checked ? `0 0 8px ${color}40` : 'none',
  }}>
    <Box sx={{
      position: 'absolute', top: 3, left: checked ? 22 : 3,
      width: 16, height: 16, borderRadius: '50%',
      bgcolor: '#fff', transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    }} />
  </Box>
);

// ── Channel card ──
const ChannelCard = ({ config, channelPrefs = {}, onToggleChannel, onToggleEvent }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = config.icon;
  const isEnabled  = channelPrefs.enabled ?? false;
  const activeCount = config.events.filter(e => channelPrefs[e.key]).length;

  return (
    <Box sx={{
      bgcolor: '#fff', borderRadius: '16px', mb: 2.5, overflow: 'hidden',
      border: `1px solid ${isEnabled ? config.color + '35' : 'rgba(0,0,0,0.06)'}`,
      boxShadow: isEnabled ? `0 4px 24px ${config.color}18` : '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    }}>
      {/* Header */}
      <Box onClick={() => isEnabled && setExpanded(p => !p)} sx={{
        display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2.5,
        bgcolor: isEnabled ? config.bg : '#FAFAFA',
        borderBottom: (isEnabled && expanded) ? `1px solid ${config.color}18` : '1px solid transparent',
        cursor: isEnabled ? 'pointer' : 'default',
        transition: 'background 0.2s', userSelect: 'none',
      }}>
        <Box sx={{ width: 48, height: 48, borderRadius: '14px', flexShrink: 0, bgcolor: isEnabled ? config.iconBg : '#F1F5F9', border: `1px solid ${isEnabled ? config.color + '30' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', boxShadow: isEnabled ? `0 4px 12px ${config.color}25` : 'none' }}>
          <Icon sx={{ color: isEnabled ? config.color : '#CBD5E1', fontSize: 22, transition: 'color 0.3s' }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: isEnabled ? '#0D1B2A' : '#9CA3AF', transition: 'color 0.3s' }}>{config.label}</Typography>
            {isEnabled && activeCount > 0 && (
              <Box sx={{ px: 1.2, py: 0.2, borderRadius: '20px', bgcolor: config.color + '18', border: `1px solid ${config.color}25` }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: config.color }}>{activeCount} active</Typography>
              </Box>
            )}
          </Box>
          {!isEnabled && <Typography sx={{ fontSize: 12, color: '#CBD5E1', flexShrink: 0 }}>{config.description}</Typography>}
        </Box>
        <TogglePill checked={isEnabled} onChange={e => { e.stopPropagation(); onToggleChannel(); }} color={config.color} />
      </Box>

      {/* Events */}
      {isEnabled && expanded && (
        <Box sx={{ bgcolor: '#fff' }}>
          {config.events.map((event, idx) => {
            const on = channelPrefs[event.key] ?? false;
            return (
              <Box key={event.key}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2, '&:hover': { bgcolor: '#FAFAF8' }, transition: 'background 0.15s' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, bgcolor: on ? config.color : '#E2E8F0', boxShadow: on ? `0 0 6px ${config.color}80` : 'none', transition: 'background 0.2s' }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: on ? '#0D1B2A' : '#94A3B8', transition: 'color 0.2s' }}>{event.label}</Typography>
                    <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2 }}>{event.desc}</Typography>
                  </Box>
                  <TogglePill checked={on} onChange={() => onToggleEvent(event.key)} color={config.color} />
                </Box>
                {idx < config.events.length - 1 && <Box sx={{ mx: 3, height: '1px', bgcolor: '#F5F4F0' }} />}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default function SettingsPage() {
  const [prefs,   setPrefs]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [snack,   setSnack]   = useState({ open: false, msg: '', severity: 'success' });
  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  useEffect(() => { fetchPrefs(); }, []);

  const fetchPrefs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/preferences/');
      setPrefs(res.data);
    } catch {
      setPrefs({
        email:    { enabled: true,  task_assigned: true,  hearing_reminder: true,  ticket_update: false, payment_receipt: true, plan_expiry: true },
        push:     { enabled: false, task_assigned: false, hearing_reminder: false, ticket_update: false, case_update: false },
        whatsapp: { enabled: true,  task_assigned: true,  hearing_reminder: true,  payment_receipt: true, ticket_update: true },
      });
      notify('Using default preferences', 'warning');
    }
    finally { setLoading(false); }
  };

  const toggleChannel = (ch)       => setPrefs(p => ({ ...p, [ch]: { ...p[ch], enabled: !p[ch]?.enabled } }));
  const toggleEvent   = (ch, key)  => setPrefs(p => ({ ...p, [ch]: { ...p[ch], [key]: !p[ch]?.[key] } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/notifications/preferences/', prefs);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      notify('Preferences saved successfully');
    } catch { notify('Failed to save preferences', 'error'); }
    finally { setSaving(false); }
  };

  const totalActive = prefs ? Object.entries(CHANNELS).reduce((sum, [ch, cfg]) => {
    if (!prefs[ch]?.enabled) return sum;
    return sum + cfg.events.filter(e => prefs[ch]?.[e.key]).length;
  }, 0) : 0;

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><CircularProgress sx={{ color: '#0D1B2A' }} /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>

      {/* ✅ HERO — uses theme colors */}
      <PageHero
        label="HP HCMS · Settings"
        icon={<SettingsRounded />}
        title="Notification Settings"
        subtitle="Control how and when you receive notifications"
        action={
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Button onClick={handleSave} disabled={saving}
              startIcon={saved ? <CheckCircleRounded sx={{ fontSize: 18 }} /> : <SaveRounded sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '12px', px: 3, py: 1.4, fontWeight: 700, textTransform: 'none', fontSize: 14,
                bgcolor: saved ? '#10B981' : 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff',
                transition: 'all 0.3s',
                '&:hover': { bgcolor: saved ? '#059669' : 'rgba(255,255,255,0.25)', transform: 'translateY(-1px)' },
                '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' },
              }}>
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Preferences'}
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <FiberManualRecordRounded sx={{ fontSize: 7, color: 'rgba(255,255,255,0.5)' }} />
              <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                {totalActive} notification{totalActive !== 1 ? 's' : ''} active
              </Typography>
            </Box>
          </Box>
        }
      />

      {/* WhatsApp banner */}
      <Box sx={{ borderRadius: '16px', mb: 3, bgcolor: '#F0FFF4', border: '1px solid #BBF7D0', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#D1FAE5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <WhatsApp sx={{ color: '#25D366', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#065F46', mb: 0.2 }}>WhatsApp enabled by default</Typography>
          <Typography sx={{ fontSize: 12, color: '#6B7280' }}>For the best experience, WhatsApp notifications are on. Adjust individual events below.</Typography>
        </Box>
      </Box>

      {/* Channel cards */}
      {prefs && Object.entries(CHANNELS).map(([ch, cfg]) => (
        <ChannelCard key={ch} config={cfg} channelPrefs={prefs[ch] || {}} onToggleChannel={() => toggleChannel(ch)} onToggleEvent={(key) => toggleEvent(ch, key)} />
      ))}

      {/* Footer note */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2, px: 1 }}>
        <LockRounded sx={{ fontSize: 13, color: '#CBD5E1' }} />
        <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>Preferences are saved to your account and take effect immediately.</Typography>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
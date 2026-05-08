import { useState, useEffect } from 'react';
import {
  Box, Typography, CircularProgress,
  Snackbar, Alert, Button
} from '@mui/material';
import {
  EmailRounded, WhatsApp, NotificationsRounded,
  SaveRounded, CheckCircleRounded, LockRounded,
  FiberManualRecordRounded, ArrowForwardIosRounded,
} from '@mui/icons-material';
import api from '../api/client';

const CHANNELS = {
  email: {
    label: 'Email',
    sublabel: 'Inbox delivery',
    icon: EmailRounded,
    color: '#3B82F6',
    bg: '#EFF6FF',
    border: '#DBEAFE',
    iconBg: '#3B82F620',
    description: 'Notifications sent directly to your registered email address.',
    events: [
      { key: 'task_assigned',    label: 'Task Assigned',       desc: 'When a task is assigned to you' },
      { key: 'hearing_reminder', label: 'Hearing Reminder',    desc: 'Upcoming court hearing alerts' },
      { key: 'ticket_update',    label: 'Ticket Update',       desc: 'Replies or resolution on your tickets' },
      { key: 'payment_receipt',  label: 'Payment Receipt',     desc: 'Payment confirmations and invoices' },
      { key: 'plan_expiry',      label: 'Plan Expiry Warning', desc: 'Reminders before your plan expires' },
    ],
  },
  push: {
    label: 'Push',
    sublabel: 'Real-time alerts',
    icon: NotificationsRounded,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#EDE9FE',
    iconBg: '#8B5CF620',
    description: 'Instant browser push notifications on your device.',
    events: [
      { key: 'task_assigned',    label: 'Task Assigned',   desc: 'Instant alert when a task is assigned' },
      { key: 'hearing_reminder', label: 'Hearing Reminder',desc: 'Day-of reminders for hearings' },
      { key: 'ticket_update',    label: 'Ticket Update',   desc: 'When your ticket gets a reply' },
      { key: 'case_update',      label: 'Case Update',     desc: 'Any updates on your assigned cases' },
    ],
  },
  whatsapp: {
    label: 'WhatsApp',
    sublabel: 'Instant messages',
    icon: WhatsApp,
    color: '#25D366',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    iconBg: '#25D36620',
    description: 'Quick WhatsApp messages — enabled by default for best experience.',
    defaultOn: true,
    events: [
      { key: 'task_assigned',    label: 'Task Assigned',   desc: 'WhatsApp message when assigned a task' },
      { key: 'hearing_reminder', label: 'Hearing Reminder',desc: 'Reminder message before hearings' },
      { key: 'payment_receipt',  label: 'Payment Receipt', desc: 'Invoice and payment confirmation' },
      { key: 'ticket_update',    label: 'Ticket Update',   desc: 'Support ticket status changes' },
    ],
  },
};

// ── Animated toggle pill ──
const TogglePill = ({ checked, onChange, color }) => (
  <Box onClick={onChange} sx={{
    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative',
    bgcolor: checked ? color : '#E2E8F0',
    border: `1px solid ${checked ? color : '#CBD5E1'}`,
    transition: 'background 0.25s, border-color 0.25s',
    flexShrink: 0,
    boxShadow: checked ? `0 0 8px ${color}40` : 'none',
  }}>
    <Box sx={{
      position: 'absolute', top: 3, left: checked ? 22 : 3,
      width: 16, height: 16, borderRadius: '50%',
      bgcolor: '#fff',
      transition: 'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    }} />
  </Box>
);

// ── Channel Card ──
const ChannelCard = ({ config, channelPrefs = {}, onToggleChannel, onToggleEvent }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = config.icon;
  const isEnabled = channelPrefs.enabled ?? false;
  const activeCount = config.events.filter(e => channelPrefs[e.key]).length;

  return (
    <Box sx={{
      bgcolor: '#fff', borderRadius: '16px', mb: 2.5, overflow: 'hidden',
      border: `1px solid ${isEnabled ? config.color + '35' : 'rgba(0,0,0,0.06)'}`,
      boxShadow: isEnabled
        ? `0 4px 24px ${config.color}18`
        : '0 1px 4px rgba(0,0,0,0.04)',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    }}>

      {/* ── Card Header ── */}
      <Box
        onClick={() => isEnabled && setExpanded(p => !p)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          px: 3, py: 2.5,
          bgcolor: isEnabled ? config.bg : '#FAFAFA',
          borderBottom: (isEnabled && expanded) ? `1px solid ${config.color}18` : '1px solid transparent',
          cursor: isEnabled ? 'pointer' : 'default',
          transition: 'background 0.2s',
          userSelect: 'none',
        }}
      >
        {/* Icon */}
        <Box sx={{
          width: 48, height: 48, borderRadius: '14px', flexShrink: 0,
          bgcolor: isEnabled ? config.iconBg : '#F1F5F9',
          border: `1px solid ${isEnabled ? config.color + '30' : '#E2E8F0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s',
          boxShadow: isEnabled ? `0 4px 12px ${config.color}25` : 'none',
        }}>
          <Icon sx={{ color: isEnabled ? config.color : '#94A3B8', fontSize: 24, transition: 'color 0.3s' }} />
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0D1B2A' }}>{config.label}</Typography>
            {config.defaultOn && (
              <Box sx={{ px: 1, py: 0.2, borderRadius: '6px', bgcolor: '#D1FAE5', border: '1px solid #A7F3D0' }}>
                <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#065F46', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Default ON</Typography>
              </Box>
            )}
          </Box>
          <Typography sx={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{config.sublabel}</Typography>
        </Box>

        {/* Active count badge */}
        {isEnabled && activeCount > 0 && (
          <Box sx={{ px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: config.color + '12', border: `1px solid ${config.color}25`, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: config.color }}>{activeCount}/{config.events.length} active</Typography>
          </Box>
        )}

        {/* Expand arrow */}
        {isEnabled && (
          <ArrowForwardIosRounded sx={{
            fontSize: 12, color: '#CBD5E1', flexShrink: 0,
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s',
          }} />
        )}

        {/* Master toggle */}
        <Box onClick={e => { e.stopPropagation(); onToggleChannel(); }}>
          <TogglePill checked={isEnabled} onChange={() => {}} color={config.color} />
        </Box>
      </Box>

      {/* ── Description strip when collapsed ── */}
      {!expanded && (
        <Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#fff' }}>
          <FiberManualRecordRounded sx={{ fontSize: 7, color: isEnabled ? config.color : '#CBD5E1', flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>{config.description}</Typography>
        </Box>
      )}

      {/* ── Events expanded ── */}
      {isEnabled && expanded && (
        <Box sx={{ bgcolor: '#fff' }}>
          {config.events.map((event, idx) => {
            const on = channelPrefs[event.key] ?? false;
            return (
              <Box key={event.key}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 2.5, px: 3, py: 2,
                  '&:hover': { bgcolor: '#FAFAF8' }, transition: 'background 0.15s',
                }}>
                  {/* Status dot */}
                  <Box sx={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    bgcolor: on ? config.color : '#E2E8F0',
                    boxShadow: on ? `0 0 6px ${config.color}80` : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: on ? '#0D1B2A' : '#94A3B8', transition: 'color 0.2s' }}>
                      {event.label}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2 }}>{event.desc}</Typography>
                  </Box>
                  <TogglePill checked={on} onChange={() => onToggleEvent(event.key)} color={config.color} />
                </Box>
                {idx < config.events.length - 1 && (
                  <Box sx={{ mx: 3, height: '1px', bgcolor: '#F5F4F0' }} />
                )}
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
      notify('Using default preferences — connect API to persist', 'warning');
    }
    finally { setLoading(false); }
  };

  const toggleChannel = (ch) =>
    setPrefs(p => ({ ...p, [ch]: { ...p[ch], enabled: !p[ch]?.enabled } }));

  const toggleEvent = (ch, key) =>
    setPrefs(p => ({ ...p, [ch]: { ...p[ch], [key]: !p[ch]?.[key] } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/notifications/preferences/', prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      notify('Preferences saved successfully');
    } catch { notify('Failed to save preferences', 'error'); }
    finally { setSaving(false); }
  };

  const totalActive = prefs
    ? Object.entries(CHANNELS).reduce((sum, [ch, cfg]) => {
        if (!prefs[ch]?.enabled) return sum;
        return sum + cfg.events.filter(e => prefs[ch]?.[e.key]).length;
      }, 0)
    : 0;

  if (loading) return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', bgcolor: '#F5F4F0' }}>
      <CircularProgress sx={{ color: '#0D1B2A' }} />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', mb: 0.5 }}>
              HP HCMS
            </Typography>
            <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#0D1B2A' }}>Notification Settings</Typography>
            <Typography sx={{ fontSize: 13, color: '#8B8B80', mt: 0.3 }}>
              Control how and when you receive notifications
            </Typography>
          </Box>

          {/* Save button */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Button
              onClick={handleSave}
              disabled={saving}
              startIcon={saved ? <CheckCircleRounded sx={{ fontSize: 18 }} /> : <SaveRounded sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '12px', px: 3, py: 1.4,
                fontWeight: 700, textTransform: 'none', fontSize: 14,
                bgcolor: saved ? '#10B981' : '#0D1B2A',
                color: '#fff',
                boxShadow: saved ? '0 4px 16px rgba(16,185,129,0.35)' : '0 4px 16px rgba(13,27,42,0.25)',
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: saved ? '#059669' : '#1B3050',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': { bgcolor: '#E2E8F0', color: '#94A3B8', boxShadow: 'none' },
              }}
            >
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Preferences'}
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <FiberManualRecordRounded sx={{ fontSize: 7, color: '#C9A84C' }} />
              <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 600 }}>
                {totalActive} notification{totalActive !== 1 ? 's' : ''} active
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── WhatsApp default-ON banner ── */}
      <Box sx={{
        borderRadius: '16px', mb: 3,
        bgcolor: '#F0FDF4', border: '1px solid #BBF7D0',
        px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2,
      }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#D1FAE5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <WhatsApp sx={{ color: '#25D366', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#065F46', mb: 0.2 }}>
            WhatsApp enabled by default
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
            For the best experience, WhatsApp notifications are on. Adjust individual events below.
          </Typography>
        </Box>
      </Box>

      {/* ── Channel Cards ── */}
      {prefs && Object.entries(CHANNELS).map(([channelKey, config]) => (
        <ChannelCard
          key={channelKey}
          config={config}
          channelPrefs={prefs[channelKey] || {}}
          onToggleChannel={() => toggleChannel(channelKey)}
          onToggleEvent={(key) => toggleEvent(channelKey, key)}
        />
      ))}

      {/* ── Footer ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2, px: 1 }}>
        <LockRounded sx={{ fontSize: 13, color: '#CBD5E1' }} />
        <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
          Preferences are saved to your account and take effect immediately after saving.
        </Typography>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
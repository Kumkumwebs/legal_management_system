import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Box, Dialog, DialogContent, DialogActions,
  Button, TextField, Typography, CircularProgress,
  Snackbar, Alert, IconButton,
} from "@mui/material";
import {
  NotificationsRounded, CloseRounded,
  GavelRounded, AccessTimeRounded, DeleteRounded,
} from "@mui/icons-material";
import { TimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { hearingsAPI } from "../api/services";
import api from "../api/client";

// ─── Notify Client Button ─────────────────────────────────
// Calls POST /api/hearings/{id}/notify-client/ on backend
function HearingNotifyButton({ hearingId, clientName, onSuccess, onError }) {
  const [sending, setSending] = useState(false);

  const handleNotify = async () => {
    setSending(true);
    try {
      await api.post(`/hearings/${hearingId}/notify-client/`);
      onSuccess?.(`Hearing reminder sent to ${clientName || 'client'}`);
    } catch (e) {
      onError?.(e?.response?.data?.error || e?.response?.data?.detail || 'Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      onClick={handleNotify}
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.8,
        px: 1.5, py: 0.6, borderRadius: '8px', cursor: sending ? 'default' : 'pointer',
        bgcolor: sending ? '#F5F4F0' : '#EFF6FF',
        border: `1px solid ${sending ? '#E8E4DC' : '#BFDBFE'}`,
        transition: 'all 0.15s', userSelect: 'none',
        '&:hover': sending ? {} : { bgcolor: '#DBEAFE', borderColor: '#3B82F6' },
      }}
    >
      {sending
        ? <CircularProgress size={12} sx={{ color: '#3B82F6' }} />
        : <NotificationsRounded sx={{ fontSize: 13, color: '#3B82F6' }} />
      }
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#3B82F6' }}>
        {sending ? 'Sending…' : 'Notify Client'}
      </Typography>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function HearingsPage() {
  const { caseId } = useParams();

  const [events,       setEvents]       = useState([]);
  const [open,         setOpen]         = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [title,        setTitle]        = useState("");
  const [courtName,    setCourtName]    = useState("");
  const [startTime,    setStartTime]    = useState(dayjs().hour(10).minute(0));
  const [endTime,      setEndTime]      = useState(dayjs().hour(11).minute(0));
  const [editingId,    setEditingId]    = useState(null);
  const [editingData,  setEditingData]  = useState(null); // full hearing object for notify button
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  useEffect(() => { fetchHearings(); }, [caseId]);

  const fetchHearings = async () => {
    try {
      const res = await hearingsAPI.getAll({ case: caseId });
      const hearings = res.data?.results ?? res.data ?? [];

      const formatted = hearings.map(h => ({
        id:    h.id,
        title: h.title,
        start: h.start_time ? `${h.date}T${h.start_time}` : h.date,
        end:   h.end_time   ? `${h.date}T${h.end_time}`   : h.date,
        extendedProps: h,   // store full object for detail dialog
        backgroundColor: '#0D1B2A',
        borderColor:     '#C9A84C',
        textColor:       '#fff',
      }));

      setEvents(formatted);
    } catch (err) {
      console.error("Hearings fetch error:", err);
      setEvents([]);
    }
  };

  // ── Click empty date → Create ──
  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setTitle("");
    setCourtName("");
    setStartTime(dayjs().hour(10).minute(0));
    setEndTime(dayjs().hour(11).minute(0));
    setEditingId(null);
    setEditingData(null);
    setOpen(true);
  };

  // ── Click existing event → Edit ──
  const handleEventClick = (info) => {
    const event = info.event;
    const h     = event.extendedProps;

    setEditingId(event.id);
    setEditingData(h);
    setTitle(event.title);
    setCourtName(h.court_name || "");
    setSelectedDate(event.startStr?.split("T")[0] || "");
    setStartTime(event.start ? dayjs(event.start) : dayjs().hour(10).minute(0));
    setEndTime(event.end   ? dayjs(event.end)   : dayjs().hour(11).minute(0));
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingId(null);
    setEditingData(null);
  };

  // ── Save / Update ──
  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title,
        date:       selectedDate,
        start_time: startTime.format("HH:mm:ss"),
        end_time:   endTime.format("HH:mm:ss"),
        court_name: courtName || "Court",
        case:       caseId,
      };

      if (editingId) {
        await hearingsAPI.update(editingId, payload);
        notify("Hearing updated");
      } else {
        await hearingsAPI.create(payload);
        notify("Hearing added");
      }

      handleClose();
      fetchHearings();
    } catch (err) {
      console.error(err);
      notify(err?.response?.data?.detail || "Failed to save hearing", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!editingId) return;
    setDeleting(true);
    try {
      await hearingsAPI.delete(editingId);
      notify("Hearing deleted");
      handleClose();
      fetchHearings();
    } catch (err) {
      console.error(err);
      notify("Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 36, height: 36, bgcolor: '#0D1B2A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GavelRounded sx={{ color: '#C9A84C', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.18em', textTransform: 'uppercase' }}>HP HCMS</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0D1B2A', lineHeight: 1.2 }}>
            Hearing Calendar {caseId ? `— Case #${caseId}` : ''}
          </Typography>
        </Box>
      </Box>

      {/* ── Calendar ── */}
      <Box sx={{
        bgcolor: '#fff', borderRadius: '16px',
        border: '1px solid rgba(0,0,0,0.06)',
        overflow: 'hidden',
        '& .fc': { fontFamily: 'inherit' },
        '& .fc-toolbar-title': { fontSize: '1rem', fontWeight: 700, color: '#0D1B2A' },
        '& .fc-button-primary': {
          bgcolor: '#0D1B2A !important', borderColor: '#0D1B2A !important',
          borderRadius: '8px !important', fontWeight: '600 !important',
          fontSize: '0.8rem !important',
        },
        '& .fc-daygrid-day:hover': { bgcolor: '#FAFAF8 !important', cursor: 'pointer' },
        '& .fc-event': { borderRadius: '6px !important', fontSize: '0.78rem', px: '4px' },
        '& .fc-day-today': { bgcolor: 'rgba(201,168,76,0.06) !important' },
        p: { xs: 1, md: 2 },
      }}>
        <FullCalendar
          key={caseId}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="75vh"
          headerToolbar={{
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth',
          }}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventMouseEnter={e => { e.el.style.opacity = '0.85'; e.el.style.cursor = 'pointer'; }}
          eventMouseLeave={e => { e.el.style.opacity = '1'; }}
        />
      </Box>

      {/* ── Add / Edit Dialog ── */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          disableRestoreFocus
          PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
        >
          {/* Dark header */}
          <Box sx={{ bgcolor: '#0D1B2A', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>
                {editingId ? 'Edit Hearing' : 'Add Hearing'}
              </Typography>
              <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mt: 0.2 }}>
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </Typography>
            </Box>
            <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
              <CloseRounded />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

            <TextField
              label="Hearing Title *"
              fullWidth
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Arguments on Merit, Witness Examination"
              sx={inputSx}
            />

            <TextField
              label="Court Name"
              fullWidth
              value={courtName}
              onChange={e => setCourtName(e.target.value)}
              placeholder="e.g. District Court, City"
              sx={inputSx}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TimePicker
                label="Start Time"
                value={startTime}
                onChange={v => setStartTime(v)}
                slotProps={{ textField: { sx: inputSx } }}
              />
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={v => setEndTime(v)}
                slotProps={{ textField: { sx: inputSx } }}
              />
            </Box>

            {/* Notify client button — only shown when editing */}
            {editingId && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#F8F7F4', borderRadius: '10px', p: 1.5, border: '1px solid #E8E4DC' }}>
                <AccessTimeRounded sx={{ fontSize: 16, color: '#9CA3AF' }} />
                <Typography sx={{ fontSize: 12, color: '#64748B', flex: 1 }}>
                  Send hearing reminder to client via email & WhatsApp
                </Typography>
                <HearingNotifyButton
                  hearingId={editingId}
                  clientName={editingData?.case_client_name || ''}
                  onSuccess={msg => { notify(msg); }}
                  onError={msg => { notify(msg, 'error'); }}
                />
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            {editingId && (
              <Button
                onClick={handleDelete}
                disabled={deleting}
                startIcon={deleting ? <CircularProgress size={14} sx={{ color: '#EF4444' }} /> : <DeleteRounded />}
                sx={{ textTransform: 'none', color: '#EF4444', borderRadius: '10px', border: '1px solid #FECACA', '&:hover': { bgcolor: '#FEF2F2' }, mr: 'auto' }}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            )}

            <Button onClick={handleClose} sx={{ textTransform: 'none', color: '#9CA3AF', fontWeight: 600, borderRadius: '10px' }}>
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={!title.trim() || saving}
              sx={{
                bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none',
                px: 3, borderRadius: '10px', fontWeight: 700,
                '&:hover': { bgcolor: '#1B3050' },
                '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
              }}
            >
              {saving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : editingId ? 'Update' : 'Add Hearing'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      {/* ── Snackbar ── */}
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

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#F8F7F4',
    '& fieldset': { borderColor: '#E8E4DC' },
    '&:hover fieldset': { borderColor: '#C9A84C' },
    '&.Mui-focused fieldset': { borderColor: '#0D1B2A', borderWidth: 1.5 },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0D1B2A' },
};
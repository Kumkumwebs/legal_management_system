import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Chip, Avatar, Dialog, DialogContent, DialogActions,
  IconButton, CircularProgress, Snackbar, Alert, Tooltip, Drawer,
} from '@mui/material';
import {
  AddRounded, CheckCircleRounded, RadioButtonUncheckedRounded,
  AccessTimeRounded, CloseRounded, AssignmentRounded, WarningRounded,
  SendRounded, PersonRounded, CalendarTodayRounded,
  GavelRounded, FilterListRounded, ArrowForwardRounded,
} from '@mui/icons-material';
import api from '../api/client';

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
const STATUS_COLORS   = { pending: '#6b7280', in_progress: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444' };
const STATUS_BG       = { pending: '#F3F4F6', in_progress: '#EFF6FF', completed: '#F0FDF4', cancelled: '#FEF2F2' };
const PRIORITY_DOT    = { low: '🟢', medium: '🟡', high: '🟠', urgent: '🔴' };

const TABS = [
  { value: 'all',         label: 'All',         color: '#0D1B2A' },
  { value: 'pending',     label: 'Pending',     color: '#6b7280' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'completed',   label: 'Completed',   color: '#22c55e' },
  { value: 'overdue',     label: 'Overdue',     color: '#ef4444' },
];

const safeList = (res) => {
  try {
    const d = res?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.results)) return d.results;
    return [];
  } catch { return []; }
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

export default function TasksPage() {
  const [tasks,        setTasks]        = useState([]);
  const [team,         setTeam]         = useState([]);
  const [cases,        setCases]        = useState([]);
  const [stats,        setStats]        = useState({ total: 0, pending: 0, in_progress: 0, completed: 0, overdue: 0 });
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('all');
  const [openCreate,   setOpenCreate]   = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment,      setComment]      = useState('');
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });

  const [form, setForm] = useState({
    title: '', description: '', assigned_to_id: '',
    priority: 'medium', due_date: '', case: '', status: 'pending'
  });

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [teamRes, caseRes] = await Promise.allSettled([
      api.get('/auth/users/'),
      api.get('/cases/'),
    ]);
    if (teamRes.status === 'fulfilled') setTeam(safeList(teamRes.value));
    if (caseRes.status === 'fulfilled') setCases(safeList(caseRes.value));

    try {
      const tRes = await api.get('/tasks/');
      const taskList = safeList(tRes);
      setTasks(taskList);
      try {
        const sRes = await api.get('/tasks/stats/');
        setStats(sRes.data);
      } catch {
        const now = new Date();
        setStats({
          total:       taskList.length,
          pending:     taskList.filter(t => t.status === 'pending').length,
          in_progress: taskList.filter(t => t.status === 'in_progress').length,
          completed:   taskList.filter(t => t.status === 'completed').length,
          overdue:     taskList.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length,
        });
      }
    } catch { /* tasks api not built yet */ }
    setLoading(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (tab === 'all')     return true;
    if (tab === 'overdue') return t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed';
    return t.status === tab;
  });

  const handleCreate = async () => {
    try {
      await api.post('/tasks/', form);
      notify('Task created successfully');
      setOpenCreate(false);
      setForm({ title: '', description: '', assigned_to_id: '', priority: 'medium', due_date: '', case: '', status: 'pending' });
      fetchAll();
    } catch (e) { notify(e?.response?.data?.detail || 'Failed to create task', 'error'); }
  };

  const handleComplete = async (task) => {
    try {
      if (task.status === 'completed') {
        await api.post(`/tasks/${task.id}/reopen/`);
        notify('Task reopened');
      } else {
        await api.post(`/tasks/${task.id}/complete/`);
        notify('Task marked complete');
      }
      fetchAll();
    } catch { notify('Failed to update task', 'error'); }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.post(`/tasks/${selectedTask.id}/add_comment/`, { text: comment });
      setComment('');
      const res = await api.get(`/tasks/${selectedTask.id}/`);
      setSelectedTask(res.data);
      notify('Comment added');
    } catch { notify('Failed to add comment', 'error'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      notify('Status updated');
      fetchAll();
      if (selectedTask?.id === taskId) {
        const res = await api.get(`/tasks/${taskId}/`);
        setSelectedTask(res.data);
      }
    } catch { notify('Failed to update', 'error'); }
  };

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
        <Box sx={{ position: 'absolute', bottom: -30, left: 140, width: 130, height: 130, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'rgba(201,168,76,0.15)', borderRadius: '9px', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AssignmentRounded sx={{ color: '#C9A84C', fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase' }}>
                HP HCMS · Tasks
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#fff', lineHeight: 1.15, mb: 0.5, letterSpacing: '-0.01em' }}>
              Task Management
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
              Assign, track and complete tasks across your firm
            </Typography>
          </Box>
          <Button startIcon={<AddRounded />} onClick={() => setOpenCreate(true)} sx={{
            bgcolor: '#C9A84C', color: '#0D1B2A', borderRadius: '12px', px: 3, py: 1.4,
            fontWeight: 800, textTransform: 'none', fontSize: 14,
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
            '&:hover': { bgcolor: '#DFC070', transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(201,168,76,0.5)' },
            transition: 'all 0.2s',
          }}>
            New Task
          </Button>
        </Box>

        {/* Stats row inside header */}
        <Box sx={{ display: 'flex', gap: 4, mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',       value: stats.total,       color: '#fff' },
            { label: 'Pending',     value: stats.pending,     color: '#FCD34D' },
            { label: 'In Progress', value: stats.in_progress, color: '#60A5FA' },
            { label: 'Completed',   value: stats.completed,   color: '#34D399' },
            { label: 'Overdue',     value: stats.overdue,     color: '#F87171' },
          ].map(s => (
            <Box key={s.label}>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, mt: 0.3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ FILTER TABS ══ */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
        {TABS.map(t => {
          const count = t.value === 'all' ? stats.total : t.value === 'overdue' ? stats.overdue : stats[t.value] ?? 0;
          const active = tab === t.value;
          return (
            <Box key={t.value} onClick={() => setTab(t.value)} sx={{
              px: 2, py: 0.8, borderRadius: '20px', cursor: 'pointer',
              bgcolor: active ? t.color : '#fff',
              border: `1px solid ${active ? t.color : 'rgba(0,0,0,0.08)'}`,
              display: 'flex', alignItems: 'center', gap: 1,
              boxShadow: active ? `0 4px 12px ${t.color}30` : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.2s',
              '&:hover': { borderColor: t.color, transform: 'translateY(-1px)' },
            }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : '#64748B' }}>{t.label}</Typography>
              {count > 0 && (
                <Box sx={{ px: 1, py: 0.1, borderRadius: '10px', bgcolor: active ? 'rgba(255,255,255,0.2)' : t.color + '15' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: active ? '#fff' : t.color }}>{count}</Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* ══ TASK LIST ══ */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F5F4F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, color: '#0D1B2A', fontSize: 14 }}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <FilterListRounded sx={{ fontSize: 16, color: '#9CA3AF' }} />
            <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>
              {TABS.find(t => t.value === tab)?.label}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress sx={{ color: '#0D1B2A' }} size={28} /></Box>
        ) : filteredTasks.length === 0 ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Box sx={{ width: 64, height: 64, bgcolor: '#F5F4F0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <AssignmentRounded sx={{ fontSize: 30, color: '#D0CEC7' }} />
            </Box>
            <Typography sx={{ color: '#0D1B2A', fontSize: 15, fontWeight: 600, mb: 0.5 }}>No tasks here</Typography>
            <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 3 }}>
              {tab === 'all' ? 'Create your first task to get started' : `No ${tab.replace('_', ' ')} tasks`}
            </Typography>
            <Button onClick={() => setOpenCreate(true)} startIcon={<AddRounded />}
              sx={{ bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', px: 3, textTransform: 'none', fontWeight: 700 }}>
              Create Task
            </Button>
          </Box>
        ) : (
          filteredTasks.map((task, idx) => (
            <TaskRow key={task.id} task={task} onComplete={handleComplete}
              onClick={() => setSelectedTask(task)} isLast={idx === filteredTasks.length - 1} />
          ))
        )}
      </Box>

      {/* ══ CREATE TASK DIALOG ══ */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#0D1B2A', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>Create New Task</Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mt: 0.2 }}>Fill in the details below</Typography>
          </Box>
          <IconButton onClick={() => setOpenCreate(false)} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
            <CloseRounded />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Task Title *" fullWidth value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} sx={inputSx} />
          <TextField label="Description" fullWidth multiline rows={3} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} sx={inputSx} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Assign To</InputLabel>
              <Select value={form.assigned_to_id} label="Assign To"
                onChange={e => setForm(p => ({ ...p, assigned_to_id: e.target.value }))}>
                <MenuItem value=""><em>Unassigned</em></MenuItem>
                {team.map(m => <MenuItem key={m.id} value={m.id}>{m.username || m.email}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Priority</InputLabel>
              <Select value={form.priority} label="Priority"
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {['low', 'medium', 'high', 'urgent'].map(p => (
                  <MenuItem key={p} value={p}>{PRIORITY_DOT[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Due Date" type="date" fullWidth value={form.due_date}
              onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
              InputLabelProps={{ shrink: true }} sx={inputSx} />
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Related Case</InputLabel>
              <Select value={form.case} label="Related Case"
                onChange={e => setForm(p => ({ ...p, case: e.target.value }))}>
                <MenuItem value=""><em>None</em></MenuItem>
                {cases.map(c => <MenuItem key={c.id} value={c.id}>{c.title || c.case_number || `Case #${c.id}`}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setOpenCreate(false)}
            sx={{ textTransform: 'none', color: '#9CA3AF', fontWeight: 600, borderRadius: '10px' }}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!form.title} sx={{
            bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', px: 3.5,
            borderRadius: '10px', fontWeight: 700,
            '&:hover': { bgcolor: '#1B3050' },
            '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
          }}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ TASK DETAIL DRAWER ══ */}
      <Drawer anchor="right" open={!!selectedTask} onClose={() => setSelectedTask(null)}
        PaperProps={{ sx: { width: { xs: '100vw', sm: 480 }, bgcolor: '#F5F4F0' } }}>
        {selectedTask && (() => {
          const task = selectedTask;
          const isCompleted = task.status === 'completed';
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
          const pc = PRIORITY_COLORS[task.priority] || '#6b7280';
          const sc = STATUS_COLORS[task.status] || '#6b7280';

          return (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Drawer header */}
              <Box sx={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B3050 100%)', px: 3, pt: 3, pb: 3, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.12)' }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: pc + '20', border: `1px solid ${pc}35` }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, color: pc, textTransform: 'capitalize' }}>{task.priority}</Typography>
                    </Box>
                    <Box sx={{ px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: sc + '20', border: `1px solid ${sc}35` }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, color: sc, textTransform: 'capitalize' }}>{task.status.replace('_', ' ')}</Typography>
                    </Box>
                    {isOverdue && (
                      <Box sx={{ px: 1.5, py: 0.4, borderRadius: '20px', bgcolor: '#ef444420', border: '1px solid #ef444435', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WarningRounded sx={{ fontSize: 10, color: '#ef4444' }} />
                        <Typography sx={{ fontSize: 10, fontWeight: 800, color: '#ef4444' }}>Overdue</Typography>
                      </Box>
                    )}
                  </Box>
                  <IconButton onClick={() => setSelectedTask(null)} size="small"
                    sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    <CloseRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.3, position: 'relative', zIndex: 1, textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.6 : 1 }}>
                  {task.title}
                </Typography>
                {task.case_title && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 1.5, position: 'relative', zIndex: 1 }}>
                    <GavelRounded sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{task.case_title}</Typography>
                  </Box>
                )}
              </Box>

              {/* Scrollable body */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: 4 },
              }}>
                {/* Meta grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
                  {[
                    { icon: <PersonRounded sx={{ fontSize: 13, color: '#0D1B2A' }} />, label: 'Assigned To', value: task.assigned_to?.username || task.assigned_to?.email || 'Unassigned' },
                    { icon: <CalendarTodayRounded sx={{ fontSize: 13, color: isOverdue ? '#ef4444' : '#0D1B2A' }} />, label: 'Due Date', value: task.due_date ? new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No deadline' },
                    { icon: <PersonRounded sx={{ fontSize: 13, color: '#0D1B2A' }} />, label: 'Created By', value: task.created_by?.username || task.created_by?.email || '—' },
                    { icon: <CalendarTodayRounded sx={{ fontSize: 13, color: '#0D1B2A' }} />, label: 'Created On', value: new Date(task.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                  ].map((item, i) => (
                    <Box key={i} sx={{ bgcolor: '#fff', borderRadius: '12px', p: 1.5, border: '1px solid #F0EDE5' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                        {item.icon}
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: isOverdue && item.label === 'Due Date' ? '#ef4444' : '#0D1B2A' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Description */}
                {task.description && (
                  <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 2, mb: 2.5, border: '1px solid #F0EDE5' }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>Description</Typography>
                    <Typography sx={{ fontSize: 13, color: '#3A3A35', lineHeight: 1.7 }}>{task.description}</Typography>
                  </Box>
                )}

                {/* Status update */}
                <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 2, mb: 2.5, border: '1px solid #F0EDE5' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>Update Status</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['pending', 'in_progress', 'completed', 'cancelled'].map(s => {
                      const active = task.status === s;
                      const c = STATUS_COLORS[s];
                      return (
                        <Box key={s} onClick={() => handleStatusChange(task.id, s)} sx={{
                          px: 2, py: 0.7, borderRadius: '20px', cursor: 'pointer',
                          bgcolor: active ? c : STATUS_BG[s],
                          border: `1px solid ${active ? c : c + '40'}`,
                          transition: 'all 0.15s',
                          '&:hover': { transform: 'translateY(-1px)', boxShadow: `0 4px 10px ${c}25` },
                        }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : c, textTransform: 'capitalize' }}>
                            {s.replace('_', ' ')}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>

                {/* Comments */}
                <Box sx={{ bgcolor: '#fff', borderRadius: '12px', p: 2, border: '1px solid #F0EDE5' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
                    Comments · {task.comments?.length || 0}
                  </Typography>
                  <Box sx={{ maxHeight: 220, overflowY: 'auto', mb: 2,
                    '&::-webkit-scrollbar': { width: 3 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: '#E2E8F0', borderRadius: 4 },
                  }}>
                    {!(task.comments?.length) ? (
                      <Typography sx={{ fontSize: 12, color: '#C0BCBA', fontStyle: 'italic', textAlign: 'center', py: 2 }}>No comments yet</Typography>
                    ) : (
                      task.comments.map(c => (
                        <Box key={c.id} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: '#0D1B2A', flexShrink: 0 }}>
                            {(c.author?.username || '?')[0].toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ bgcolor: '#F8F7F4', borderRadius: '4px 12px 12px 12px', px: 1.5, py: 1.2, border: '1px solid #ECEAE5' }}>
                              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#0D1B2A', mb: 0.3 }}>{c.author?.username}</Typography>
                              <Typography sx={{ fontSize: 13, color: '#3A3A35', lineHeight: 1.5 }}>{c.text}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 10, color: '#C0BCBA', mt: 0.4, pl: 0.5 }}>
                              {new Date(c.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField placeholder="Write a comment…" size="small" fullWidth value={comment}
                      onChange={e => setComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#F8F7F4', '& fieldset': { borderColor: '#E8E4DC' }, '&.Mui-focused fieldset': { borderColor: '#0D1B2A' } } }} />
                    <IconButton onClick={handleAddComment} disabled={!comment.trim()}
                      sx={{ bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', width: 40, height: 40, flexShrink: 0, '&:hover': { bgcolor: '#1B3050' }, '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' } }}>
                      <SendRounded sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })()}
      </Drawer>

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

// ── Task Row ──
const TaskRow = ({ task, onComplete, onClick, isLast }) => {
  const isOverdue   = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const isCompleted = task.status === 'completed';
  const pc = PRIORITY_COLORS[task.priority] || '#6b7280';

  return (
    <Box onClick={onClick} sx={{
      display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2.5,
      borderBottom: isLast ? 'none' : '1px solid #F5F4F0',
      cursor: 'pointer', transition: 'background 0.12s',
      '&:hover': { bgcolor: '#FAFAF8' },
    }}>
      <IconButton size="small" onClick={e => { e.stopPropagation(); onComplete(task); }}
        sx={{ color: isCompleted ? '#22c55e' : '#D1D5DB', '&:hover': { color: '#22c55e', bgcolor: '#F0FDF4' }, flexShrink: 0 }}>
        {isCompleted ? <CheckCircleRounded sx={{ fontSize: 20 }} /> : <RadioButtonUncheckedRounded sx={{ fontSize: 20 }} />}
      </IconButton>

      {/* Priority bar */}
      <Box sx={{ width: 3, height: 32, borderRadius: 2, bgcolor: pc, flexShrink: 0, opacity: isCompleted ? 0.3 : 1 }} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: 14, fontWeight: 600,
          color: isCompleted ? '#9CA3AF' : '#0D1B2A',
          textDecoration: isCompleted ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {task.title}
        </Typography>
        {task.case_title && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
            <GavelRounded sx={{ fontSize: 11, color: '#9CA3AF' }} />
            <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>{task.case_title}</Typography>
          </Box>
        )}
      </Box>

      {task.assigned_to && (
        <Tooltip title={task.assigned_to.username || task.assigned_to.email || ''}>
          <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: '#1a2e4a', flexShrink: 0 }}>
            {(task.assigned_to.username || task.assigned_to.email || '?')[0].toUpperCase()}
          </Avatar>
        </Tooltip>
      )}

      {/* Priority pill */}
      <Box sx={{ px: 1.5, py: 0.3, borderRadius: '20px', bgcolor: pc + '12', border: `1px solid ${pc}25`, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: pc, textTransform: 'capitalize' }}>{task.priority}</Typography>
      </Box>

      {task.due_date && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <AccessTimeRounded sx={{ fontSize: 12, color: isOverdue ? '#ef4444' : '#9CA3AF' }} />
          <Typography sx={{ fontSize: 11, color: isOverdue ? '#ef4444' : '#9CA3AF', fontWeight: isOverdue ? 700 : 400 }}>
            {new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </Typography>
        </Box>
      )}

      <ArrowForwardRounded sx={{ fontSize: 14, color: '#D1D5DB', flexShrink: 0 }} />
    </Box>
  );
};
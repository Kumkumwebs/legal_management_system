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
import PageHero from '../components/PageHero';

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
const STATUS_COLORS   = { pending: '#6b7280', in_progress: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444' };
const STATUS_BG       = { pending: '#F3F4F6', in_progress: '#EFF6FF', completed: '#F0FDF4', cancelled: '#FEF2F2' };

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
  const [form, setForm] = useState({ title: '', description: '', assigned_to_id: '', priority: 'medium', due_date: '', case: '', status: 'pending' });

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [teamRes, caseRes] = await Promise.allSettled([api.get('/auth/users/'), api.get('/cases/')]);
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
          total: taskList.length,
          pending: taskList.filter(t => t.status === 'pending').length,
          in_progress: taskList.filter(t => t.status === 'in_progress').length,
          completed: taskList.filter(t => t.status === 'completed').length,
          overdue: taskList.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length,
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
      if (task.status === 'completed') { await api.post(`/tasks/${task.id}/reopen/`); notify('Task reopened'); }
      else { await api.post(`/tasks/${task.id}/complete/`); notify('Task marked complete'); }
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

      {/* ✅ HERO — now uses theme colors */}
      <PageHero
        label="HP HCMS · Tasks"
        icon={<AssignmentRounded />}
        title="Task Management"
        subtitle="Assign, track and complete tasks across your firm"
        action={
          <Button startIcon={<AddRounded />} onClick={() => setOpenCreate(true)} sx={{
            bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', borderRadius: '12px', px: 3, py: 1.4,
            fontWeight: 800, textTransform: 'none', fontSize: 14,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'translateY(-1px)' },
            transition: 'all 0.2s',
          }}>
            New Task
          </Button>
        }
      />

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',       value: stats.total,       color: '#0D1B2A', bg: '#F1F5F9' },
          { label: 'Pending',     value: stats.pending,     color: '#6b7280', bg: '#F3F4F6' },
          { label: 'In Progress', value: stats.in_progress, color: '#3b82f6', bg: '#EFF6FF' },
          { label: 'Completed',   value: stats.completed,   color: '#22c55e', bg: '#F0FDF4' },
          { label: 'Overdue',     value: stats.overdue,     color: '#ef4444', bg: '#FEF2F2' },
        ].map(s => (
          <Box key={s.label} sx={{ px: 2.5, py: 1.5, bgcolor: s.bg, borderRadius: '12px', border: `1px solid ${s.color}20`, minWidth: 80 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: 10, color: s.color, fontWeight: 700, mt: 0.3, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>{s.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* Filter tabs */}
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
              transition: 'all 0.2s', '&:hover': { borderColor: t.color, transform: 'translateY(-1px)' },
            }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : '#64748B' }}>{t.label}</Typography>
              {count > 0 && (
                <Box sx={{ px: 1, borderRadius: '10px', bgcolor: active ? 'rgba(255,255,255,0.2)' : t.color + '15' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: active ? '#fff' : t.color }}>{count}</Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Task List */}
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #F5F4F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography sx={{ fontWeight: 700, color: '#0D1B2A', fontSize: 14 }}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <FilterListRounded sx={{ fontSize: 16, color: '#9CA3AF' }} />
            <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{TABS.find(t => t.value === tab)?.label}</Typography>
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
            {tab === 'all' && (
              <Button startIcon={<AddRounded />} onClick={() => setOpenCreate(true)} sx={{ bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
                Create Task
              </Button>
            )}
          </Box>
        ) : (
          filteredTasks.map((task, idx) => {
            const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
            const assignee = team.find(u => u.id === task.assigned_to || u.id === task.assigned_to_id);
            return (
              <Box key={task.id} sx={{ px: 3, py: 2, borderBottom: idx < filteredTasks.length - 1 ? '1px solid #F5F4F0' : 'none', display: 'flex', alignItems: 'flex-start', gap: 2, '&:hover': { bgcolor: '#FAFAFA' }, cursor: 'pointer', transition: 'background 0.15s' }}>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleComplete(task); }} sx={{ mt: 0.25, p: 0.25, color: task.status === 'completed' ? '#22c55e' : '#CBD5E1', '&:hover': { color: '#22c55e' } }}>
                  {task.status === 'completed' ? <CheckCircleRounded sx={{ fontSize: 20 }} /> : <RadioButtonUncheckedRounded sx={{ fontSize: 20 }} />}
                </IconButton>
                <Box sx={{ flex: 1, minWidth: 0 }} onClick={() => setSelectedTask(task)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14, color: task.status === 'completed' ? '#9CA3AF' : '#0D1B2A', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                      {task.title}
                    </Typography>
                    <Chip label={task.priority} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: PRIORITY_COLORS[task.priority] + '18', color: PRIORITY_COLORS[task.priority], border: 'none' }} />
                    {isOverdue && <Chip icon={<WarningRounded sx={{ fontSize: '10px !important' }} />} label="Overdue" size="small" sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: '#FEF2F2', color: '#ef4444' }} />}
                  </Box>
                  {task.description && <Typography sx={{ fontSize: 12, color: '#9CA3AF', mb: 0.75 }} noWrap>{task.description}</Typography>}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    {assignee && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Avatar sx={{ width: 16, height: 16, fontSize: 9, bgcolor: '#0D1B2A' }}>{(assignee.username || assignee.first_name || 'U')[0].toUpperCase()}</Avatar>
                        <Typography sx={{ fontSize: 11, color: '#6b7280' }}>{assignee.username || assignee.first_name}</Typography>
                      </Box>
                    )}
                    {task.due_date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarTodayRounded sx={{ fontSize: 11, color: isOverdue ? '#ef4444' : '#9CA3AF' }} />
                        <Typography sx={{ fontSize: 11, color: isOverdue ? '#ef4444' : '#6b7280', fontWeight: isOverdue ? 700 : 400 }}>
                          {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </Typography>
                      </Box>
                    )}
                    <Chip label={task.status.replace('_', ' ')} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: STATUS_BG[task.status], color: STATUS_COLORS[task.status] }} />
                  </Box>
                </Box>
                <IconButton size="small" onClick={() => setSelectedTask(task)} sx={{ color: '#CBD5E1', '&:hover': { color: '#0D1B2A' } }}>
                  <ArrowForwardRounded sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            );
          })
        )}
      </Box>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #F5F4F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0D1B2A' }}>New Task</Typography>
          <IconButton size="small" onClick={() => setOpenCreate(false)}><CloseRounded sx={{ fontSize: 18 }} /></IconButton>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Task Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} sx={inputSx} />
            <TextField fullWidth label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={2} sx={inputSx} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} label="Priority" onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {['low', 'medium', 'high', 'urgent'].map(p => <MenuItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField fullWidth label="Due Date" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} InputLabelProps={{ shrink: true }} sx={inputSx} />
            </Box>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Assign To</InputLabel>
              <Select value={form.assigned_to_id} label="Assign To" onChange={e => setForm({ ...form, assigned_to_id: e.target.value })}>
                <MenuItem value="">— Unassigned —</MenuItem>
                {team.map(u => <MenuItem key={u.id} value={u.id}>{u.username || u.first_name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel>Related Case</InputLabel>
              <Select value={form.case} label="Related Case" onChange={e => setForm({ ...form, case: e.target.value })}>
                <MenuItem value="">— No Case —</MenuItem>
                {cases.map(c => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: '10px', textTransform: 'none', color: '#64748B', border: '1px solid #E2E8F0' }}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!form.title.trim()} sx={{ borderRadius: '10px', textTransform: 'none', bgcolor: '#0D1B2A', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#1B2D41' }, '&.Mui-disabled': { bgcolor: '#CBD5E1', color: '#fff' } }}>
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Detail Drawer */}
      <Drawer anchor="right" open={!!selectedTask} onClose={() => setSelectedTask(null)} PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 3 } }}>
        {selectedTask && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0D1B2A', flex: 1, mr: 1 }}>{selectedTask.title}</Typography>
              <IconButton size="small" onClick={() => setSelectedTask(null)}><CloseRounded /></IconButton>
            </Box>
            {selectedTask.description && <Typography sx={{ color: '#64748B', fontSize: 14, mb: 2 }}>{selectedTask.description}</Typography>}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {['pending', 'in_progress', 'completed'].map(s => (
                <Chip key={s} label={s.replace('_', ' ')} onClick={() => handleStatusChange(selectedTask.id, s)} sx={{ cursor: 'pointer', fontWeight: 700, fontSize: 11, bgcolor: selectedTask.status === s ? STATUS_COLORS[s] : STATUS_BG[s], color: selectedTask.status === s ? '#fff' : STATUS_COLORS[s] }} />
              ))}
            </Box>
            <Box sx={{ bgcolor: '#F8F7F4', borderRadius: '12px', p: 2, mb: 3 }}>
              {[
                { label: 'Priority', value: selectedTask.priority },
                { label: 'Due Date', value: selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString('en-IN') : '—' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                  <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>{label}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#0D1B2A', fontWeight: 600 }}>{value}</Typography>
                </Box>
              ))}
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#0D1B2A', mb: 1.5 }}>Comments ({(selectedTask.comments || []).length})</Typography>
            <Box sx={{ mb: 2, maxHeight: 200, overflowY: 'auto' }}>
              {(selectedTask.comments || []).map((c, i) => (
                <Box key={i} sx={{ p: 1.5, bgcolor: '#F8F7F4', borderRadius: '10px', mb: 1 }}>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF', mb: 0.5 }}>{c.user?.username || 'User'}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#0D1B2A' }}>{c.text}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField fullWidth size="small" placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddComment()} sx={inputSx} />
              <IconButton onClick={handleAddComment} disabled={!comment.trim()} sx={{ bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', '&:hover': { bgcolor: '#1B2D41' }, '&.Mui-disabled': { bgcolor: '#CBD5E1' } }}>
                <SendRounded sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Drawer>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
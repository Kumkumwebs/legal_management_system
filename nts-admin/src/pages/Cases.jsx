import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, CircularProgress, Typography, Grid, InputAdornment,
} from '@mui/material';
import {
  AddRounded, GavelRounded, CloseRounded, SearchRounded,
  CalendarMonthRounded, BusinessRounded, PeopleRounded,
  CategoryRounded, AccountBalanceRounded, FlagRounded,
} from '@mui/icons-material';
import { casesAPI, clientsAPI, firmsAPI } from '../api/services';
import { PageHeader, EmptyState, SectionCard, StatusChip } from './UI';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";


const EMPTY_FORM = { title: '', case_number: '', client: '', status: 'open', description: '', next_hearing_date: '', case_type: '', court_name: '', firm: '' };

const CASE_TYPES = ['Civil', 'Criminal', 'Family', 'Corporate', 'Tax', 'Labour', 'Consumer', 'Constitutional', 'Property', 'Other'];

// ── Status colour map ──
const STATUS_MAP = {
  open: { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' },
  closed: { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', dot: '#22C55E' },
  pending: { bg: '#FEF9C3', color: '#A16207', border: '#FDE68A', dot: '#F59E0B' },
};

// ── Hearing date badge ──
const HearingBadge = ({ date }) => {
  if (!date) return <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const isPast = d < today;
  const isToday = d.getTime() === today.getTime();
  const style = isPast
    ? { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' }
    : isToday
      ? { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' }
      : { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: '7px', background: style.bg, border: `1px solid ${style.border}` }}>
      <CalendarMonthRounded sx={{ fontSize: 12, color: style.color }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: style.color, whiteSpace: 'nowrap' }}>
        {isToday ? 'Today' : new Date(date).toLocaleDateString('en-IN')}
      </Typography>
    </Box>
  );
};

// ── Case type badge ──
const TypeBadge = ({ type }) => {
  if (!type) return <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>;
  return (
    <Box sx={{ display: 'inline-block', px: 1.2, py: 0.35, borderRadius: '7px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#1D4ED8' }}>{type}</Typography>
    </Box>
  );
};

// ── Inline status pill ──
const StatusPill = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.open;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: '7px', background: s.bg, border: `1px solid ${s.border}` }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: s.color, textTransform: 'capitalize' }}>{status || 'open'}</Typography>
    </Box>
  );
};

// ── Styled dialog field ──
const DField = ({ label, icon, children, ...props }) => (
  <Box>
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.7 }}>
      {label}
    </Typography>
    <TextField fullWidth size="small" {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '10px', background: '#F9F6F0', fontSize: '0.875rem',
          '& fieldset': { borderColor: '#E2E8F0', borderWidth: '1.5px' },
          '&:hover fieldset': { borderColor: '#C9A84C' },
          '&.Mui-focused fieldset': { borderColor: '#C9A84C', borderWidth: '2px' },
        },
      }}
      InputProps={{ startAdornment: icon ? <InputAdornment position="start"><Box sx={{ color: '#C9A84C', display: 'flex' }}>{icon}</Box></InputAdornment> : undefined, ...props.InputProps }}
    >
      {children}
    </TextField>
  </Box>
);

export default function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [caseRes, clientRes, firmRes] = await Promise.allSettled([
        casesAPI.getAll(),
        clientsAPI.getAll(),
        firmsAPI.getAll()
      ]);

      if (caseRes.status === 'fulfilled')
        setCases(caseRes.value.data?.results ?? caseRes.value.data ?? []);

      if (clientRes.status === 'fulfilled')
        setClients(clientRes.value.data?.results ?? clientRes.value.data ?? []);

      if (firmRes.status === 'fulfilled')
        setFirms(firmRes.value.data?.results ?? firmRes.value.data ?? []);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Input Change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Edit
  const handleEdit = (caseItem) => {
    setEditingCase(caseItem);

    setForm({
      title: caseItem.title || '',
      case_number: caseItem.case_number || '',
      client: caseItem.client || '',
      firm: caseItem.firm || '',
      status: caseItem.status || 'open',
      description: caseItem.description || '',
      next_hearing_date: caseItem.next_hearing_date || '',
      case_type: caseItem.case_type || '',
      court_name: caseItem.court_name || '',
    });

    setDialog(true);
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this case?")) return;

    try {
      await casesAPI.delete(id);
      setCases(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Save (CREATE + UPDATE)
  const handleSave = async () => {
    setSaving(true);

    try {
      const payload = {
        title: form.title?.trim(),
        case_number: form.case_number?.trim(),
        case_type: form.case_type?.trim(),
        court_name: form.court_name?.trim(),
        description: form.description?.trim() || '',
        status: form.status || 'open',

        firm: form.firm ? Number(form.firm) : null,
        client: form.client ? Number(form.client) : null,

        next_hearing_date: form.next_hearing_date || null,
      };

      console.log("Payload:", payload); // 🔥 CHECK THIS

      if (editingCase) {
        await casesAPI.update(editingCase.id, payload);
      } else {
        await casesAPI.create(payload);
      }

      await fetchData();
      setDialog(false);
      setForm(EMPTY_FORM);
      setEditingCase(null);

    } catch (e) {
      console.error("API ERROR:", e.response?.data);
    } finally {
      setSaving(false);
    }
  };
  const getFirmName = (id) => { if (!id) return null; return firms.find((f) => f.id === id || String(f.id) === String(id))?.name ?? null; };
  const getClientName = (id) => { if (!id) return null; return clients.find((c) => c.id === id || String(c.id) === String(id))?.name ?? null; };

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = (c.title || '').toLowerCase().includes(q) || (c.case_number || '').toLowerCase().includes(q) || (c.client_name || getClientName(c.client) || '').toLowerCase().includes(q) || (c.case_type || '').toLowerCase().includes(q) || (c.court_name || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCount = cases.filter((c) => c.status === 'open').length;
  const closedCount = cases.filter((c) => c.status === 'closed').length;

  return (
    <Box sx={{ pb: 2 }}>
      <PageHeader
        title="Cases"
        subtitle={`${cases.length} total case${cases.length !== 1 ? 's' : ''}`}
        action={
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => {
              setEditingCase(null);
              setForm(EMPTY_FORM);
              setDialog(true);
            }}
          >
            New Case
          </Button>
        }
      />

      {/* ── Mini summary pills ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: cases.length, bg: '#F1F5F9', color: '#475569' },
          { label: 'Open', value: openCount, bg: '#DBEAFE', color: '#1D4ED8' },
          { label: 'Closed', value: closedCount, bg: '#DCFCE7', color: '#15803D' },
        ].map(({ label, value, bg, color }) => (
          <Box key={label} sx={{ px: 2, py: 1, borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</Typography>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      <SectionCard>
        {/* ── Toolbar ── */}
        <Box sx={{ p: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by title, number, client, court..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flex: 1, minWidth: 220,
              '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#F9F6F0', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: '#C9A84C' }, '&.Mui-focused fieldset': { borderColor: '#C9A84C' } },
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 17, color: '#94A3B8' }} /></InputAdornment> }}
          />
          <TextField select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            size="small" sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#F9F6F0', '& fieldset': { borderColor: '#E2E8F0' } } }}>
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </Box>

        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}><CircularProgress sx={{ color: '#C9A84C' }} /></Box>
        ) : filtered.length === 0 ? (
          <EmptyState icon="⚖️" title="No cases found" description="Create your first case to get started" />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: '#F9F6F0' }}>
                  {['Case No.', 'Title', 'Client', 'Firm', 'Type', 'Court', 'Status', 'Next Hearing', 'Filed', 'Actions'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748B', borderBottom: '2px solid #E2E8F0', py: 1.5, whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} hover sx={{ '&:hover': { background: '#F9F6F0' }, '& td': { borderBottom: '1px solid #F8FAFC', py: 1.4 } }}>

                    {/* Case No */}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#C9A84C', fontFamily: 'monospace' }}>
                        {c.case_number || `#${c.id}`}
                      </Typography>
                    </TableCell>

                    {/* Title — clickable */}
                    <TableCell onClick={() => navigate(`/cases/${c.id}/hearings`)}
                      sx={{ cursor: 'pointer', maxWidth: 200 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '8px', background: '#EFF6FF', border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <CalendarMonthIcon sx={{ fontSize: 14, color: '#1D4ED8' }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { color: '#C9A84C', textDecoration: 'underline' } }}>
                          {c.title || c.case_title || 'Untitled'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Client */}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
                        {c.client_name || getClientName(c.client) || '—'}
                      </Typography>
                    </TableCell>

                    {/* Firm */}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>
                        {c.firm_name || getFirmName(c.firm) || '—'}
                      </Typography>
                    </TableCell>

                    {/* Case type */}
                    <TableCell><TypeBadge type={c.case_type} /></TableCell>

                    {/* Court */}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.court_name || '—'}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell><StatusPill status={c.status} /></TableCell>

                    {/* Next hearing */}
                    <TableCell><HearingBadge date={c.next_hearing_date} /></TableCell>

                    {/* Filed date */}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>

                        {/* EDIT */}
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(c)}
                          sx={{
                            color: '#1D4ED8',
                            '&:hover': { background: '#EFF6FF' }
                          }}
                        >
                          ✏️
                        </IconButton>

                        {/* DELETE */}
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(c.id)}
                          sx={{
                            color: '#DC2626',
                            '&:hover': { background: '#FEE2E2' }
                          }}
                        >
                          🗑️
                        </IconButton>

                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {/* ── Create Case Dialog ── */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden' } }}>

        {/* Gold stripe */}
        <Box sx={{ height: '3px', background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #E8C97A 70%, transparent)' }} />

        <DialogTitle sx={{ pb: 0, pt: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: '#C9A84C18', border: '1px solid #C9A84C30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GavelRounded sx={{ fontSize: 19, color: '#C9A84C' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0D1B2A' }}>Create New Case</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mt: 0.2 }}>Fill in the case details below</Typography>
            </Box>
          </Box>
          <Box onClick={() => setDialog(false)} sx={{ width: 30, height: 30, borderRadius: '8px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', mt: 0.5, '&:hover': { background: '#E2E8F0' } }}>
            <CloseRounded sx={{ fontSize: 16, color: '#64748B' }} />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DField label="Case Title *" name="title" value={form.title} onChange={handleChange}
                icon={<GavelRounded sx={{ fontSize: 17 }} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Case Number" name="case_number" value={form.case_number} onChange={handleChange}
                icon={<FlagRounded sx={{ fontSize: 17 }} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Status" name="status" value={form.status} onChange={handleChange} select>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </DField>
            </Grid>
            <Grid item xs={12}>
              <DField label="Assign Firm *" name="firm" value={form.firm} onChange={handleChange} select
                icon={<BusinessRounded sx={{ fontSize: 17 }} />}>
                <MenuItem value="">— Select Firm —</MenuItem>
                {firms.map((f) => <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>)}
              </DField>
            </Grid>
            <Grid item xs={12}>
              <DField label="Assign Client" name="client" value={form.client} onChange={handleChange} select
                icon={<PeopleRounded sx={{ fontSize: 17 }} />}>
                <MenuItem value="">— Select Client —</MenuItem>
                {clients.map((cl) => <MenuItem key={cl.id} value={cl.id}>{cl.name || `${cl.first_name || ''} ${cl.last_name || ''}`.trim()}</MenuItem>)}
              </DField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Case Type *" name="case_type" value={form.case_type} onChange={handleChange} select
                icon={<CategoryRounded sx={{ fontSize: 17 }} />}>
                <MenuItem value="">— Select Type —</MenuItem>
                {CASE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </DField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Court Name *" name="court_name" value={form.court_name} onChange={handleChange}
                icon={<AccountBalanceRounded sx={{ fontSize: 17 }} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Next Hearing Date" name="next_hearing_date" type="date" value={form.next_hearing_date} onChange={handleChange}
                InputLabelProps={{ shrink: true }} icon={<CalendarMonthRounded sx={{ fontSize: 17 }} />} />
            </Grid>
            <Grid item xs={12}>
              <DField label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={3} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDialog(false)} sx={{ borderRadius: '10px', color: '#64748B', border: '1px solid #E2E8F0', px: 2.5, fontWeight: 600 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained"
            disabled={saving || !form.title || !form.case_type || !form.court_name || !form.firm}
            sx={{ borderRadius: '10px', px: 3, fontWeight: 700, background: '#0D1B2A', '&:hover': { background: '#1B2D41' }, '&.Mui-disabled': { background: '#E2E8F0', color: '#94A3B8' } }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Create Case'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
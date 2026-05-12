import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, CircularProgress, Typography, Grid, InputAdornment,
  Tooltip, Snackbar, Alert,
} from '@mui/material';
import {
  AddRounded, GavelRounded, CloseRounded, SearchRounded,
  CalendarMonthRounded, BusinessRounded, PeopleRounded,
  CategoryRounded, AccountBalanceRounded, FlagRounded,
  EditRounded, DeleteRounded,
} from '@mui/icons-material';
import { casesAPI, clientsAPI, firmsAPI } from '../api/services';
import { PageHeader, EmptyState, SectionCard } from './UI';
import { useNavigate } from 'react-router-dom';

/* ─── Design tokens ──────────────────────────────── */
const T = {
  navy:   '#0D1B2A',
  navy2:  '#1B2D41',
  gold:   '#C9A84C',
  goldL:  '#E8C97A',
  cream:  '#F9F6F0',
  slate:  '#64748B',
  border: '#E8EDF2',
  white:  '#FFFFFF',
  red:    '#DC2626',
  green:  '#16A34A',
};

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    background: T.cream,
    fontSize: '0.88rem',
    transition: 'box-shadow 0.2s',
    '& fieldset': { borderColor: T.border, borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: T.gold },
    '&.Mui-focused fieldset': { borderColor: T.gold, borderWidth: '2px' },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${T.gold}22` },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: T.gold },
};

const EMPTY_FORM = {
  title: '', case_number: '', client: '', status: 'open',
  description: '', next_hearing_date: '', case_type: '', court_name: '', firm: '',
};

const CASE_TYPES = ['Civil', 'Criminal', 'Family', 'Corporate', 'Tax', 'Labour', 'Consumer', 'Constitutional', 'Property', 'Other'];

const STATUS_MAP = {
  open:    { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6', label: 'Open' },
  closed:  { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0', dot: '#22C55E', label: 'Closed' },
  pending: { bg: '#FEF9C3', color: '#A16207', border: '#FDE68A', dot: '#F59E0B', label: 'Pending' },
};

/* ─── Case avatar with initials ─────────────────── */
function CaseAvatar({ title }) {
  const words = (title || 'C').trim().split(/\s+/);
  const initials = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : (words[0][0] || 'C').toUpperCase();
  const hue = (title.charCodeAt(0) * 47 + (title.charCodeAt(1) || 0) * 19) % 360;
  return (
    <Box sx={{
      width: 36, height: 36, borderRadius: '10px',
      background: `hsl(${hue},38%,24%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.72rem', fontWeight: 800, color: '#fff',
      flexShrink: 0, letterSpacing: '0.04em',
      boxShadow: `0 2px 8px hsl(${hue},38%,24%,0.35)`,
    }}>
      {initials}
    </Box>
  );
}

/* ─── Stat pill ──────────────────────────────────── */
function StatPill({ label, value, bg, color }) {
  return (
    <Box sx={{
      px: 2.5, py: 1.5, borderRadius: '14px', background: bg,
      border: `1px solid ${color}28`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80,
      boxShadow: `0 2px 8px ${color}12`,
    }}>
      <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em', mt: 0.4, opacity: 0.75 }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ─── Status pill ────────────────────────────────── */
const StatusPill = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.open;
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: '7px', background: s.bg, border: `1px solid ${s.border}` }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: s.color }}>{s.label}</Typography>
    </Box>
  );
};

/* ─── Hearing date badge ─────────────────────────── */
const HearingBadge = ({ date }) => {
  if (!date) return <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const isPast  = d < today;
  const isToday = d.getTime() === today.getTime();
  const style = isPast
    ? { bg: '#FEE2E2', color: '#DC2626', border: '#FECACA' }
    : isToday
      ? { bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' }
      : { bg: '#DBEAFE', color: '#1D4ED8', border: '#BFDBFE' };
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, px: 1.2, py: 0.4, borderRadius: '7px', background: style.bg, border: `1px solid ${style.border}` }}>
      <CalendarMonthRounded sx={{ fontSize: 11, color: style.color }} />
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: style.color, whiteSpace: 'nowrap' }}>
        {isToday ? 'Today' : new Date(date).toLocaleDateString('en-IN')}
      </Typography>
    </Box>
  );
};

/* ─── Case type badge ────────────────────────────── */
const TypeBadge = ({ type }) => {
  if (!type) return <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>;
  return (
    <Box sx={{ display: 'inline-block', px: 1.2, py: 0.35, borderRadius: '7px', background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#1D4ED8', whiteSpace: 'nowrap' }}>{type}</Typography>
    </Box>
  );
};

/* ─── Dialog field ───────────────────────────────── */
const DField = ({ label, icon, children, ...props }) => (
  <Box>
    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.7 }}>
      {label}
    </Typography>
    <TextField fullWidth size="small" {...props} sx={FIELD_SX}
      InputProps={{
        startAdornment: icon
          ? <InputAdornment position="start"><Box sx={{ color: T.gold, display: 'flex' }}>{icon}</Box></InputAdornment>
          : undefined,
        ...props.InputProps,
      }}
    >
      {children}
    </TextField>
  </Box>
);

/* ─── Action icon button ─────────────────────────── */
const ActionBtn = ({ title, onClick, hoverBg, hoverColor, children }) => (
  <Tooltip title={title} arrow>
    <IconButton size="small" onClick={onClick} sx={{
      color: T.slate, background: 'transparent',
      border: `1px solid ${T.border}`, borderRadius: '8px', width: 30, height: 30,
      '&:hover': { background: hoverBg, color: hoverColor, borderColor: hoverBg, transform: 'scale(1.05)' },
      transition: 'all 0.18s',
    }}>
      {children}
    </IconButton>
  </Tooltip>
);

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function CasesPage() {
  const navigate = useNavigate();

  const [cases,        setCases]        = useState([]);
  const [clients,      setClients]      = useState([]);
  const [firms,        setFirms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dialog,       setDialog]       = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [saving,       setSaving]       = useState(false);
  const [editingCase,  setEditingCase]  = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, title: '' });
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState({ open: false, message: '', severity: 'success' });

  const notify = (message, severity = 'success') => setToast({ open: true, message, severity });

  /* ── Fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [caseRes, clientRes, firmRes] = await Promise.allSettled([
        casesAPI.getAll(),
        clientsAPI.getAll(),
        firmsAPI.getAll(),
      ]);
      if (caseRes.status   === 'fulfilled') setCases(caseRes.value.data?.results     ?? caseRes.value.data   ?? []);
      if (clientRes.status === 'fulfilled') setClients(clientRes.value.data?.results ?? clientRes.value.data ?? []);
      if (firmRes.status   === 'fulfilled') setFirms(firmRes.value.data?.results     ?? firmRes.value.data   ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNew = () => { setEditingCase(null); setForm(EMPTY_FORM); setDialog(true); };

  const handleEdit = (c) => {
    setEditingCase(c);
    setForm({
      title:             c.title             || '',
      case_number:       c.case_number       || '',
      client:            c.client != null    ? String(c.client) : '',
      firm:              c.firm   != null    ? String(c.firm)   : '',
      status:            c.status            || 'open',
      description:       c.description       || '',
      next_hearing_date: c.next_hearing_date || '',
      case_type:         c.case_type         || '',
      court_name:        c.court_name        || '',
    });
    setDialog(true);
  };

  const handleClose = () => { setDialog(false); setEditingCase(null); setForm(EMPTY_FORM); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title:             form.title?.trim(),
        case_number:       form.case_number?.trim(),
        case_type:         form.case_type?.trim(),
        court_name:        form.court_name?.trim(),
        description:       form.description?.trim() || '',
        status:            form.status || 'open',
        firm:              form.firm   ? Number(form.firm)   : null,
        client:            form.client ? Number(form.client) : null,
        next_hearing_date: form.next_hearing_date || null,
      };
      if (editingCase) {
        await casesAPI.update(editingCase.id, payload);
        notify('Case updated successfully');
      } else {
        await casesAPI.create(payload);
        notify('Case created successfully');
      }
      await fetchData();
      handleClose();
    } catch (e) {
      console.error('API ERROR:', e.response?.data);
      notify('Something went wrong. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (c) => setDeleteDialog({ open: true, id: c.id, title: c.title || `Case #${c.id}` });
  const closeDelete   = ()  => setDeleteDialog({ open: false, id: null, title: '' });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await casesAPI.delete(deleteDialog.id);
      setCases(prev => prev.filter(c => c.id !== deleteDialog.id));
      closeDelete();
      notify('Case deleted successfully');
    } catch (err) {
      console.error(err);
      notify('Failed to delete case.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ── Helpers ── */
  const getFirmName = (id) => {
    if (!id) return null;
    return firms.find(f => String(f.id) === String(id))?.name ?? null;
  };
  const getClientName = (id) => {
    if (!id) return null;
    const cl = clients.find(c => String(c.id) === String(id));
    if (!cl) return null;
    return cl.name || `${cl.first_name || ''} ${cl.last_name || ''}`.trim() || null;
  };

  const filtered = cases.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      (c.title       || '').toLowerCase().includes(q) ||
      (c.case_number || '').toLowerCase().includes(q) ||
      (c.client_name || getClientName(c.client) || '').toLowerCase().includes(q) ||
      (c.case_type   || '').toLowerCase().includes(q) ||
      (c.court_name  || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCount    = cases.filter(c => c.status === 'open').length;
  const closedCount  = cases.filter(c => c.status === 'closed').length;
  const pendingCount = cases.filter(c => c.status === 'pending').length;
  const isEditing    = Boolean(editingCase);

  const TABLE_HEADS = ['#', 'Case', 'Client', 'Firm', 'Type', 'Court', 'Status', 'Next Hearing', 'Filed', 'Actions'];

  return (
    <Box sx={{ pb: 2 }}>
      <PageHeader
        title="Cases"
        subtitle={`${cases.length} total case${cases.length !== 1 ? 's' : ''}`}
        action={
          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={handleNew}
            sx={{
              borderRadius: '10px', px: 2.5, py: 1, fontWeight: 700,
              background: T.navy, boxShadow: `0 4px 14px ${T.navy}40`,
              '&:hover': { background: T.navy2, transform: 'translateY(-1px)', boxShadow: `0 6px 18px ${T.navy}50` },
              transition: 'all 0.18s',
            }}
          >
            New Case
          </Button>
        }
      />

      {/* ── Stat pills ── */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <StatPill label="Total"   value={cases.length} bg="#F1F5F9" color={T.slate} />
        <StatPill label="Open"    value={openCount}    bg="#DBEAFE" color="#1D4ED8" />
        <StatPill label="Closed"  value={closedCount}  bg="#DCFCE7" color="#15803D" />
        <StatPill label="Pending" value={pendingCount} bg="#FEF9C3" color="#A16207" />
      </Box>

      <SectionCard>
        {/* ── Toolbar ── */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by title, number, client, court…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{
              flex: 1, minWidth: 220,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px', background: T.cream,
                '& fieldset': { borderColor: T.border },
                '&:hover fieldset': { borderColor: T.gold },
                '&.Mui-focused fieldset': { borderColor: T.gold },
              },
            }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 17, color: '#94A3B8' }} /></InputAdornment> }}
          />
          <TextField
            select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            size="small"
            sx={{ minWidth: 140, '& .MuiOutlinedInput-root': { borderRadius: '10px', background: T.cream, '& fieldset': { borderColor: T.border }, '&:hover fieldset': { borderColor: T.gold } } }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="open">Open</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </Box>

        {/* ── Table ── */}
        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}><CircularProgress sx={{ color: T.gold }} /></Box>
        ) : filtered.length === 0 ? (
          <EmptyState icon="⚖️" title="No cases found" description="Create your first case to get started" />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: T.cream }}>
                  {TABLE_HEADS.map((h, i) => (
                    <TableCell key={h} align={i === TABLE_HEADS.length - 1 ? 'right' : 'left'}
                      sx={{ fontSize: '0.68rem', fontWeight: 800, color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.4, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((c, idx) => {
                  const clientName = c.client_name || getClientName(c.client);
                  const firmName   = c.firm_name   || getFirmName(c.firm);
                  const caseTitle  = c.title || c.case_title || 'Untitled';

                  return (
                    <TableRow key={c.id} hover sx={{
                      '&:hover': { background: `${T.cream}99` },
                      '&:last-child td': { border: 0 },
                      transition: 'background 0.15s',
                    }}>

                      {/* # */}
                      <TableCell sx={{ py: 1.5, width: 40 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.slate, fontVariantNumeric: 'tabular-nums' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </Typography>
                      </TableCell>

                      {/* Case title + avatar */}
                      <TableCell sx={{ py: 1.5, maxWidth: 220 }} onClick={() => navigate(`/cases/${c.id}/hearings`)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
                          <CaseAvatar title={caseTitle} />
                          <Box>
                            <Typography sx={{
                              fontWeight: 700, fontSize: '0.85rem', color: T.navy, lineHeight: 1.2,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
                              '&:hover': { color: T.gold, textDecoration: 'underline' },
                            }}>
                              {caseTitle}
                            </Typography>
                            {c.case_number && (
                              <Typography sx={{ fontSize: '0.68rem', color: T.gold, fontFamily: 'monospace', fontWeight: 700, mt: 0.15 }}>
                                {c.case_number}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Client */}
                      <TableCell sx={{ py: 1.5 }}>
                        {clientName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PeopleRounded sx={{ fontSize: 13, color: T.gold }} />
                            <Typography sx={{ fontSize: '0.8rem', color: T.navy, fontWeight: 500 }}>{clientName}</Typography>
                          </Box>
                        ) : <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>}
                      </TableCell>

                      {/* Firm */}
                      <TableCell sx={{ py: 1.5 }}>
                        {firmName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BusinessRounded sx={{ fontSize: 13, color: T.slate }} />
                            <Typography sx={{ fontSize: '0.8rem', color: T.slate }}>{firmName}</Typography>
                          </Box>
                        ) : <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>}
                      </TableCell>

                      {/* Type */}
                      <TableCell sx={{ py: 1.5 }}><TypeBadge type={c.case_type} /></TableCell>

                      {/* Court */}
                      <TableCell sx={{ py: 1.5 }}>
                        {c.court_name ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccountBalanceRounded sx={{ fontSize: 13, color: T.slate }} />
                            <Typography sx={{ fontSize: '0.78rem', color: T.slate, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.court_name}
                            </Typography>
                          </Box>
                        ) : <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>}
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 1.5 }}><StatusPill status={c.status} /></TableCell>

                      {/* Next hearing */}
                      <TableCell sx={{ py: 1.5 }}><HearingBadge date={c.next_hearing_date} /></TableCell>

                      {/* Filed */}
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right" sx={{ py: 1.5, pr: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <ActionBtn title="Edit case" onClick={() => handleEdit(c)} hoverBg={T.navy} hoverColor="#fff">
                            <EditRounded sx={{ fontSize: 14 }} />
                          </ActionBtn>
                          <ActionBtn title="Delete case" onClick={() => confirmDelete(c)} hoverBg="#FEF2F2" hoverColor={T.red}>
                            <DeleteRounded sx={{ fontSize: 14 }} />
                          </ActionBtn>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* ── Footer count ── */}
        {!loading && filtered.length > 0 && (
          <Box sx={{
            px: 2.5, py: 1.5, borderTop: `1px solid ${T.border}`,
            background: T.cream, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Typography sx={{ fontSize: '0.72rem', color: T.slate }}>
              Showing <strong>{filtered.length}</strong> of <strong>{cases.length}</strong> case{cases.length !== 1 ? 's' : ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[T.navy, '#1D4ED8', '#15803D'].map((col, i) => (
                <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', background: col, opacity: 0.35 }} />
              ))}
            </Box>
          </Box>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════════════════
           CREATE / EDIT DIALOG
         ══════════════════════════════════════════════════ */}
      <Dialog open={dialog} onClose={handleClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 24px 80px rgba(13,27,42,0.18)', border: `1px solid ${T.border}`, overflow: 'hidden' } }}>

        <Box sx={{ height: 3, background: `linear-gradient(90deg, transparent, ${T.gold} 30%, ${T.goldL} 65%, transparent)` }} />

        <DialogTitle sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2.5, background: T.cream, borderBottom: `1px solid ${T.border}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', background: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GavelRounded sx={{ fontSize: 18, color: T.gold }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: T.navy, lineHeight: 1.1 }}>
                {isEditing ? 'Edit Case' : 'New Case'}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: T.slate, mt: 0.2 }}>
                {isEditing ? 'Update the case details below' : 'Fill in the case details below'}
              </Typography>
            </Box>
          </Box>
          <Box onClick={handleClose} sx={{
            width: 30, height: 30, borderRadius: '8px', background: '#F1F5F9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', '&:hover': { background: '#E2E8F0' },
          }}>
            <CloseRounded sx={{ fontSize: 16, color: T.slate }} />
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DField label="Case Title *" name="title" value={form.title} onChange={handleChange}
                icon={<GavelRounded sx={{ fontSize: 16 }} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Case Number" name="case_number" value={form.case_number} onChange={handleChange}
                icon={<FlagRounded sx={{ fontSize: 16 }} />} />
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
                icon={<BusinessRounded sx={{ fontSize: 16 }} />}>
                <MenuItem value="">— Select Firm —</MenuItem>
                {firms.map((f) => <MenuItem key={f.id} value={String(f.id)}>{f.name}</MenuItem>)}
              </DField>
            </Grid>
            <Grid item xs={12}>
              <DField label="Assign Client" name="client" value={form.client} onChange={handleChange} select
                icon={<PeopleRounded sx={{ fontSize: 16 }} />}>
                <MenuItem value="">— Select Client —</MenuItem>
                {clients.map((cl) => (
                  <MenuItem key={cl.id} value={String(cl.id)}>
                    {cl.name || `${cl.first_name || ''} ${cl.last_name || ''}`.trim()}
                  </MenuItem>
                ))}
              </DField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Case Type *" name="case_type" value={form.case_type} onChange={handleChange} select
                icon={<CategoryRounded sx={{ fontSize: 16 }} />}>
                <MenuItem value="">— Select Type —</MenuItem>
                {CASE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </DField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Court Name *" name="court_name" value={form.court_name} onChange={handleChange}
                icon={<AccountBalanceRounded sx={{ fontSize: 16 }} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DField label="Next Hearing Date" name="next_hearing_date" type="date"
                value={form.next_hearing_date} onChange={handleChange}
                InputLabelProps={{ shrink: true }} icon={<CalendarMonthRounded sx={{ fontSize: 16 }} />} />
            </Grid>
            <Grid item xs={12}>
              <DField label="Description" name="description" value={form.description} onChange={handleChange} multiline rows={3} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={handleClose} sx={{
            borderRadius: '10px', color: T.slate, border: `1px solid ${T.border}`,
            px: 2.5, fontWeight: 600, '&:hover': { background: T.cream },
          }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained"
            disabled={saving || !form.title || !form.case_type || !form.court_name || !form.firm}
            sx={{
              borderRadius: '10px', px: 3, fontWeight: 700,
              background: T.navy, boxShadow: `0 4px 14px ${T.navy}40`,
              '&:hover': { background: T.navy2 },
              '&.Mui-disabled': { background: '#E2E8F0', color: '#94A3B8', boxShadow: 'none' },
            }}>
            {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : isEditing ? 'Update Case' : 'Create Case'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════
           DELETE DIALOG
         ══════════════════════════════════════════════════ */}
      <Dialog open={deleteDialog.open} onClose={closeDelete} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' } }}>
        <Box sx={{ height: 3, background: 'linear-gradient(90deg, transparent, #DC2626 30%, #F87171 65%, transparent)' }} />
        <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteRounded sx={{ fontSize: 18, color: T.red }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: T.navy }}>Delete Case</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', color: T.slate, lineHeight: 1.6 }}>
            Are you sure you want to delete <strong style={{ color: T.navy }}>"{deleteDialog.title}"</strong>?
            This action cannot be undone and will remove all associated data.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={closeDelete} sx={{
            borderRadius: '10px', color: T.slate, border: `1px solid ${T.border}`, px: 2.5, fontWeight: 600,
          }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" disabled={deleting}
            sx={{ borderRadius: '10px', px: 2.5, fontWeight: 700, background: T.red, '&:hover': { background: '#B91C1C' }, '&.Mui-disabled': { background: '#E2E8F0' } }}>
            {deleting ? <CircularProgress size={17} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, InputAdornment, Tooltip, CircularProgress, Typography,
  Grid, MenuItem, Snackbar, Alert, Chip,
} from '@mui/material';
import {
  EditRounded, DeleteRounded, SearchRounded, PersonAddRounded,
  CloseRounded, BusinessRounded, EmailOutlined, PhoneOutlined,
  LocationOnOutlined, PersonOutlineRounded,
} from '@mui/icons-material';
import PeopleRounded from '@mui/icons-material/PeopleRounded';
import { clientsAPI, firmsAPI } from '../api/services';
import PageHero from '../components/PageHero';

/* ─── design tokens ─── */
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
    borderRadius: '10px', background: T.cream, fontSize: '0.88rem',
    transition: 'box-shadow 0.2s',
    '& fieldset': { borderColor: T.border, borderWidth: '1.5px' },
    '&:hover fieldset': { borderColor: T.gold },
    '&.Mui-focused fieldset': { borderColor: T.gold, borderWidth: '2px' },
    '&.Mui-focused': { boxShadow: `0 0 0 3px ${T.gold}22` },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: T.gold },
  '& .MuiFormHelperText-root': { fontSize: '0.72rem' },
};

const EMPTY_FORM = { name: '', email: '', phone: '', address: '', city: '', firm: '' };

/* ─── Avatar ─── */
function ClientAvatar({ name }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
  const hue = (name.charCodeAt(0) * 37 + (name.charCodeAt(1) || 0) * 13) % 360;
  return (
    <Box sx={{
      width: 36, height: 36, borderRadius: '10px',
      background: `hsl(${hue},35%,28%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.72rem', fontWeight: 800, color: '#fff',
      flexShrink: 0, letterSpacing: '0.04em',
      boxShadow: `0 2px 8px hsl(${hue},35%,28%,0.35)`,
    }}>
      {initials || '?'}
    </Box>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export default function ClientsPage() {
  const [clients,      setClients]      = useState([]);
  const [firms,        setFirms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [dialog,       setDialog]       = useState({ open: false, mode: 'add', data: null });
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});
  const [saving,       setSaving]       = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [deleting,     setDeleting]     = useState(false);
  const [toast,        setToast]        = useState({ open: false, message: '', severity: 'success' });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clientsAPI.getAll();
      setClients(data?.results ?? data ?? []);
    } catch {
      setToast({ open: true, message: 'Failed to load clients.', severity: 'error' });
    } finally { setLoading(false); }
  }, []);

  const fetchFirms = useCallback(async () => {
    try {
      const { data } = await firmsAPI.getAll();
      setFirms(data?.results ?? data ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchClients(); fetchFirms(); }, [fetchClients, fetchFirms]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM }); setErrors({});
    setDialog({ open: true, mode: 'add', data: null });
  };
  const openEdit = (c) => {
    setForm({
      name:    c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
      email:   c.email || '',
      phone:   c.phone || '',
      address: c.address || '',
      city:    c.city || '',
      firm:    c.firm ?? c.firm_id ?? '',
    });
    setErrors({});
    setDialog({ open: true, mode: 'edit', data: c });
  };
  const closeDialog = () => {
    if (!saving) { setDialog({ open: false, mode: 'add', data: null }); setForm({ ...EMPTY_FORM }); setErrors({}); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Client name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    if (form.phone && !/^[+\d\s()-]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        name:    form.name.trim(),
        email:   form.email.trim() || '',
        phone:   form.phone.trim() || '',
        address: form.address.trim() || '',
        city:    form.city.trim() || '',
        firm:    form.firm || null,
      };
      if (dialog.mode === 'add') {
        await clientsAPI.create(payload);
        setToast({ open: true, message: 'Client added successfully!', severity: 'success' });
      } else {
        await clientsAPI.update(dialog.data.id, payload);
        setToast({ open: true, message: 'Client updated successfully!', severity: 'success' });
      }
      await fetchClients();
      closeDialog();
    } catch (e) {
      const srv = e.response?.data;
      if (srv && typeof srv === 'object') {
        const mapped = {};
        Object.keys(srv).forEach(k => { mapped[k] = Array.isArray(srv[k]) ? srv[k].join(', ') : String(srv[k]); });
        setErrors(mapped);
      } else {
        setToast({ open: true, message: 'Failed to save client.', severity: 'error' });
      }
    } finally { setSaving(false); }
  };

  const confirmDelete = (c) => {
    const name = c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
    setDeleteDialog({ open: true, id: c.id, name });
  };
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clientsAPI.remove(deleteDialog.id);
      setToast({ open: true, message: `"${deleteDialog.name}" deleted.`, severity: 'success' });
      await fetchClients();
    } catch (e) {
      setToast({ open: true, message: e.response?.data?.detail || 'Failed to delete.', severity: 'error' });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  const getFirmName = (id) => {
    if (!id) return null;
    return firms.find(f => f.id === id || String(f.id) === String(id))?.name ?? null;
  };

  const filtered = clients.filter(c => {
    const q     = search.toLowerCase();
    const name  = (c.name || `${c.first_name || ''} ${c.last_name || ''}`).toLowerCase();
    const fName = (getFirmName(c.firm ?? c.firm_id) || '').toLowerCase();
    return name.includes(q) || (c.email || '').toLowerCase().includes(q) || (c.phone || '').includes(q) || fName.includes(q);
  });

  const withFirm  = clients.filter(c => c.firm ?? c.firm_id).length;
  const withEmail = clients.filter(c => c.email).length;

  /* ════════════════ RENDER ════════════════ */
  return (
    <Box sx={{ pb: 4 }}>

      {/* ✅ HERO — uses theme colors, replaces old custom header */}
      <PageHero
        label="HP HCMS · Clients"
        icon={<PeopleRounded />}
        title="Client Registry"
        subtitle={`${clients.length} client${clients.length !== 1 ? 's' : ''} across ${firms.length} firm${firms.length !== 1 ? 's' : ''}`}
        action={
          <Button
            variant="contained"
            startIcon={<PersonAddRounded />}
            onClick={openAdd}
            sx={{
              borderRadius: '10px', px: 2.5, py: 1.1,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              fontWeight: 700, fontSize: '0.83rem', textTransform: 'none',
              color: '#fff', boxShadow: 'none',
              '&:hover': { background: 'rgba(255,255,255,0.25)', transform: 'translateY(-1px)' },
              transition: 'all 0.2s',
            }}
          >
            Add Client
          </Button>
        }
      />

      {/* Stat pills row */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1.5, mb: 3 }}>
        {[
          { label: 'Total',      value: clients.length, color: T.navy },
          { label: 'With Firm',  value: withFirm,       color: '#1565c0' },
          { label: 'With Email', value: withEmail,       color: T.green },
        ].map(({ label, value, color }) => (
          <Box key={label} sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            px: 3, py: 1.5, background: T.white,
            border: `1px solid ${T.border}`, borderRadius: '14px', minWidth: 90,
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color, lineHeight: 1 }}>{value}</Typography>
            <Typography sx={{ fontSize: '0.68rem', color: T.slate, mt: 0.4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── Table card ── */}
      <Box sx={{
        background: T.white, borderRadius: '18px',
        border: `1px solid ${T.border}`,
        boxShadow: '0 2px 16px rgba(13,27,42,0.06)', overflow: 'hidden',
      }}>

        {/* Search bar */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${T.border}`, background: T.cream, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            placeholder="Search clients by name, email, phone or firm…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 17, color: T.slate }} /></InputAdornment>,
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.4 }}>
                    <CloseRounded sx={{ fontSize: 15, color: T.slate }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              width: { xs: '100%', sm: 360 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px', background: T.white, fontSize: '0.85rem',
                '& fieldset': { borderColor: T.border },
                '&:hover fieldset': { borderColor: T.gold },
                '&.Mui-focused fieldset': { borderColor: T.gold, borderWidth: '2px' },
              },
            }}
          />
          {search && (
            <Typography sx={{ fontSize: '0.78rem', color: T.slate, whiteSpace: 'nowrap' }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Table / loading / empty */}
        {loading ? (
          <Box sx={{ py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={36} sx={{ color: T.gold }} />
            <Typography sx={{ color: T.slate, fontSize: '0.82rem' }}>Loading clients…</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.5rem', mb: 1.5 }}>👥</Typography>
            <Typography sx={{ fontWeight: 700, color: T.navy, mb: 0.5 }}>
              {search ? 'No results found' : 'No clients yet'}
            </Typography>
            <Typography sx={{ color: T.slate, fontSize: '0.82rem', mb: 3 }}>
              {search ? 'Try a different search term' : 'Add your first client to get started'}
            </Typography>
            {!search && (
              <Button variant="outlined" startIcon={<PersonAddRounded />} onClick={openAdd}
                sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, borderColor: T.navy, color: T.navy, '&:hover': { borderColor: T.gold, color: T.gold, background: `${T.gold}0A` } }}>
                Add First Client
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: '#F4F7FA' }}>
                  {['#', 'Client', 'Firm', 'Contact', 'Location', ''].map((h, i) => (
                    <TableCell key={i} align={i === 5 ? 'right' : 'left'} sx={{ fontSize: '0.68rem', fontWeight: 800, color: T.slate, textTransform: 'uppercase', letterSpacing: '0.08em', py: 1.4, borderBottom: `1px solid ${T.border}`, whiteSpace: 'nowrap' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((client, idx) => {
                  const name  = client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim();
                  const fName = getFirmName(client.firm ?? client.firm_id);
                  return (
                    <TableRow key={client.id} hover sx={{ '&:hover': { background: `${T.cream}99` }, '&:last-child td': { border: 0 }, transition: 'background 0.15s' }}>

                      <TableCell sx={{ width: 40, py: 1.5 }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: T.slate, fontVariantNumeric: 'tabular-nums' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <ClientAvatar name={name} />
                          <Box>
                            <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: T.navy, lineHeight: 1.2 }}>{name}</Typography>
                            {client.address && (
                              <Typography sx={{ fontSize: '0.7rem', color: T.slate, mt: 0.2 }}>
                                {client.address.slice(0, 32)}{client.address.length > 32 ? '…' : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        {fName ? (
                          <Chip icon={<BusinessRounded sx={{ fontSize: '12px !important', color: '#1565c0 !important' }} />} label={fName} size="small"
                            sx={{ background: '#EFF6FF', color: '#1565c0', fontWeight: 600, fontSize: '0.72rem', border: '1px solid #BFDBFE', borderRadius: '8px', height: 24, '& .MuiChip-icon': { ml: '6px' } }} />
                        ) : (
                          <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>
                        )}
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                          {client.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <EmailOutlined sx={{ fontSize: 12, color: T.slate }} />
                              <Typography sx={{ fontSize: '0.78rem', color: T.slate }}>{client.email}</Typography>
                            </Box>
                          )}
                          {client.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                              <PhoneOutlined sx={{ fontSize: 12, color: T.slate }} />
                              <Typography sx={{ fontSize: '0.78rem', color: T.navy }}>{client.phone}</Typography>
                            </Box>
                          )}
                          {!client.email && !client.phone && <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        {client.city ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOnOutlined sx={{ fontSize: 13, color: T.gold }} />
                            <Typography sx={{ fontSize: '0.8rem', color: T.navy, fontWeight: 500 }}>{client.city}</Typography>
                          </Box>
                        ) : (
                          <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>—</Typography>
                        )}
                      </TableCell>

                      <TableCell align="right" sx={{ py: 1.5, pr: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit client" arrow>
                            <IconButton size="small" onClick={() => openEdit(client)}
                              sx={{ color: T.slate, border: `1px solid ${T.border}`, borderRadius: '8px', width: 30, height: 30, '&:hover': { background: T.navy, color: '#fff', borderColor: T.navy, transform: 'scale(1.05)' }, transition: 'all 0.18s' }}>
                              <EditRounded sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete client" arrow>
                            <IconButton size="small" onClick={() => confirmDelete(client)}
                              sx={{ color: T.slate, border: `1px solid ${T.border}`, borderRadius: '8px', width: 30, height: 30, '&:hover': { background: '#FEF2F2', color: T.red, borderColor: '#FECACA', transform: 'scale(1.05)' }, transition: 'all 0.18s' }}>
                              <DeleteRounded sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <Box sx={{ px: 2.5, py: 1.5, borderTop: `1px solid ${T.border}`, background: T.cream, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.72rem', color: T.slate }}>
              Showing <strong>{filtered.length}</strong> of <strong>{clients.length}</strong> client{clients.length !== 1 ? 's' : ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[T.navy, '#1565c0', T.green].map((c, i) => <Box key={i} sx={{ width: 6, height: 6, borderRadius: '50%', background: c, opacity: 0.4 }} />)}
            </Box>
          </Box>
        )}
      </Box>

      {/* ══ ADD / EDIT DIALOG ══ */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', boxShadow: '0 24px 80px rgba(13,27,42,0.18)', border: `1px solid ${T.border}`, overflow: 'hidden' } }}>
        <Box sx={{ height: 3, background: `linear-gradient(90deg, transparent, ${T.gold} 30%, ${T.goldL} 65%, transparent)` }} />
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, background: T.cream, borderBottom: `1px solid ${T.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PersonOutlineRounded sx={{ fontSize: 18, color: T.gold }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: T.navy, lineHeight: 1 }}>
                {dialog.mode === 'add' ? 'Add New Client' : 'Edit Client'}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: T.slate, mt: 0.3 }}>
                {dialog.mode === 'add' ? 'Fill in the details below' : 'Update client information'}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={closeDialog} disabled={saving} sx={{ borderRadius: '8px', border: `1px solid ${T.border}`, '&:hover': { background: '#FEF2F2', color: T.red } }}>
            <CloseRounded sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 3, pb: 1, background: T.white }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required error={!!errors.name} helperText={errors.name} autoFocus={dialog.mode === 'add'} sx={FIELD_SX} />
            </Grid>
            <Grid item xs={12}>
              <TextField select fullWidth label="Associated Firm" name="firm" value={form.firm} onChange={handleChange} error={!!errors.firm} helperText={errors.firm || 'Optional — select the law firm this client belongs to'} sx={FIELD_SX}
                InputProps={{ startAdornment: form.firm ? <InputAdornment position="start"><BusinessRounded sx={{ fontSize: 16, color: '#1565c0' }} /></InputAdornment> : null }}>
                <MenuItem value=""><Typography color="text.secondary" variant="body2">— No Firm —</Typography></MenuItem>
                {firms.length === 0 ? (
                  <MenuItem disabled><Typography variant="body2" color="text.disabled">No firms registered yet</Typography></MenuItem>
                ) : firms.map(firm => (
                  <MenuItem key={firm.id} value={firm.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessRounded sx={{ fontSize: 15, color: '#1565c0' }} />
                      <Typography variant="body2">{firm.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} sx={FIELD_SX}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined sx={{ fontSize: 16, color: T.slate }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange} error={!!errors.phone} helperText={errors.phone} sx={FIELD_SX}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneOutlined sx={{ fontSize: 16, color: T.slate }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" name="city" value={form.city} onChange={handleChange} error={!!errors.city} helperText={errors.city} sx={FIELD_SX}
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnOutlined sx={{ fontSize: 16, color: T.gold }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} multiline rows={2} sx={FIELD_SX} />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, background: T.cream, borderTop: `1px solid ${T.border}`, gap: 1 }}>
          <Button onClick={closeDialog} disabled={saving} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, color: T.slate, border: `1px solid ${T.border}`, px: 2.5, '&:hover': { background: T.border } }}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.name?.trim()}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: T.navy, color: T.white, px: 3, boxShadow: '0 4px 14px rgba(13,27,42,0.2)', '&:hover': { background: T.navy2, boxShadow: '0 6px 20px rgba(13,27,42,0.3)' }, '&.Mui-disabled': { background: '#CBD5E1', color: '#fff' } }}>
            {saving ? <CircularProgress size={16} color="inherit" /> : dialog.mode === 'add' ? 'Add Client' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ DELETE DIALOG ══ */}
      <Dialog open={deleteDialog.open} onClose={() => !deleting && setDeleteDialog({ open: false, id: null, name: '' })}
        PaperProps={{ sx: { borderRadius: '18px', boxShadow: '0 24px 80px rgba(13,27,42,0.18)', border: `1px solid ${T.border}`, maxWidth: 380 } }}>
        <Box sx={{ height: 3, background: 'linear-gradient(90deg, transparent, #DC2626 30%, #EF4444 65%, transparent)' }} />
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteRounded sx={{ fontSize: 18, color: T.red }} />
            </Box>
            <Typography sx={{ fontWeight: 800, color: T.navy }}>Delete Client</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 1.5 }}>
          <Typography sx={{ fontSize: '0.85rem', color: T.slate, lineHeight: 1.7 }}>
            Are you sure you want to delete{' '}
            <Typography component="span" sx={{ fontWeight: 700, color: T.navy }}>{deleteDialog.name}</Typography>
            ? This action <strong>cannot be undone</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })} disabled={deleting}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, color: T.slate, border: `1px solid ${T.border}`, px: 2.5, '&:hover': { background: T.border } }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={deleting}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, background: T.red, color: T.white, px: 3, boxShadow: '0 4px 14px rgba(220,38,38,0.25)', '&:hover': { background: '#B91C1C' }, '&.Mui-disabled': { background: '#CBD5E1', color: '#fff' } }}>
            {deleting ? <CircularProgress size={16} color="inherit" /> : 'Delete Client'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
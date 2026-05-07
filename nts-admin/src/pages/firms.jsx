import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Typography,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  AddRounded,
  EditRounded,
  DeleteRounded,
  SearchRounded,
  CloseRounded,
  BusinessRounded,
  CorporateFareRounded,
} from '@mui/icons-material';
import { firmsAPI } from '../api/services';
import { PageHeader, EmptyState, SectionCard } from './UI';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  pan_number: '',
  gst_number: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  admin_username: '',
  admin_password: '',
};

export default function FirmsPage() {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const isSuperAdmin = "super_admin";

  const fetchFirms = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await firmsAPI.getAll();
      setFirms(data?.results ?? data ?? []);
    } catch (e) {
      console.error('Failed to load firms:', e);
      setToast({ open: true, message: 'Failed to load firms. Please refresh.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFirms(); }, [fetchFirms]);

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setDialog({ open: true, mode: 'add', data: null });
  };

  const openEdit = (firm) => {
    setForm({
      name: firm.name || '', email: firm.email || '', phone: firm.phone || '',
      pan_number: firm.pan_number || '', gst_number: firm.gst_number || '',
      address: firm.address || '', city: firm.city || '', state: firm.state || '',
      pincode: firm.pincode || '', admin_username: '', admin_password: '',
    });
    setErrors({});
    setDialog({ open: true, mode: 'edit', data: firm });
  };

  const closeDialog = () => {
    if (!saving) {
      setDialog({ open: false, mode: 'add', data: null });
      setForm({ ...EMPTY_FORM });
      setErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Firm name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (form.phone && !/^[+\d\s()-]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    if (form.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan_number.toUpperCase())) errs.pan_number = 'Invalid PAN format (e.g. ABCDE1234F)';
    if (form.gst_number && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]{3}$/.test(form.gst_number.toUpperCase())) errs.gst_number = 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)';
    if (dialog.mode === 'add') {
      if (!form.admin_username) errs.admin_username = "Admin username required";
      if (!form.admin_password) errs.admin_password = "Password required";
    }
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        firm_name: form.name, email: form.email, phone: form.phone,
        address: form.address, city: form.city, state: form.state,
        pincode: form.pincode, pan_number: form.pan_number,
        gst_number: form.gst_number, username: form.admin_username,
        password: form.admin_password,
      };
      if (dialog.mode === 'add') {
        await firmsAPI.createWithAdmin(payload);
        setToast({ open: true, message: 'Firm registered successfully!', severity: 'success' });
      } else {
        await firmsAPI.update(dialog.data.id, payload);
        setToast({ open: true, message: 'Firm updated successfully!', severity: 'success' });
      }
      await fetchFirms();
      closeDialog();
    } catch (e) {
      console.error('Save failed:', e);
      const serverErrors = e.response?.data;
      if (serverErrors && typeof serverErrors === 'object') {
        const mapped = {};
        Object.keys(serverErrors).forEach((key) => {
          const val = serverErrors[key];
          mapped[key] = Array.isArray(val) ? val.join(', ') : String(val);
        });
        setErrors(mapped);
      } else {
        setToast({ open: true, message: 'Failed to save firm. Please try again.', severity: 'error' });
      }
    } finally { setSaving(false); }
  };

  const confirmDelete = (firm) => setDeleteDialog({ open: true, id: firm.id, name: firm.name });

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await firmsAPI.remove(deleteDialog.id);
      setToast({ open: true, message: `"${deleteDialog.name}" deleted.`, severity: 'success' });
      await fetchFirms();
    } catch (e) {
      const msg = e.response?.data?.detail || 'Failed to delete firm.';
      setToast({ open: true, message: msg, severity: 'error' });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };

  const toggleActive = async (id) => {
    try {
      await firmsAPI.toggleActive(id);
      setToast({ open: true, message: "Firm status updated", severity: "success" });
      fetchFirms();
    } catch (e) {
      setToast({ open: true, message: "Failed to update status", severity: "error" });
    }
  };

  const toggleBlock = async (id) => {
    try {
      await firmsAPI.toggleBlock(id);
      setToast({ open: true, message: "Firm block updated", severity: "success" });
      fetchFirms();
    } catch (e) {
      setToast({ open: true, message: "Failed to block/unblock", severity: "error" });
    }
  };

  const filtered = firms.filter((f) => {
    const q = search.toLowerCase();
    return (
      (f.name || '').toLowerCase().includes(q) ||
      (f.email || '').toLowerCase().includes(q) ||
      (f.phone || '').includes(q) ||
      (f.pan_number || '').toLowerCase().includes(q) ||
      (f.gst_number || '').toLowerCase().includes(q) ||
      (f.city || '').toLowerCase().includes(q) ||
      (f.state || '').toLowerCase().includes(q) ||
      (f.pincode || '').includes(q)
    );
  });

  const firmColor = (name = '') => {
    const palette = ['#1565c0', '#6a1b9a', '#2e7d32', '#c62828', '#e65100', '#00695c', '#4527a0'];
    return palette[(name ? name.charCodeAt(0) : 0) % palette.length];
  };

  /* ─── Styled badge helper ─── */
  const Badge = ({ label, color, bg }) => (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.5,
      px: 1.2, py: 0.35, borderRadius: 2, bgcolor: bg,
      fontSize: '0.7rem', fontWeight: 700, color, letterSpacing: '0.02em',
      lineHeight: 1,
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      {label}
    </Box>
  );

  // ═══════════════════════════════════════════════════════
  return (
    <Box>
      <PageHeader
        title="Law Firms"
        subtitle={`${firms.length} firm${firms.length !== 1 ? 's' : ''} registered`}
        action={
          isSuperAdmin && (
            <Button variant="contained" startIcon={<AddRounded />} onClick={openAdd}
              sx={{ px: 3, py: 1, borderRadius: 2, fontWeight: 600, fontSize: '0.85rem',
                background: 'linear-gradient(135deg, #1a2e4a 0%, #2d4a72 100%)',
                boxShadow: '0 4px 14px rgba(26,46,74,0.35)',
                '&:hover': { background: 'linear-gradient(135deg, #0f1d2f 0%, #1a2e4a 100%)', boxShadow: '0 6px 20px rgba(26,46,74,0.45)' },
              }}>
              Add Firm
            </Button>
          )
        }
      />

      {/* ── KPI Summary ── */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Firms', value: firms.length, color: '#1565c0', bg: '#e3f2fd' },
          { label: 'Active', value: firms.filter(f => f.is_active && !f.is_blocked).length, color: '#2e7d32', bg: '#e8f5e9' },
          { label: 'Inactive', value: firms.filter(f => !f.is_active).length, color: '#e65100', bg: '#fff3e0' },
          { label: 'Blocked', value: firms.filter(f => f.is_blocked).length, color: '#c62828', bg: '#ffebee' },
        ].map(({ label, value, color, bg }) => (
          <Box key={label} sx={{
            flex: '1 1 140px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
            borderRadius: 3, px: 2.5, py: 2, boxShadow: '0 1px 4px rgba(26,46,74,0.06)',
            position: 'relative', overflow: 'hidden',
            '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: color, borderRadius: '4px 0 0 4px' },
          }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ color, mt: 0.5, lineHeight: 1 }}>
              {value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Main Table ── */}
      <SectionCard>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search firms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment>,
            }}
            sx={{ width: { xs: '100%', sm: 340 },
              '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#f8f9fb', '&:hover': { bgcolor: '#f0f2f5' }, '&.Mui-focused': { bgcolor: '#fff' } },
            }}
          />
          <Box sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {filtered.length} of {firms.length} shown
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <CircularProgress size={36} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading firms...</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CorporateFareRounded sx={{ fontSize: 56, color: 'text.disabled' }} />}
            title={search ? 'No firms match your search' : 'No firms registered yet'}
            description={search ? 'Try a different search term' : 'Add your first law firm to get started'}
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 50 }}>#</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Firm</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>PAN / GST</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Access</TableCell>
                  <TableCell align="right" sx={{ width: 160 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((firm, idx) => {
                  const color = firmColor(firm.name);
                  return (
                    <TableRow key={firm.id} hover sx={{
                      transition: 'background 0.15s',
                      '&:hover': { bgcolor: 'rgba(26,46,74,0.02)' },
                      ...(firm.is_blocked && { opacity: 0.55 }),
                    }}>
                      {/* # */}
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.72rem' }}>
                          {String(idx + 1).padStart(2, '0')}
                        </Typography>
                      </TableCell>

                      {/* Firm — name + avatar */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 2.5, flexShrink: 0,
                            background: `linear-gradient(135deg, ${color}15, ${color}30)`,
                            border: `1.5px solid ${color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color }}>
                              {(firm.name || '?')[0].toUpperCase()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1a2e4a', lineHeight: 1.3 }}>
                              {firm.name}
                            </Typography>
                            {firm.address && (
                              <Typography variant="caption" sx={{ color: 'text.disabled', lineHeight: 1.2 }} noWrap>
                                {firm.address}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Contact — email + phone stacked */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', color: '#1a2e4a' }}>
                          {firm.email || '—'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {firm.phone || '—'}
                        </Typography>
                      </TableCell>

                      {/* PAN / GST — stacked badges */}
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {firm.pan_number ? (
                            <Box sx={{
                              display: 'inline-block', width: 'fit-content',
                              px: 1, py: 0.25, borderRadius: 1.5,
                              bgcolor: '#e3f2fd', fontFamily: 'monospace',
                              fontSize: '0.7rem', fontWeight: 700, color: '#1565c0',
                              letterSpacing: '0.06em',
                            }}>
                              PAN: {firm.pan_number.toUpperCase()}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled">PAN: —</Typography>
                          )}
                          {firm.gst_number ? (
                            <Box sx={{
                              display: 'inline-block', width: 'fit-content',
                              px: 1, py: 0.25, borderRadius: 1.5,
                              bgcolor: '#e8f5e9', fontFamily: 'monospace',
                              fontSize: '0.68rem', fontWeight: 700, color: '#2e7d32',
                              letterSpacing: '0.04em',
                            }}>
                              GST: {firm.gst_number.toUpperCase()}
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled">GST: —</Typography>
                          )}
                        </Box>
                      </TableCell>

                      {/* Location — city, state, pincode */}
                      <TableCell>
                        {(firm.city || firm.state) ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                              {[firm.city, firm.state].filter(Boolean).join(', ')}
                            </Typography>
                            {firm.pincode && (
                              <Typography variant="caption" sx={{
                                fontFamily: 'monospace', fontSize: '0.7rem',
                                fontWeight: 600, color: '#6a1b9a', letterSpacing: '0.08em',
                              }}>
                                {firm.pincode}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">—</Typography>
                        )}
                      </TableCell>

                      {/* Status — Active/Inactive */}
                      <TableCell align="center">
                        {firm.is_active
                          ? <Badge label="Active" color="#2e7d32" bg="#e8f5e9" />
                          : <Badge label="Inactive" color="#e65100" bg="#fff3e0" />
                        }
                      </TableCell>

                      {/* Access — Blocked/Allowed */}
                      <TableCell align="center">
                        {firm.is_blocked
                          ? <Badge label="Blocked" color="#c62828" bg="#ffebee" />
                          : <Badge label="Allowed" color="#2e7d32" bg="#e8f5e9" />
                        }
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.25 }}>
                          <Tooltip title={firm.is_active ? 'Deactivate' : 'Activate'} arrow>
                            <IconButton size="small" onClick={() => toggleActive(firm.id)}
                              sx={{
                                width: 30, height: 30, borderRadius: 1.5,
                                bgcolor: firm.is_active ? '#e8f5e9' : '#fff3e0',
                                color: firm.is_active ? '#2e7d32' : '#e65100',
                                '&:hover': { bgcolor: firm.is_active ? '#c8e6c9' : '#ffe0b2' },
                              }}>
                              <Typography sx={{ fontSize: '0.75rem' }}>{firm.is_active ? '✓' : '✗'}</Typography>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={firm.is_blocked ? 'Unblock' : 'Block'} arrow>
                            <IconButton size="small" onClick={() => toggleBlock(firm.id)}
                              sx={{
                                width: 30, height: 30, borderRadius: 1.5,
                                bgcolor: firm.is_blocked ? '#ffebee' : '#f5f5f5',
                                color: firm.is_blocked ? '#c62828' : '#757575',
                                '&:hover': { bgcolor: firm.is_blocked ? '#ffcdd2' : '#e0e0e0' },
                              }}>
                              <Typography sx={{ fontSize: '0.75rem' }}>{firm.is_blocked ? '🔒' : '🔓'}</Typography>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit" arrow>
                            <IconButton size="small" onClick={() => openEdit(firm)}
                              sx={{
                                width: 30, height: 30, borderRadius: 1.5,
                                bgcolor: '#e3f2fd', color: '#1565c0',
                                '&:hover': { bgcolor: '#bbdefb' },
                              }}>
                              <EditRounded sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete" arrow>
                            <IconButton size="small" onClick={() => confirmDelete(firm)}
                              sx={{
                                width: 30, height: 30, borderRadius: 1.5,
                                bgcolor: '#ffebee', color: '#c62828',
                                '&:hover': { bgcolor: '#ffcdd2' },
                              }}>
                              <DeleteRounded sx={{ fontSize: 15 }} />
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
      </SectionCard>

      {/* ══════════════════════════════════════════════════
           ADD / EDIT DIALOG
         ══════════════════════════════════════════════════ */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>

        {/* Gold accent bar */}
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #c9a84c, #dfc070, #c9a84c)' }} />

        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, pt: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2.5,
              background: 'linear-gradient(135deg, #1a2e4a, #2d4a72)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(26,46,74,0.3)',
            }}>
              <BusinessRounded sx={{ fontSize: 18, color: '#c9a84c' }} />
            </Box>
            <Box>
              <Typography fontWeight={700} fontSize="1.05rem">
                {dialog.mode === 'add' ? 'Register New Firm' : 'Edit Firm'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dialog.mode === 'add' ? 'Create firm with admin account' : 'Update firm details'}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={closeDialog} disabled={saving}
            sx={{ bgcolor: '#f5f5f5', '&:hover': { bgcolor: '#e0e0e0' } }}>
            <CloseRounded fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ bgcolor: '#fafbfc' }}>
          <Grid container spacing={2} sx={{ pt: 1 }}>

            {/* ── Section: Firm Details ── */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: '#1a2e4a' }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2e4a' }}>
                  Firm Information
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Firm Name" name="name" value={form.name} onChange={handleChange}
                required error={!!errors.name} helperText={errors.name} autoFocus={dialog.mode === 'add'}
                InputProps={{ startAdornment: <InputAdornment position="start"><BusinessRounded sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange}
                error={!!errors.email} helperText={errors.email} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="phone" value={form.phone} onChange={handleChange}
                error={!!errors.phone} helperText={errors.phone} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="PAN Number" name="pan_number" value={form.pan_number} onChange={handleChange}
                error={!!errors.pan_number} helperText={errors.pan_number || 'Format: ABCDE1234F'}
                inputProps={{ maxLength: 10, style: { textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.08em' } }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GST Number" name="gst_number" value={form.gst_number} onChange={handleChange}
                error={!!errors.gst_number} helperText={errors.gst_number || '15-digit GSTIN'}
                inputProps={{ maxLength: 15, style: { textTransform: 'uppercase', fontFamily: 'monospace', letterSpacing: '0.06em' } }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
            </Grid>

            {/* ── Section: Address ── */}
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: '#c9a84c' }} />
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2e4a' }}>
                  Address
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Office Address" name="address" value={form.address} onChange={handleChange}
                multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="City" name="city" value={form.city} onChange={handleChange}
                required error={!!errors.city} helperText={errors.city} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="State" name="state" value={form.state} onChange={handleChange}
                required error={!!errors.state} helperText={errors.state} sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Pincode" name="pincode" value={form.pincode} onChange={handleChange}
                required error={!!errors.pincode} helperText={errors.pincode}
                inputProps={{ maxLength: 6, style: { fontFamily: 'monospace', letterSpacing: '0.1em' } }}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
            </Grid>

            {/* ── Section: Admin Account (add mode only) ── */}
            {dialog.mode === 'add' && (
              <>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Box sx={{ width: 3, height: 16, borderRadius: 1, bgcolor: '#2e7d32' }} />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2e4a' }}>
                      Admin Account
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    This creates an admin user who will manage this firm
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Admin Username" name="admin_username" value={form.admin_username}
                    onChange={handleChange} required error={!!errors.admin_username} helperText={errors.admin_username}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Password" name="admin_password" type="password" value={form.admin_password}
                    onChange={handleChange} required error={!!errors.admin_password} helperText={errors.admin_password}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#fafbfc', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={closeDialog} variant="outlined" color="inherit" disabled={saving}
            sx={{ borderRadius: 2, px: 3 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || !form.name?.trim()}
            sx={{
              borderRadius: 2, px: 3, fontWeight: 600,
              background: 'linear-gradient(135deg, #1a2e4a 0%, #2d4a72 100%)',
              boxShadow: '0 4px 12px rgba(26,46,74,0.3)',
              '&:hover': { background: 'linear-gradient(135deg, #0f1d2f 0%, #1a2e4a 100%)' },
            }}>
            {saving ? <CircularProgress size={18} color="inherit" /> : dialog.mode === 'add' ? 'Register Firm' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════
           DELETE CONFIRMATION
         ══════════════════════════════════════════════════ */}
      <Dialog open={deleteDialog.open} onClose={() => !deleting && setDeleteDialog({ open: false, id: null, name: '' })}
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <Box sx={{ height: 4, bgcolor: '#c62828' }} />
        <DialogTitle fontWeight={700} sx={{ pt: 2.5 }}>Delete Firm</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{' '}
            <Typography component="span" fontWeight={700} color="text.primary">{deleteDialog.name}</Typography>
            ? This action cannot be undone and may affect associated clients.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, id: null, name: '' })} variant="outlined" color="inherit" disabled={deleting} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting} sx={{ borderRadius: 2, px: 3 }}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete Firm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ═══ TOAST ═══ */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToast({ ...toast, open: false })} severity={toast.severity} variant="filled" sx={{ borderRadius: 2, fontWeight: 500 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
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
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  EditRounded,
  DeleteRounded,
  SearchRounded,
  PersonAddRounded,
  CloseRounded,
  BusinessRounded,
} from '@mui/icons-material';
import { clientsAPI,firmsAPI } from '../api/services';
import { PageHeader, EmptyState, SectionCard } from './UI';
const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  firm: '',
};
 
export default function ClientsPage() {
  // ───────── State ─────────
  const [clients, setClients] = useState([]);
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
 
  // Dialog control
  const [dialog, setDialog] = useState({ open: false, mode: 'add', data: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
 
  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });
  const [deleting, setDeleting] = useState(false);
 
  // Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
 
  // ───────── Data Fetch ─────────
  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await clientsAPI.getAll();
      setClients(data?.results ?? data ?? []);
    } catch (e) {
      console.error('Failed to load clients:', e);
      setToast({ open: true, message: 'Failed to load clients.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);
 
  const fetchFirms = useCallback(async () => {
    try {
      const { data } = await firmsAPI.getAll();
      setFirms(data?.results ?? data ?? []);
    } catch (e) {
      console.error('Failed to load firms:', e);
    }
  }, []);
 
  useEffect(() => {
    fetchClients();
    fetchFirms();
  }, [fetchClients, fetchFirms]);
 
  // ───────── Dialog Handlers ─────────
  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setDialog({ open: true, mode: 'add', data: null });
  };
 
  const openEdit = (client) => {
    setForm({
      name: client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim(),
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      firm: client.firm ?? client.firm_id ?? '',
    });
    setErrors({});
    setDialog({ open: true, mode: 'edit', data: client });
  };
 
  const closeDialog = () => {
    if (!saving) {
      setDialog({ open: false, mode: 'add', data: null });
      setForm({ ...EMPTY_FORM });
      setErrors({});
    }
  };
 
  // ───────── Form Handling ─────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };
 
  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'Client name is required';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (form.phone && !/^[+\d\s()-]{7,15}$/.test(form.phone)) {
      errs.phone = 'Enter a valid phone number';
    }
    return errs;
  };
 
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
 
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || '',
        phone: form.phone.trim() || '',
        address: form.address.trim() || '',
        city: form.city.trim() || '',
        firm: form.firm || null, // Send null if no firm selected
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
        setToast({ open: true, message: 'Failed to save client. Please try again.', severity: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };
 
  // ───────── Delete ─────────
  const confirmDelete = (client) => {
    const name = client.name || `${client.first_name || ''} ${client.last_name || ''}`.trim();
    setDeleteDialog({ open: true, id: client.id, name });
  };
 
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await clientsAPI.remove(deleteDialog.id);
      setToast({ open: true, message: `"${deleteDialog.name}" deleted.`, severity: 'success' });
      await fetchClients();
    } catch (e) {
      console.error('Delete failed:', e);
      const msg = e.response?.data?.detail || 'Failed to delete client.';
      setToast({ open: true, message: msg, severity: 'error' });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, id: null, name: '' });
    }
  };
 
  // ───────── Helpers ─────────
  const getFirmName = (firmId) => {
    if (!firmId) return null;
    const found = firms.find((f) => f.id === firmId || String(f.id) === String(firmId));
    return found?.name ?? null;
  };
 
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const name = (c.name || `${c.first_name || ''} ${c.last_name || ''}`).toLowerCase();
    const fName = (getFirmName(c.firm ?? c.firm_id) || '').toLowerCase();
    return (
      name.includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      fName.includes(q)
    );
  });
 
  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <Box>
      {/* ── Page Header ── */}
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} total client${clients.length !== 1 ? 's' : ''}`}
        action={
          <Button variant="contained" startIcon={<PersonAddRounded />} onClick={openAdd}>
            Add Client
          </Button>
        }
      />
 
      {/* ── Main Table Card ── */}
      <SectionCard>
        {/* Search Toolbar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            placeholder="Search by name, email, phone or firm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 360 } }}
          />
        </Box>
 
        {/* Table / Loading / Empty */}
        {loading ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title={search ? 'No results found' : 'No clients yet'}
            description={search ? 'Try a different search term' : 'Add your first client to get started'}
          />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Firm</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((client, idx) => {
                  const name =
                    client.name ||
                    `${client.first_name || ''} ${client.last_name || ''}`.trim();
                  const fName = getFirmName(client.firm ?? client.firm_id);
 
                  return (
                    <TableRow key={client.id} hover>
                      {/* Row # */}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {String(idx + 1).padStart(2, '0')}
                        </Typography>
                      </TableCell>
 
                      {/* Client avatar + name */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #1a2e4a, #2d4a72)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {(name[0] || '?').toUpperCase()}
                          </Box>
                          <Typography variant="body2" fontWeight={500}>
                            {name}
                          </Typography>
                        </Box>
                      </TableCell>
 
                      {/* Firm badge */}
                      <TableCell>
                        {fName ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <BusinessRounded sx={{ fontSize: 13, color: '#1565c0' }} />
                            <Typography
                              variant="body2"
                              sx={{ color: 'primary.main', fontWeight: 500 }}
                            >
                              {fName}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
 
                      {/* Email */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {client.email || '—'}
                        </Typography>
                      </TableCell>
 
                      {/* Phone */}
                      <TableCell>
                        <Typography variant="body2">{client.phone || '—'}</Typography>
                      </TableCell>
 
                      {/* City */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {client.city || '—'}
                        </Typography>
                      </TableCell>
 
                      {/* Actions */}
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => openEdit(client)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => confirmDelete(client)}
                            sx={{ color: 'error.main', ml: 0.5 }}
                          >
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
      <Dialog
        open={dialog.open}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          <Typography fontWeight={700}>
            {dialog.mode === 'add' ? 'Add New Client' : 'Edit Client'}
          </Typography>
          <IconButton size="small" onClick={closeDialog} disabled={saving}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>
 
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {/* Full Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                error={!!errors.name}
                helperText={errors.name}
                autoFocus={dialog.mode === 'add'}
              />
            </Grid>
 
            {/* Firm Selection Dropdown */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Associated Firm"
                name="firm"
                value={form.firm}
                onChange={handleChange}
                error={!!errors.firm}
                helperText={errors.firm || 'Optional — select the law firm this client belongs to'}
                InputProps={{
                  startAdornment: form.firm ? (
                    <InputAdornment position="start">
                      <BusinessRounded sx={{ fontSize: 16, color: '#1565c0' }} />
                    </InputAdornment>
                  ) : null,
                }}
              >
                <MenuItem value="">
                  <Typography color="text.secondary" variant="body2">
                    — No Firm —
                  </Typography>
                </MenuItem>
                {firms.length === 0 ? (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.disabled">
                      No firms registered yet — add one in the Firms page
                    </Typography>
                  </MenuItem>
                ) : (
                  firms.map((firm) => (
                    <MenuItem key={firm.id} value={firm.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessRounded sx={{ fontSize: 15, color: '#1565c0' }} />
                        <Typography variant="body2">{firm.name}</Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
 
            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>
 
            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
              />
            </Grid>
 
            {/* City */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                 error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
 
            {/* Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
 
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={closeDialog} variant="outlined" color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !form.name?.trim()}
          >
            {saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : dialog.mode === 'add' ? (
              'Add Client'
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* ══════════════════════════════════════════════════
           DELETE CONFIRMATION DIALOG
         ══════════════════════════════════════════════════ */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => !deleting && setDeleteDialog({ open: false, id: null, name: '' })}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>Delete Client</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{' '}
            <Typography component="span" fontWeight={700} color="text.primary">
              {deleteDialog.name}
            </Typography>
            ? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}
            variant="outlined"
            color="inherit"
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
 
      {/* ══════════════════════════════════════════════════
           TOAST NOTIFICATION
         ══════════════════════════════════════════════════ */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
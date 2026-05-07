import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, CircularProgress, Typography, Grid, TextField
} from '@mui/material';

import { AddRounded, CloseRounded, EditRounded, DeleteRounded } from '@mui/icons-material';

import { paymentsAPI, casesAPI, clientsAPI } from '../api/services';
import { PageHeader, EmptyState, SectionCard, StatusChip } from './UI';

// ✅ DEFAULT FORM
const EMPTY_FORM = {
  client: '',
  case: '',
  amount: '',
  payment_date: '',
  payment_method: 'cash',
  status: 'pending',
  notes: ''
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ✅ EDIT STATE
  const [editingId, setEditingId] = useState(null); // null = create mode, id = edit mode

  // ✅ DELETE CONFIRM DIALOG
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ FETCH DATA
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payRes, caseRes, clientRes] = await Promise.allSettled([
        paymentsAPI.getAll(),
        casesAPI.getAll(),
        clientsAPI.getAll(),
      ]);

      if (payRes.status === 'fulfilled')
        setPayments(payRes.value.data?.results ?? payRes.value.data ?? []);

      if (caseRes.status === 'fulfilled')
        setCases(caseRes.value.data?.results ?? caseRes.value.data ?? []);

      if (clientRes.status === 'fulfilled')
        setClients(clientRes.value.data?.results ?? clientRes.value.data ?? []);

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ OPEN DIALOG FOR CREATE
  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialog(true);
  };

  // ✅ OPEN DIALOG FOR EDIT
  const handleOpenEdit = (payment) => {
    setEditingId(payment.id);
    setForm({
      client: payment.client ?? '',
      case: payment.case ?? '',
      amount: payment.amount ?? '',
      payment_date: payment.payment_date ?? '',
      payment_method: payment.payment_method || 'cash',
      status: payment.status ?? 'pending',
      notes: payment.notes ?? '',
    });
    setDialog(true);
  };

  // ✅ CLOSE DIALOG
  const handleCloseDialog = () => {
    setDialog(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  // ✅ SAVE (CREATE or UPDATE)
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        payment_method: form.payment_method || 'cash',
      };

      if (editingId) {
        // UPDATE mode
        await paymentsAPI.update(editingId, payload);
      } else {
        // CREATE mode
        await paymentsAPI.create(payload);
      }

      await fetchData();
      handleCloseDialog();

    } catch (e) {
      console.error('SAVE ERROR:', e);
    } finally {
      setSaving(false);
    }
  };

  // ✅ OPEN DELETE CONFIRM
  const handleOpenDelete = (payment) => {
    setDeletingPayment(payment);
    setDeleteDialog(true);
  };

  // ✅ CONFIRM DELETE
  const handleConfirmDelete = async () => {
    if (!deletingPayment) return;
    setDeleting(true);
    try {
      await paymentsAPI.delete(deletingPayment.id);
      await fetchData();
      setDeleteDialog(false);
      setDeletingPayment(null);
    } catch (e) {
      console.error('DELETE ERROR:', e);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ SUMMARY CALCULATIONS
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const totalPending = payments
    .filter(p => p.status !== 'paid')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const filteredCases = cases.filter(
    (c) => String(c.client) === String(form.client)
  );

  return (
    <Box>

      {/* HEADER */}
      <PageHeader
        title="Payments"
        subtitle={`${payments.length} payment record${payments.length !== 1 ? 's' : ''}`}
        action={
          <Button variant="contained" startIcon={<AddRounded />} onClick={handleOpenCreate}>
            Add Payment
          </Button>
        }
      />

      {/* SUMMARY */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Received', value: totalPaid, color: '#2e7d32' },
          { label: 'Total Pending', value: totalPending, color: '#e65100' },
          { label: 'Total Records', value: payments.length, color: '#1565c0', isCount: true },
        ].map(({ label, value, color, isCount }) => (
          <Box key={label} sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, flex: 1 }}>
            <Typography variant="caption">{label}</Typography>
            <Typography variant="h5" sx={{ color }}>
              {isCount ? value : `₹${value}`}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* TABLE */}
      <SectionCard>
        {loading ? (
          <Box sx={{ textAlign: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : payments.length === 0 ? (
          <EmptyState title="No payments yet" description="Add your first payment" />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Case</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {payments.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell>{i + 1}</TableCell>

                    <TableCell>{p.client_name || '—'}</TableCell>

                    <TableCell>{p.case_title || '—'}</TableCell>

                    <TableCell>₹{p.amount}</TableCell>

                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {p.payment_method
                        ? p.payment_method.replace('_', ' ')
                        : '—'}
                    </TableCell>

                    <TableCell>
                      {p.payment_date
                        ? new Date(p.payment_date).toLocaleDateString()
                        : '—'}
                    </TableCell>

                    <TableCell>
                      <StatusChip status={p.status} />
                    </TableCell>

                    {/* ✅ ACTIONS COLUMN */}
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(p)}
                        title="Edit payment"
                      >
                        <EditRounded fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(p)}
                        title="Delete payment"
                      >
                        <DeleteRounded fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {/* ✅ CREATE / EDIT DIALOG */}
      <Dialog open={dialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? 'Edit Payment' : 'Add Payment'}
          <IconButton onClick={handleCloseDialog} sx={{ float: 'right' }}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} mt={1}>

            {/* CLIENT */}
            <Grid item xs={6}>
              <TextField select fullWidth label="Client" name="client" value={form.client} onChange={handleChange}>
                {clients.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* CASE */}
            <Grid item xs={6}>
              <TextField select fullWidth label="Case" name="case" value={form.case} onChange={handleChange}>
                {filteredCases.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth label="Amount" name="amount" value={form.amount} onChange={handleChange} />
            </Grid>

            <Grid item xs={6}>
              <TextField fullWidth type="date" name="payment_date" value={form.payment_date} onChange={handleChange} />
            </Grid>

            {/* METHOD */}
            <Grid item xs={6}>
              <TextField select fullWidth label="Method" name="payment_method" value={form.payment_method} onChange={handleChange}>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField select fullWidth label="Status" name="status" value={form.status} onChange={handleChange}>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label="Notes" name="notes" value={form.notes} onChange={handleChange} />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Payment' : 'Save Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ DELETE CONFIRM DIALOG */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this payment
            {deletingPayment?.client_name ? ` for ${deletingPayment.client_name}` : ''}
            {deletingPayment?.amount ? ` of ₹${deletingPayment.amount}` : ''}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
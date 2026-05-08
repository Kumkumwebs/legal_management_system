import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, Dialog, DialogContent, DialogActions,
  IconButton, MenuItem, CircularProgress, Typography,
  LinearProgress, TextField, Tooltip, Snackbar, Alert, Chip,
} from "@mui/material";
import {
  UploadFileRounded, DownloadRounded, CloseRounded,
  InsertDriveFileRounded, VisibilityRounded, DeleteRounded,
  FolderRounded, PictureAsPdfRounded, ImageRounded,
  TableChartRounded, CodeRounded, DescriptionRounded,
  FilterListRounded, GavelRounded, ArrowForwardRounded,
} from "@mui/icons-material";
import { documentsAPI, casesAPI } from "../api/services";

// ── File type config ──
const getFileConfig = (ext) => {
  const e = (ext || '').toLowerCase();
  if (['pdf'].includes(e)) return { icon: PictureAsPdfRounded, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', label: 'PDF' };
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(e)) return { icon: ImageRounded, color: '#8B5CF6', bg: '#F5F3FF', border: '#EDE9FE', label: 'Image' };
  if (['xlsx', 'xls', 'csv'].includes(e)) return { icon: TableChartRounded, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', label: 'Sheet' };
  if (['doc', 'docx'].includes(e)) return { icon: DescriptionRounded, color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', label: 'Word' };
  if (['js', 'ts', 'py', 'json', 'html', 'css'].includes(e)) return { icon: CodeRounded, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', label: 'Code' };
  return { icon: InsertDriveFileRounded, color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', label: ext?.toUpperCase() || 'FILE' };
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

// ── Document Card ──
const DocCard = ({ doc, onPreview, onDownload, onDelete }) => {
  const fname = doc.file ? doc.file.split('/').pop() : 'Unnamed';
  const ext = fname.includes('.') ? fname.split('.').pop() : '';
  const cfg = getFileConfig(ext);
  const Icon = cfg.icon;
  const nameWithoutExt = fname.replace(`.${ext}`, '');

  return (
    <Box sx={{
      bgcolor: '#fff', borderRadius: '16px', border: '1px solid #F0EDE5',
      overflow: 'hidden', transition: 'all 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: '#E2D9C0' },
    }}>
      {/* Top accent */}
      <Box sx={{ height: 3, bgcolor: cfg.color, opacity: 0.7 }} />

      <Box sx={{ p: 2.5 }}>
        {/* Icon + type badge */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            bgcolor: cfg.bg, border: `1px solid ${cfg.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon sx={{ color: cfg.color, fontSize: 22 }} />
          </Box>
          <Box sx={{ px: 1.2, py: 0.3, borderRadius: '8px', bgcolor: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <Typography sx={{ fontSize: 10, fontWeight: 800, color: cfg.color, letterSpacing: '0.06em' }}>
              {cfg.label}
            </Typography>
          </Box>
        </Box>

        {/* File name */}
        <Typography sx={{
          fontSize: 13, fontWeight: 700, color: '#0D1B2A',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 0.5,
        }}>
          {nameWithoutExt}
        </Typography>
        <Typography sx={{ fontSize: 10, color: '#9CA3AF', mb: 2, fontFamily: 'monospace' }}>
          .{ext.toUpperCase()}
        </Typography>

        {/* Case tag */}
        {(doc.case_title || doc.case) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 2.5 }}>
            <GavelRounded sx={{ fontSize: 11, color: '#C9A84C' }} />
            <Typography sx={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {doc.case_title || `Case #${doc.case}`}
            </Typography>
          </Box>
        )}

        {/* Divider */}
        <Box sx={{ height: '1px', bgcolor: '#F5F4F0', mb: 2 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Preview">
            <IconButton size="small" onClick={() => onPreview(doc)} sx={{
              color: '#0D1B2A', bgcolor: '#F5F4F0', borderRadius: '8px',
              '&:hover': { bgcolor: '#E8E4DC' }, flex: 1, borderRadius: '8px',
            }}>
              <VisibilityRounded sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => onDownload(doc)} sx={{
              color: '#3B82F6', bgcolor: '#EFF6FF', borderRadius: '8px',
              '&:hover': { bgcolor: '#DBEAFE' }, flex: 1,
            }}>
              <DownloadRounded sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => onDelete(doc.id)} sx={{
              color: '#EF4444', bgcolor: '#FEF2F2', borderRadius: '8px',
              '&:hover': { bgcolor: '#FEE2E2' },
            }}>
              <DeleteRounded sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterCase, setFilterCase] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const fileInputRef = useRef();

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, caseRes] = await Promise.allSettled([
        documentsAPI.getAll(),
        casesAPI.getAll(),
      ]);
      if (docRes.status === 'fulfilled') setDocuments(docRes.value.data?.results ?? docRes.value.data ?? []);
      if (caseRes.status === 'fulfilled') setCases(caseRes.value.data?.results ?? caseRes.value.data ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadPct(0);

    // Simulate progress for UX
    const interval = setInterval(() => setUploadPct(p => Math.min(p + 12, 85)), 200);

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedCase) formData.append('case', selectedCase);

    try {
      await documentsAPI.upload(formData);
      clearInterval(interval);
      setUploadPct(100);
      setTimeout(() => {
        setDialog(false);
        setSelectedFile(null);
        setSelectedCase('');
        setUploadPct(0);
        fetchData();
        notify('Document uploaded successfully');
      }, 400);
    } catch (e) {
      clearInterval(interval);
      notify('Upload failed', 'error');
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const res = await documentsAPI.download(doc.id);
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file ? doc.file.split('/').pop() : 'document';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify('Download started');
    } catch (e) { notify('Download failed', 'error'); console.error(e); }
  };

  const handlePreview = (doc) => {
    if (!doc.file) return;
    const url = doc.file.startsWith('http') ? doc.file : `http://127.0.0.1:8000${doc.file}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);

      await documentsAPI.delete(deleteId);

      notify('Document deleted successfully');

      setDeleteId(null);

      fetchData();// refresh list
    } catch (e) {
      console.error('Delete failed:', e);

      notify(
        e.response?.data?.detail ||
        e.response?.data?.error ||
        'Failed to delete document',
        'error'
      );
    } finally {
      setDeleting(false);
    }
  };

  // Drag & drop
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const filtered = filterCase
    ? documents.filter(d => String(d.case) === filterCase)
    : documents;

  // Stats
  const byType = {};
  documents.forEach(d => {
    const ext = (d.file?.split('.').pop() || 'other').toLowerCase();
    byType[ext] = (byType[ext] || 0) + 1;
  });

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
        <Box sx={{ position: 'absolute', bottom: -30, left: 160, width: 140, height: 140, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: 'rgba(201,168,76,0.15)', borderRadius: '9px', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderRounded sx={{ color: '#C9A84C', fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase' }}>
                HP HCMS · Documents
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#fff', lineHeight: 1.15, mb: 0.5 }}>
              Document Vault
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
              {documents.length} documents stored · Upload, preview and manage case files
            </Typography>
          </Box>
          <Button startIcon={<UploadFileRounded />} onClick={() => setDialog(true)} sx={{
            bgcolor: '#C9A84C', color: '#0D1B2A', borderRadius: '12px', px: 3, py: 1.4,
            fontWeight: 800, textTransform: 'none', fontSize: 14,
            boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
            '&:hover': { bgcolor: '#DFC070', transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(201,168,76,0.5)' },
            transition: 'all 0.2s',
          }}>
            Upload Document
          </Button>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 4, mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Files', value: documents.length, color: '#fff' },
            { label: 'PDF', value: documents.filter(d => d.file?.endsWith('.pdf')).length, color: '#F87171' },
            { label: 'Images', value: documents.filter(d => /\.(jpg|jpeg|png|gif|webp)$/i.test(d.file || '')).length, color: '#C084FC' },
            { label: 'Word / Docs', value: documents.filter(d => /\.(doc|docx)$/i.test(d.file || '')).length, color: '#60A5FA' },
          ].map(s => (
            <Box key={s.label}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, mt: 0.3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ══ FILTER BAR ══ */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListRounded sx={{ fontSize: 16, color: '#9CA3AF' }} />
          <Typography sx={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600 }}>Filter by case:</Typography>
        </Box>

        {/* All pill */}
        <Box onClick={() => setFilterCase('')} sx={{
          px: 2, py: 0.7, borderRadius: '20px', cursor: 'pointer',
          bgcolor: !filterCase ? '#0D1B2A' : '#fff',
          border: `1px solid ${!filterCase ? '#0D1B2A' : 'rgba(0,0,0,0.08)'}`,
          transition: 'all 0.2s',
          '&:hover': { borderColor: '#0D1B2A' },
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: !filterCase ? '#fff' : '#64748B' }}>
            All ({documents.length})
          </Typography>
        </Box>

        {cases.map(c => {
          const count = documents.filter(d => String(d.case) === String(c.id)).length;
          const active = filterCase === String(c.id);
          return (
            <Box key={c.id} onClick={() => setFilterCase(String(c.id))} sx={{
              px: 2, py: 0.7, borderRadius: '20px', cursor: 'pointer',
              bgcolor: active ? '#C9A84C' : '#fff',
              border: `1px solid ${active ? '#C9A84C' : 'rgba(0,0,0,0.08)'}`,
              display: 'flex', alignItems: 'center', gap: 1,
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#C9A84C' },
            }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? '#0D1B2A' : '#64748B' }}>
                {c.title || `Case #${c.id}`}
              </Typography>
              {count > 0 && (
                <Box sx={{ px: 0.8, py: 0.1, borderRadius: '8px', bgcolor: active ? 'rgba(13,27,42,0.15)' : '#F5F4F0' }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 800, color: active ? '#0D1B2A' : '#9CA3AF' }}>{count}</Typography>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* ══ DOCUMENT GRID ══ */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#0D1B2A' }} size={28} />
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', p: 8, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, bgcolor: '#F5F4F0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <FolderRounded sx={{ fontSize: 30, color: '#D0CEC7' }} />
          </Box>
          <Typography sx={{ color: '#0D1B2A', fontSize: 15, fontWeight: 600, mb: 0.5 }}>No documents found</Typography>
          <Typography sx={{ color: '#9CA3AF', fontSize: 13, mb: 3 }}>
            {filterCase ? 'No documents for this case' : 'Upload your first document to get started'}
          </Typography>
          <Button onClick={() => setDialog(true)} startIcon={<UploadFileRounded />}
            sx={{ bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', px: 3, textTransform: 'none', fontWeight: 700 }}>
            Upload Document
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
          {filtered.map(doc => (
            <DocCard key={doc.id} doc={doc} onPreview={handlePreview} onDownload={handleDownload} onDelete={handleDelete} />
          ))}
        </Box>
      )}

      {/* ══ UPLOAD DIALOG ══ */}
      <Dialog open={dialog} onClose={() => { if (!uploading) { setDialog(false); setSelectedFile(null); setSelectedCase(''); } }}
        maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>

        {/* Dark header */}
        <Box sx={{ bgcolor: '#0D1B2A', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>Upload Document</Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mt: 0.2 }}>Select a file and optionally link it to a case</Typography>
          </Box>
          <IconButton onClick={() => { if (!uploading) { setDialog(false); setSelectedFile(null); setSelectedCase(''); } }}
            sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
            <CloseRounded />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Drop zone */}
          <Box
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            sx={{
              border: `2px dashed ${dragOver ? '#C9A84C' : selectedFile ? '#10B981' : '#E8E4DC'}`,
              borderRadius: '14px',
              p: 4, textAlign: 'center', cursor: 'pointer',
              bgcolor: dragOver ? '#FFF8E7' : selectedFile ? '#ECFDF5' : '#F8F7F4',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#C9A84C', bgcolor: '#FFF8E7' },
            }}
          >
            {selectedFile ? (
              <Box>
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: '#D1FAE5', border: '1px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                  <InsertDriveFileRounded sx={{ color: '#10B981', fontSize: 26 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#065F46', mb: 0.3 }}>
                  {selectedFile.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
                </Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: '#F5F4F0', border: '1px solid #E8E4DC', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                  <UploadFileRounded sx={{ color: '#9CA3AF', fontSize: 26 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0D1B2A', mb: 0.3 }}>
                  Drop file here or click to browse
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>
                  PDF, Word, Excel, Images supported
                </Typography>
              </Box>
            )}
            <input ref={fileInputRef} type="file" hidden onChange={e => setSelectedFile(e.target.files[0])} />
          </Box>

          {/* Case selector */}
          <TextField select fullWidth label="Link to Case (optional)" value={selectedCase}
            onChange={e => setSelectedCase(e.target.value)} sx={inputSx}>
            <MenuItem value="">None</MenuItem>
            {cases.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.title || `Case #${c.id}`}</MenuItem>
            ))}
          </TextField>

          {/* Upload progress */}
          {uploading && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Uploading…</Typography>
                <Typography sx={{ fontSize: 12, color: '#0D1B2A', fontWeight: 700 }}>{uploadPct}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={uploadPct}
                sx={{ borderRadius: 4, height: 5, bgcolor: '#F5F4F0', '& .MuiLinearProgress-bar': { bgcolor: '#C9A84C', borderRadius: 4 } }} />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { if (!uploading) { setDialog(false); setSelectedFile(null); setSelectedCase(''); } }}
            sx={{ textTransform: 'none', color: '#9CA3AF', fontWeight: 600, borderRadius: '10px' }}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading} sx={{
            bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', px: 3.5, borderRadius: '10px', fontWeight: 700,
            '&:hover': { bgcolor: '#1B3050' },
            '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' },
          }}>
            {uploading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ DELETE CONFIRM ══ */}
      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        maxWidth="xs"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ bgcolor: '#FEF2F2', px: 3, py: 2.5, borderBottom: '1px solid #FECACA' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, bgcolor: '#FEE2E2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DeleteRounded sx={{ fontSize: 18, color: '#EF4444' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#991B1B' }}>Delete Document</Typography>
              <Typography sx={{ fontSize: 12, color: '#EF4444' }}>This action cannot be undone</Typography>
            </Box>
          </Box>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: 13, color: '#3A3A35', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete this document? It will be removed from all associated cases.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}
            sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600, borderRadius: '10px' }}>Cancel</Button>
          <Button onClick={confirmDelete} disabled={deleting}
            sx={{ bgcolor: '#EF4444', color: '#fff', textTransform: 'none', px: 3, borderRadius: '10px', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>
            {deleting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
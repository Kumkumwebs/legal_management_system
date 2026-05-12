import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, Dialog, DialogContent, DialogActions,
  IconButton, MenuItem, CircularProgress, Typography,
  LinearProgress, TextField, Tooltip, Snackbar, Alert,
} from "@mui/material";
import {
  UploadFileRounded, DownloadRounded, CloseRounded,
  InsertDriveFileRounded, VisibilityRounded, DeleteRounded,
  FolderRounded, PictureAsPdfRounded, ImageRounded,
  TableChartRounded, CodeRounded, DescriptionRounded,
} from "@mui/icons-material";
import { documentsAPI, casesAPI } from "../api/services";
import PageHero from '../components/PageHero';

const getFileConfig = (ext) => {
  const e = (ext || '').toLowerCase();
  if (['pdf'].includes(e))                              return { icon: PictureAsPdfRounded, color: '#EF4444', bg: '#FEF2F2', label: 'PDF' };
  if (['jpg','jpeg','png','gif','webp','svg'].includes(e)) return { icon: ImageRounded,         color: '#8B5CF6', bg: '#F5F3FF', label: 'Image' };
  if (['xlsx','xls','csv'].includes(e))                 return { icon: TableChartRounded,    color: '#10B981', bg: '#ECFDF5', label: 'Sheet' };
  if (['doc','docx'].includes(e))                       return { icon: DescriptionRounded,   color: '#3B82F6', bg: '#EFF6FF', label: 'Word' };
  if (['js','ts','py','json','html','css'].includes(e)) return { icon: CodeRounded,          color: '#F59E0B', bg: '#FFFBEB', label: 'Code' };
  return { icon: InsertDriveFileRounded, color: '#6B7280', bg: '#F9FAFB', label: ext?.toUpperCase() || 'FILE' };
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

const DocCard = ({ doc, onPreview, onDownload, onDelete }) => {
  const fname = doc.file ? doc.file.split('/').pop() : 'Unnamed';
  const ext   = fname.includes('.') ? fname.split('.').pop() : 'file';
  const cfg   = getFileConfig(ext);
  const Icon  = cfg.icon;
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '14px', border: '1px solid #F0EDE5', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transform: 'translateY(-2px)' } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 40, height: 40, bgcolor: cfg.bg, border: `1px solid ${cfg.border || cfg.bg}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon sx={{ color: cfg.color, fontSize: 20 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fname}</Typography>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 1, py: 0.2, bgcolor: cfg.bg, borderRadius: '6px', mt: 0.3 }}>
            <Typography sx={{ fontSize: 10, fontWeight: 700, color: cfg.color }}>{cfg.label}</Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <Tooltip title="Preview"><IconButton size="small" onClick={() => onPreview(doc)} sx={{ color: '#10B981', bgcolor: '#ECFDF5', borderRadius: '8px', '&:hover': { bgcolor: '#D1FAE5' }, flex: 1 }}><VisibilityRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Download"><IconButton size="small" onClick={() => onDownload(doc)} sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', borderRadius: '8px', '&:hover': { bgcolor: '#DBEAFE' }, flex: 1 }}><DownloadRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>
        <Tooltip title="Delete"><IconButton size="small" onClick={() => onDelete(doc.id)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2', borderRadius: '8px', '&:hover': { bgcolor: '#FEE2E2' } }}><DeleteRounded sx={{ fontSize: 16 }} /></IconButton></Tooltip>
      </Box>
    </Box>
  );
};

export default function DocumentsPage() {
  const [documents,    setDocuments]    = useState([]);
  const [cases,        setCases]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [dialog,       setDialog]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [uploadPct,    setUploadPct]    = useState(0);
  const [selectedCase, setSelectedCase] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterCase,   setFilterCase]   = useState('');
  const [dragOver,     setDragOver]     = useState(false);
  const [deleteId,     setDeleteId]     = useState(null);
  const [deleting,     setDeleting]     = useState(false);
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });
  const fileInputRef = useRef();

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, caseRes] = await Promise.allSettled([documentsAPI.getAll(), casesAPI.getAll()]);
      if (docRes.status  === 'fulfilled') setDocuments(docRes.value.data?.results  ?? docRes.value.data  ?? []);
      if (caseRes.status === 'fulfilled') setCases(caseRes.value.data?.results ?? caseRes.value.data ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true); setUploadPct(0);
    const interval = setInterval(() => setUploadPct(p => Math.min(p + 12, 85)), 200);
    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedCase) formData.append('case', selectedCase);
    try {
      await documentsAPI.upload(formData);
      clearInterval(interval); setUploadPct(100);
      setTimeout(() => { setDialog(false); setSelectedFile(null); setSelectedCase(''); setUploadPct(0); fetchData(); notify('Document uploaded successfully'); }, 400);
    } catch { clearInterval(interval); notify('Upload failed', 'error'); }
    finally { setUploading(false); }
  };

  const handleDownload = async (doc) => {
    try {
      const res  = await documentsAPI.download(doc.id);
      const blob = new Blob([res.data]);
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = doc.file ? doc.file.split('/').pop() : 'document';
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url); notify('Download started');
    } catch { notify('Download failed', 'error'); }
  };

  const handlePreview = (doc) => {
    if (!doc.file) return;
    const url = doc.file.startsWith('http') ? doc.file : `http://127.0.0.1:8000${doc.file}`;
    window.open(url, '_blank');
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await documentsAPI.delete(deleteId);
      notify('Document deleted'); setDeleteId(null); fetchData();
    } catch (e) { notify(e.response?.data?.detail || 'Failed to delete', 'error'); }
    finally { setDeleting(false); }
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files[0]; if (file) setSelectedFile(file); };
  const filtered   = filterCase ? documents.filter(d => String(d.case) === filterCase) : documents;

  const byType = {};
  documents.forEach(d => { const ext = (d.file?.split('.').pop() || 'other').toLowerCase(); byType[ext] = (byType[ext] || 0) + 1; });

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>

      {/* ✅ HERO — uses theme colors */}
      <PageHero
        label="HP HCMS · Documents"
        icon={<FolderRounded />}
        title="Document Vault"
        subtitle={`${documents.length} documents stored · Upload, preview and manage files`}
        action={
          <Button onClick={() => setDialog(true)} startIcon={<UploadFileRounded />} sx={{
            bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.25)',
            color: '#fff', borderRadius: '12px', px: 3, py: 1.4,
            fontWeight: 800, textTransform: 'none', fontSize: 14,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'translateY(-1px)' },
            transition: 'all 0.2s',
          }}>
            Upload
          </Button>
        }
      />

      {/* Filter by case */}
      {cases.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <TextField select size="small" label="Filter by Case" value={filterCase} onChange={e => setFilterCase(e.target.value)} sx={{ width: 260, ...inputSx }}>
            <MenuItem value="">All Cases</MenuItem>
            {cases.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.title || `Case #${c.id}`}</MenuItem>)}
          </TextField>
        </Box>
      )}

      {loading ? (
        <Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress sx={{ color: '#0D1B2A' }} /></Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ p: 10, textAlign: 'center' }}>
          <Box sx={{ width: 64, height: 64, bgcolor: '#F5F4F0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
            <FolderRounded sx={{ fontSize: 30, color: '#D0CEC7' }} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: 15, color: '#0D1B2A', mb: 0.5 }}>{filterCase ? 'No documents for this case' : 'No documents yet'}</Typography>
          <Typography sx={{ fontSize: 13, color: '#9CA3AF', mb: 3 }}>{filterCase ? 'Try a different case' : 'Upload your first document to get started'}</Typography>
          <Button onClick={() => setDialog(true)} startIcon={<UploadFileRounded />} sx={{ bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', px: 3, textTransform: 'none', fontWeight: 700 }}>
            Upload Document
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' }, gap: 2 }}>
          {filtered.map(doc => <DocCard key={doc.id} doc={doc} onPreview={handlePreview} onDownload={handleDownload} onDelete={setDeleteId} />)}
        </Box>
      )}

      {/* Upload dialog */}
      <Dialog open={dialog} onClose={() => { if (!uploading) { setDialog(false); setSelectedFile(null); setSelectedCase(''); } }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}>
        <Box sx={{ bgcolor: '#0D1B2A', px: 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>Upload Document</Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', mt: 0.2 }}>Select a file and optionally link it to a case</Typography>
          </Box>
          <IconButton onClick={() => { if (!uploading) { setDialog(false); setSelectedFile(null); setSelectedCase(''); } }} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#fff' } }}>
            <CloseRounded />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current.click()}
            sx={{ border: `2px dashed ${dragOver ? '#C9A84C' : selectedFile ? '#10B981' : '#E8E4DC'}`, borderRadius: '14px', p: 4, textAlign: 'center', cursor: 'pointer', bgcolor: dragOver ? '#FFF8E7' : selectedFile ? '#ECFDF5' : '#F8F7F4', transition: 'all 0.2s', '&:hover': { borderColor: '#C9A84C', bgcolor: '#FFF8E7' } }}>
            {selectedFile ? (
              <Box>
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                  <InsertDriveFileRounded sx={{ color: '#10B981', fontSize: 26 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#065F46', mb: 0.3 }}>{selectedFile.name}</Typography>
                <Typography sx={{ fontSize: 12, color: '#6B7280' }}>{(selectedFile.size / 1024).toFixed(1)} KB · Click to change</Typography>
              </Box>
            ) : (
              <Box>
                <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: '#F5F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                  <UploadFileRounded sx={{ color: '#9CA3AF', fontSize: 26 }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0D1B2A', mb: 0.3 }}>Drop file here or click to browse</Typography>
                <Typography sx={{ fontSize: 12, color: '#9CA3AF' }}>PDF, Word, Excel, Images supported</Typography>
              </Box>
            )}
            <input ref={fileInputRef} type="file" hidden onChange={e => setSelectedFile(e.target.files[0])} />
          </Box>
          <TextField select fullWidth label="Link to Case (optional)" value={selectedCase} onChange={e => setSelectedCase(e.target.value)} sx={inputSx}>
            <MenuItem value="">None</MenuItem>
            {cases.map(c => <MenuItem key={c.id} value={c.id}>{c.title || `Case #${c.id}`}</MenuItem>)}
          </TextField>
          {uploading && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Uploading…</Typography>
                <Typography sx={{ fontSize: 12, color: '#0D1B2A', fontWeight: 700 }}>{uploadPct}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={uploadPct} sx={{ borderRadius: 4, height: 5, bgcolor: '#F5F4F0', '& .MuiLinearProgress-bar': { bgcolor: '#C9A84C', borderRadius: 4 } }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => { if (!uploading) { setDialog(false); setSelectedFile(null); setSelectedCase(''); } }} sx={{ textTransform: 'none', color: '#9CA3AF', fontWeight: 600, borderRadius: '10px' }}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading} sx={{ bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', px: 3.5, borderRadius: '10px', fontWeight: 700, '&:hover': { bgcolor: '#1B3050' }, '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' } }}>
            {uploading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onClose={() => !deleting && setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '20px' } }}>
        <Box sx={{ bgcolor: '#FEF2F2', px: 3, py: 2.5, borderBottom: '1px solid #FECACA' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#991B1B' }}>Delete Document</Typography>
          <Typography sx={{ fontSize: 12, color: '#EF4444' }}>This action cannot be undone</Typography>
        </Box>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontSize: 13, color: '#3A3A35', lineHeight: 1.6 }}>Are you sure you want to permanently delete this document?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} disabled={deleting} sx={{ textTransform: 'none', color: '#9CA3AF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>Cancel</Button>
          <Button onClick={confirmDelete} disabled={deleting} sx={{ bgcolor: '#EF4444', color: '#fff', textTransform: 'none', borderRadius: '10px', fontWeight: 700, '&:hover': { bgcolor: '#DC2626' } }}>
            {deleting ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
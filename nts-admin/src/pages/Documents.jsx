import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, MenuItem, CircularProgress, Typography,
  LinearProgress, TextField
} from "@mui/material";

import {
  UploadFileRounded,
  DownloadRounded,
  CloseRounded,
  InsertDriveFileRounded,
  VisibilityRounded,
  DeleteRounded
} from "@mui/icons-material";

import { documentsAPI, casesAPI } from "../api/services";
import { PageHeader, EmptyState, SectionCard } from "./UI";

export default function DocumentsPage() {

  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterCase, setFilterCase] = useState("");
  const fileInputRef = useRef();

  // 🔥 Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [docRes, caseRes] = await Promise.allSettled([
        documentsAPI.getAll(),
        casesAPI.getAll(),
      ]);

      if (docRes.status === "fulfilled") {
        setDocuments(docRes.value.data?.results ?? docRes.value.data ?? []);
      }

      if (caseRes.status === "fulfilled") {
        setCases(caseRes.value.data?.results ?? caseRes.value.data ?? []);
      }

    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 🔥 Upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    if (selectedCase) {
      formData.append("case", selectedCase);
    }

    try {
      await documentsAPI.upload(formData);
      await fetchData();

      setDialog(false);
      setSelectedFile(null);
      setSelectedCase("");

    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  // 🔥 Download (FIXED)
  const handleDownload = async (doc) => {
    try {
      const res = await documentsAPI.download(doc.id);

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = doc.file ? doc.file.split("/").pop() : "document";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error("Download error:", e);
    }
  };

  // 🔥 Preview (FIXED URL ISSUE)
  const handlePreview = (doc) => {
    if (!doc.file) return;

    const fileUrl = doc.file.startsWith("http")
      ? doc.file
      : `http://127.0.0.1:8000${doc.file}`;

    window.open(fileUrl, "_blank");
  };

  // 🔥 Delete
const handleDelete = async (id) => {
  if (!window.confirm("Delete this document?")) return;

  try {
    await documentsAPI.delete(id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  } catch (err) {
    console.error("Delete error:", err);
  }
};

  const filtered = filterCase
    ? documents.filter(d => String(d.case) === filterCase)
    : documents;

  return (
    <Box>

      <PageHeader
        title="Documents"
        subtitle={`${documents.length} documents`}
        action={
          <Button
            variant="contained"
            startIcon={<UploadFileRounded />}
            onClick={() => setDialog(true)}
          >
            Upload
          </Button>
        }
      />

      <SectionCard>

        <Box sx={{ p: 2 }}>
          <TextField
            select
            label="Filter by Case"
            value={filterCase}
            onChange={(e) => setFilterCase(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {cases.map(c => (
              <MenuItem key={c.id} value={String(c.id)}>
                {c.title || `Case #${c.id}`}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <EmptyState title="No documents found" />
        ) : (
          <TableContainer>
            <Table>

              <TableHead>
                <TableRow>
                  <TableCell>File</TableCell>
                  <TableCell>Case</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((doc) => {

                  const fname = doc.file
                    ? doc.file.split("/").pop()
                    : "Unnamed";

                  const ext = fname.split(".").pop().toUpperCase();

                  return (
                    <TableRow key={doc.id}>

                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <InsertDriveFileRounded />
                          {fname}
                        </Box>
                      </TableCell>

                      <TableCell>
                        {doc.case_title || `Case #${doc.case}`}
                      </TableCell>

                      <TableCell>{ext}</TableCell>

                      <TableCell>

                        {/* 👁 Preview */}
                        <IconButton onClick={() => handlePreview(doc)}>
                          <VisibilityRounded />
                        </IconButton>

                        {/* ⬇ Download */}
                        <IconButton onClick={() => handleDownload(doc)}>
                          <DownloadRounded />
                        </IconButton>

                        {/* 🗑 Delete */}
                        <IconButton onClick={() => handleDelete(doc.id)} color="error">
                          <DeleteRounded />
                        </IconButton>

                      </TableCell>

                    </TableRow>
                  );
                })}
              </TableBody>

            </Table>
          </TableContainer>
        )}
      </SectionCard>

      {/* Upload Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} fullWidth>

        <DialogTitle>
          Upload Document
          <IconButton onClick={() => setDialog(false)} sx={{ float: "right" }}>
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <DialogContent>

          <Box
            sx={{ border: "1px dashed", p: 3, textAlign: "center" }}
            onClick={() => fileInputRef.current.click()}
          >
            {selectedFile ? selectedFile.name : "Click to select file"}

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </Box>

          <TextField
            select
            fullWidth
            label="Case"
            sx={{ mt: 2 }}
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            {cases.map(c => (
              <MenuItem key={c.id} value={c.id}>
                {c.title}
              </MenuItem>
            ))}
          </TextField>

          {uploading && <LinearProgress sx={{ mt: 2 }} />}

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            Upload
          </Button>
        </DialogActions>

      </Dialog>

    </Box>
  );
}
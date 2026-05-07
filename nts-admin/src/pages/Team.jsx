import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  PersonAddRounded, CloseRounded, EmailRounded,
  LockRounded, BadgeRounded, BusinessRounded,
  MailOutlineRounded, GroupsRounded, AdminPanelSettingsRounded,
  WorkRounded,
} from "@mui/icons-material";

import { authAPI, firmsAPI } from "../api/services";
import { PageHeader } from "./UI";

const ROLES = ["lawyer", "staff"];

const ROLE_STYLES = {
  lawyer:         { bg: "#DBEAFE", color: "#1D4ED8", border: "#BFDBFE" },
  staff:          { bg: "#F3E8FF", color: "#7C3AED", border: "#E9D5FF" },
  admin:          { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A" },
  platform_admin: { bg: "#FFE4E6", color: "#BE123C", border: "#FECDD3" },
};

const AVATAR_COLORS = ["#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444","#EC4899","#06B6D4","#F97316"];

const EMPTY_FORM = {
  username: "",
  email: "",
  password: "",
  role: "staff",
  firm: "",
};

// ── reusable styled field ──
const SField = ({ label, icon, children, ...props }) => (
  <Box>
    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.75 }}>
      {label}
    </Typography>
    <TextField
      fullWidth size="small"
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px", background: "#F9F6F0", fontSize: "0.875rem",
          "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
          "&:hover fieldset": { borderColor: "#C9A84C" },
          "&.Mui-focused fieldset": { borderColor: "#C9A84C", borderWidth: "2px" },
        },
      }}
      InputProps={{
        startAdornment: icon ? (
          <Box sx={{ mr: 1, display: "flex", color: "#C9A84C" }}>{icon}</Box>
        ) : undefined,
        ...props.InputProps,
      }}
    >
      {children}
    </TextField>
  </Box>
);

// ── dialog shell ──
const StyledDialog = ({ open, onClose, title, subtitle, children, actions }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
    PaperProps={{ sx: { borderRadius: "20px", boxShadow: "0 24px 64px rgba(0,0,0,0.15)", overflow: "hidden" } }}>
    {/* Gold top stripe */}
    <Box sx={{ height: "3px", background: "linear-gradient(90deg, transparent, #C9A84C 30%, #E8C97A 70%, transparent)" }} />

    <DialogTitle sx={{ pb: 0, pt: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0D1B2A" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8", mt: 0.3 }}>{subtitle}</Typography>}
      </Box>
      <Box onClick={onClose} sx={{
        width: 30, height: 30, borderRadius: "8px", background: "#F1F5F9",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", "&:hover": { background: "#E2E8F0" }, mt: 0.5,
      }}>
        <CloseRounded sx={{ fontSize: 16, color: "#64748B" }} />
      </Box>
    </DialogTitle>

    <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      {children}
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
      {actions}
    </DialogActions>
  </Dialog>
);

export default function TeamPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user?.role === "platform_admin";

  const [team, setTeam] = useState([]);
  const [firms, setFirms] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [invite, setInvite] = useState({ email: "", role: "staff", firm: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const fetchTeam = async () => {
    try {
      const res = await authAPI.getUsers();
      setTeam(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchFirms = async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await firmsAPI.getAll();
      setFirms(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTeam(); fetchFirms(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.username || !form.email || !form.password) {
      setError("Please fill all required fields");
      return;
    }
    setSaving(true); setError("");
    try {
      const payload = { username: form.username, email: form.email, password: form.password, role: form.role };
      if (isSuperAdmin) payload.firm = form.firm;
      await authAPI.addUser(payload);
      setSuccess("User added successfully");
      setDialog(false); setForm(EMPTY_FORM); fetchTeam();
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to add user");
    } finally { setSaving(false); }
  };

  const sendInvite = async () => {
    if (!invite.email) { setError("Email is required"); return; }
    try {
      const payload = { email: invite.email, role: invite.role };
      if (isSuperAdmin) payload.firm = invite.firm;
      await authAPI.inviteUser(payload);
      setInviteDialog(false);
      setInvite({ email: "", role: "staff", firm: "" });
      setSuccess("Invite sent successfully");
    } catch (e) { setError(e.response?.data?.detail || "Invite failed"); }
  };

  return (
    <Box sx={{ pb: 2 }}>

      {/* ── Header ── */}
      <PageHeader
        title="Team Management"
        subtitle={`${team.length} members`}
        action={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<MailOutlineRounded />}
              onClick={() => setInviteDialog(true)}
              sx={{
                borderRadius: "11px", fontWeight: 600, fontSize: "0.85rem",
                borderColor: "#E2E8F0", color: "#475569",
                "&:hover": { borderColor: "#C9A84C", color: "#C9A84C", background: "#C9A84C08" },
              }}
            >
              Invite
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddRounded />}
              onClick={() => setDialog(true)}
              sx={{
                borderRadius: "11px", fontWeight: 700, fontSize: "0.85rem",
                background: "#0D1B2A", boxShadow: "0 4px 14px rgba(13,27,42,0.22)",
                "&:hover": { background: "#1B2D41", boxShadow: "0 6px 20px rgba(13,27,42,0.3)" },
              }}
            >
              Add Member
            </Button>
          </Box>
        }
      />

      {/* ── Team cards ── */}
      <Grid container spacing={2.5}>
        {team.map((member, i) => {
          const rc = ROLE_STYLES[member.role] || ROLE_STYLES.staff;
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const initials = (member.username || "?").slice(0, 2).toUpperCase();

          return (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <Card sx={{
                borderRadius: "16px", border: "1px solid #F1F5F9",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "transform 0.18s, box-shadow 0.18s",
                "&:hover": { transform: "translateY(-3px)", boxShadow: "0 10px 30px rgba(0,0,0,0.09)" },
                overflow: "hidden",
              }}>
                {/* Top accent bar in avatar colour */}
                <Box sx={{ height: "3px", background: avatarColor }} />

                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    {/* Avatar */}
                    <Box sx={{
                      width: 46, height: 46, borderRadius: "13px",
                      background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}bb)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", fontWeight: 800, color: "#fff",
                      flexShrink: 0, boxShadow: `0 4px 12px ${avatarColor}40`,
                    }}>
                      {initials}
                    </Box>
                    <Box sx={{ overflow: "hidden", flex: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0D1B2A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.username}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {member.email}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Divider */}
                  <Box sx={{ height: "1px", background: "#F1F5F9", mb: 2 }} />

                  {/* Role + firm row */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{
                      px: 1.25, py: 0.4, borderRadius: "7px",
                      background: rc.bg, border: `1px solid ${rc.border}`,
                      display: "flex", alignItems: "center", gap: 0.6,
                    }}>
                      <AdminPanelSettingsRounded sx={{ fontSize: 13, color: rc.color }} />
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: rc.color, textTransform: "capitalize" }}>
                        {member.role || "staff"}
                      </Typography>
                    </Box>

                    {member.firm_name && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <WorkRounded sx={{ fontSize: 13, color: "#94A3B8" }} />
                        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{member.firm_name}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Add Member dialog ── */}
      <StyledDialog
        open={dialog} onClose={() => setDialog(false)}
        title="Add Team Member"
        subtitle="Create a new user and assign them a role"
        actions={
          <>
            <Button onClick={() => setDialog(false)} sx={{ borderRadius: "10px", color: "#64748B", border: "1px solid #E2E8F0", px: 2.5 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}
              sx={{ borderRadius: "10px", px: 3, fontWeight: 700, background: "#0D1B2A", "&:hover": { background: "#1B2D41" } }}>
              {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Add Member"}
            </Button>
          </>
        }
      >
        <SField label="Username *" name="username" onChange={handleChange}
          icon={<BadgeRounded sx={{ fontSize: 18 }} />} />
        <SField label="Email *" name="email" onChange={handleChange}
          icon={<EmailRounded sx={{ fontSize: 18 }} />} />
        <SField label="Password *" name="password" type="password" onChange={handleChange}
          icon={<LockRounded sx={{ fontSize: 18 }} />} />
        <SField label="Role" name="role" select onChange={handleChange} defaultValue="staff"
          icon={<GroupsRounded sx={{ fontSize: 18 }} />}>
          {ROLES.map((r) => (
            <MenuItem key={r} value={r} sx={{ textTransform: "capitalize", fontSize: "0.875rem" }}>{r}</MenuItem>
          ))}
        </SField>
        {isSuperAdmin && (
          <SField label="Firm" name="firm" select onChange={handleChange}
            icon={<BusinessRounded sx={{ fontSize: 18 }} />}>
            {firms.map((f) => (
              <MenuItem key={f.id} value={f.id} sx={{ fontSize: "0.875rem" }}>{f.name}</MenuItem>
            ))}
          </SField>
        )}
      </StyledDialog>

      {/* ── Invite dialog ── */}
      <StyledDialog
        open={inviteDialog} onClose={() => setInviteDialog(false)}
        title="Invite Team Member"
        subtitle="Send an email invite with a role assignment"
        actions={
          <>
            <Button onClick={() => setInviteDialog(false)} sx={{ borderRadius: "10px", color: "#64748B", border: "1px solid #E2E8F0", px: 2.5 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={sendInvite}
              sx={{ borderRadius: "10px", px: 3, fontWeight: 700, background: "#0D1B2A", "&:hover": { background: "#1B2D41" } }}>
              Send Invite
            </Button>
          </>
        }
      >
        <SField label="Email *" value={invite.email}
          onChange={(e) => setInvite({ ...invite, email: e.target.value })}
          icon={<EmailRounded sx={{ fontSize: 18 }} />} />
        <SField label="Role" select value={invite.role}
          onChange={(e) => setInvite({ ...invite, role: e.target.value })}
          icon={<GroupsRounded sx={{ fontSize: 18 }} />}>
          {ROLES.map((r) => (
            <MenuItem key={r} value={r} sx={{ textTransform: "capitalize", fontSize: "0.875rem" }}>{r}</MenuItem>
          ))}
        </SField>
        {isSuperAdmin && (
          <SField label="Firm" select value={invite.firm}
            onChange={(e) => setInvite({ ...invite, firm: e.target.value })}
            icon={<BusinessRounded sx={{ fontSize: 18 }} />}>
            {firms.map((f) => (
              <MenuItem key={f.id} value={f.id} sx={{ fontSize: "0.875rem" }}>{f.name}</MenuItem>
            ))}
          </SField>
        )}
      </StyledDialog>

      {/* ── Snackbars ── */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity="success" sx={{ borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity="error" sx={{ borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}
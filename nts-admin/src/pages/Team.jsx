import { useState, useEffect } from "react";
import {
  Box, Button, Dialog, DialogContent, DialogActions,
  CircularProgress, Typography, Grid, TextField, MenuItem,
  Card, CardContent, Snackbar, Alert, Drawer, Divider,
  LinearProgress, Chip, IconButton, Avatar,
} from "@mui/material";
import {
  PersonAddRounded, CloseRounded, EmailRounded, LockRounded,
  BadgeRounded, BusinessRounded, MailOutlineRounded, GroupsRounded,
  AdminPanelSettingsRounded, WorkRounded, AssignmentRounded,
  GavelRounded, CheckCircleRounded, HourglassTopRounded,
  EditRounded, SaveRounded, CalendarTodayRounded, PersonRounded,
  ArrowForwardRounded, TrendingUpRounded,
} from "@mui/icons-material";

import api from "../api/client";
import { authAPI, firmsAPI } from "../api/services";
import { PageHeader } from "./UI";

const ROLES = ["lawyer", "staff"];

const ROLE_STYLES = {
  lawyer:         { bg: "#DBEAFE", color: "#1D4ED8", border: "#BFDBFE" },
  staff:          { bg: "#F3E8FF", color: "#7C3AED", border: "#E9D5FF" },
  admin:          { bg: "#FEF9C3", color: "#A16207", border: "#FDE68A" },
  platform_admin: { bg: "#FFE4E6", color: "#BE123C", border: "#FECDD3" },
};

const AVATAR_COLORS = [
  "#3B82F6","#8B5CF6","#10B981","#F59E0B",
  "#EF4444","#EC4899","#06B6D4","#F97316",
];

const EMPTY_FORM = { username: "", email: "", password: "", role: "staff", firm: "" };

// ── Shared input style ──
const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px", background: "#F9F6F0", fontSize: "0.875rem",
    "& fieldset": { borderColor: "#E2E8F0", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: "#C9A84C" },
    "&.Mui-focused fieldset": { borderColor: "#C9A84C", borderWidth: "2px" },
  },
};

const SField = ({ label, icon, children, ...props }) => (
  <Box>
    <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.75 }}>
      {label}
    </Typography>
    <TextField fullWidth size="small" {...props} sx={inputSx}
      InputProps={{ startAdornment: icon ? <Box sx={{ mr: 1, display: "flex", color: "#C9A84C" }}>{icon}</Box> : undefined, ...props.InputProps }}>
      {children}
    </TextField>
  </Box>
);

const StyledDialog = ({ open, onClose, title, subtitle, children, actions }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
    PaperProps={{ sx: { borderRadius: "20px", boxShadow: "0 24px 64px rgba(0,0,0,0.15)", overflow: "hidden" } }}>
    <Box sx={{ height: "3px", background: "linear-gradient(90deg, transparent, #C9A84C 30%, #E8C97A 70%, transparent)" }} />
    <Box sx={{ px: 3, pt: 2.5, pb: 0, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#0D1B2A" }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8", mt: 0.3 }}>{subtitle}</Typography>}
      </Box>
      <Box onClick={onClose} sx={{ width: 30, height: 30, borderRadius: "8px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { background: "#E2E8F0" }, mt: 0.5 }}>
        <CloseRounded sx={{ fontSize: 16, color: "#64748B" }} />
      </Box>
    </Box>
    <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>{children}</DialogContent>
    <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>{actions}</DialogActions>
  </Dialog>
);

// ── Mini stat pill ──
const StatPill = ({ icon, label, value, color }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: color + "0D", border: `1px solid ${color}20`, borderRadius: "12px", px: 2, py: 1.5, flex: 1 }}>
    <Box sx={{ width: 32, height: 32, bgcolor: color + "15", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value ?? "—"}</Typography>
      <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", mt: 0.2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</Typography>
    </Box>
  </Box>
);

// ── Task status bar ──
const StatusBar = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography sx={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color }}>{value} <span style={{ color: "#94A3B8", fontWeight: 400 }}>({pct}%)</span></Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct}
        sx={{ height: 5, borderRadius: 4, bgcolor: color + "15", "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 4 } }} />
    </Box>
  );
};

export default function TeamPage() {
  const user        = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user?.role === "platform_admin";

  const [team,         setTeam]         = useState([]);
  const [firms,        setFirms]        = useState([]);
  const [dialog,       setDialog]       = useState(false);
  const [inviteDialog, setInviteDialog] = useState(false);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [invite,       setInvite]       = useState({ email: "", role: "staff", firm: "" });
  const [saving,       setSaving]       = useState(false);
  const [success,      setSuccess]      = useState("");
  const [error,        setError]        = useState("");

  // ── Detail drawer state ──
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [memberTasks,  setMemberTasks]  = useState([]);
  const [memberCases,  setMemberCases]  = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editRole,     setEditRole]     = useState(false);
  const [newRole,      setNewRole]      = useState("");
  const [savingRole,   setSavingRole]   = useState(false);

  const fetchTeam = async () => {
    try {
      const res = await authAPI.getUsers();
      const data = Array.isArray(res.data) ? res.data : res.data?.results ?? [];
      setTeam(data);
    } catch (e) { console.error(e); }
  };

  const fetchFirms = async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await firmsAPI.getAll();
      setFirms(Array.isArray(res.data) ? res.data : res.data?.results ?? []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchTeam(); fetchFirms(); }, []);

  // ── Open member detail ──
  const openDetail = async (member) => {
    setSelected(member);
    setNewRole(member.role);
    setEditRole(false);
    setDrawerOpen(true);
    setLoadingDetail(true);
    try {
      const [tRes, cRes] = await Promise.allSettled([
        api.get(`/tasks/?assigned_to=${member.id}`),
        api.get(`/cases/`),
      ]);
      if (tRes.status === "fulfilled") {
        const tasks = tRes.value.data?.results ?? tRes.value.data ?? [];
        setMemberTasks(tasks.filter(t => t.assigned_to?.id === member.id || t.assigned_to === member.id));
      }
      if (cRes.status === "fulfilled") {
        const cases = cRes.value.data?.results ?? cRes.value.data ?? [];
        // Cases where this user appears as assigned lawyer (fallback: show all if no filter)
        setMemberCases(cases.filter(c => c.assigned_to === member.id || c.lawyer === member.id || c.created_by === member.id).slice(0, 10));
      }
    } catch (e) { console.error(e); }
    finally { setLoadingDetail(false); }
  };

  const handleRoleSave = async () => {
    if (!selected || newRole === selected.role) { setEditRole(false); return; }
    setSavingRole(true);
    try {
      await api.patch(`/auth/users/${selected.id}/`, { role: newRole });
      setSuccess("Role updated successfully");
      setSelected(prev => ({ ...prev, role: newRole }));
      setTeam(prev => prev.map(m => m.id === selected.id ? { ...m, role: newRole } : m));
      setEditRole(false);
    } catch {
      // Fallback — some backends use a different endpoint
      try {
        await api.post(`/auth/update-role/`, { user_id: selected.id, role: newRole });
        setSuccess("Role updated successfully");
        setSelected(prev => ({ ...prev, role: newRole }));
        setTeam(prev => prev.map(m => m.id === selected.id ? { ...m, role: newRole } : m));
        setEditRole(false);
      } catch { setError("Failed to update role"); }
    }
    setSavingRole(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.username || !form.email || !form.password) { setError("Please fill all required fields"); return; }
    setSaving(true); setError("");
    try {
      const payload = { username: form.username, email: form.email, password: form.password, role: form.role };
      if (isSuperAdmin) payload.firm = form.firm;
      await authAPI.addUser(payload);
      setSuccess("User added successfully");
      setDialog(false); setForm(EMPTY_FORM); fetchTeam();
    } catch (e) { setError(e.response?.data?.detail || "Failed to add user"); }
    finally { setSaving(false); }
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

  // ── Task breakdown ──
  const taskStats = {
    total:       memberTasks.length,
    pending:     memberTasks.filter(t => t.status === "pending").length,
    in_progress: memberTasks.filter(t => t.status === "in_progress").length,
    completed:   memberTasks.filter(t => t.status === "completed").length,
    overdue:     memberTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed").length,
  };

  return (
    <Box sx={{ pb: 2 }}>

      {/* ── Header ── */}
      <PageHeader
        title="Team Management"
        subtitle={`${team.length} members`}
        action={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="outlined" startIcon={<MailOutlineRounded />} onClick={() => setInviteDialog(true)}
              sx={{ borderRadius: "11px", fontWeight: 600, fontSize: "0.85rem", borderColor: "#E2E8F0", color: "#475569", "&:hover": { borderColor: "#C9A84C", color: "#C9A84C", background: "#C9A84C08" } }}>
              Invite
            </Button>
            <Button variant="contained" startIcon={<PersonAddRounded />} onClick={() => setDialog(true)}
              sx={{ borderRadius: "11px", fontWeight: 700, fontSize: "0.85rem", background: "#0D1B2A", boxShadow: "0 4px 14px rgba(13,27,42,0.22)", "&:hover": { background: "#1B2D41" } }}>
              Add Member
            </Button>
          </Box>
        }
      />

      {/* ── Team Cards ── */}
      <Grid container spacing={2.5}>
        {team.map((member, i) => {
          const rc          = ROLE_STYLES[member.role] || ROLE_STYLES.staff;
          const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const initials    = (member.username || "?").slice(0, 2).toUpperCase();

          return (
            <Grid item xs={12} sm={6} md={4} key={member.id}>
              <Card
                onClick={() => openDetail(member)}
                sx={{
                  borderRadius: "16px", border: "1px solid #F1F5F9",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)", cursor: "pointer",
                  transition: "transform 0.18s, box-shadow 0.18s",
                  "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 32px rgba(0,0,0,0.1)", borderColor: "#E2D9C0" },
                  overflow: "hidden",
                }}
              >
                <Box sx={{ height: "3px", background: avatarColor }} />
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Box sx={{
                      width: 46, height: 46, borderRadius: "13px",
                      background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}bb)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", fontWeight: 800, color: "#fff", flexShrink: 0,
                      boxShadow: `0 4px 12px ${avatarColor}40`,
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
                    <ArrowForwardRounded sx={{ fontSize: 16, color: "#CBD5E1", flexShrink: 0 }} />
                  </Box>

                  <Box sx={{ height: "1px", background: "#F1F5F9", mb: 2 }} />

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ px: 1.25, py: 0.4, borderRadius: "7px", background: rc.bg, border: `1px solid ${rc.border}`, display: "flex", alignItems: "center", gap: 0.6 }}>
                      <AdminPanelSettingsRounded sx={{ fontSize: 13, color: rc.color }} />
                      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: rc.color, textTransform: "capitalize" }}>
                        {member.role || "staff"}
                      </Typography>
                    </Box>
                    {member.firm && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <WorkRounded sx={{ fontSize: 13, color: "#94A3B8" }} />
                        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{member.firm}</Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* ══════════════════════════════════════════
          MEMBER DETAIL DRAWER
      ══════════════════════════════════════════ */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100vw", sm: 420 },
            bgcolor: "#F5F4F0",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
          }
        }}
      >
        {selected && (() => {
          const rc          = ROLE_STYLES[selected.role] || ROLE_STYLES.staff;
          const avatarColor = AVATAR_COLORS[team.findIndex(m => m.id === selected.id) % AVATAR_COLORS.length];
          const initials    = (selected.username || "?").slice(0, 2).toUpperCase();

          return (
            <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Drawer Header */}
              <Box sx={{
                background: `linear-gradient(135deg, #0D1B2A, #1B3050)`,
                px: 3, pt: 3, pb: 3, position: "relative", overflow: "hidden", flexShrink: 0,
              }}>
                {/* Decorative circles */}
                <Box sx={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.15)" }} />
                <Box sx={{ position: "absolute", bottom: -10, right: 30, width: 60, height: 60, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />

                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5, position: "relative", zIndex: 1 }}>
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#C9A84C", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    Team Member
                  </Typography>
                  <IconButton onClick={() => setDrawerOpen(false)} size="small"
                    sx={{ color: "rgba(255,255,255,0.5)", "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" } }}>
                    <CloseRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, position: "relative", zIndex: 1 }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: "16px", flexShrink: 0,
                    background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}aa)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.2rem", fontWeight: 800, color: "#fff",
                    boxShadow: `0 6px 20px ${avatarColor}50`,
                    border: "2px solid rgba(255,255,255,0.15)",
                  }}>
                    {initials}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#fff", lineHeight: 1.2 }}>
                      {selected.username}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)", mt: 0.3 }}>
                      {selected.email}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1 }}>
                      <Box sx={{ px: 1.2, py: 0.3, borderRadius: "6px", bgcolor: rc.bg + "20", border: `1px solid ${rc.color}40` }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: rc.color, textTransform: "capitalize" }}>
                          {selected.role}
                        </Typography>
                      </Box>
                      {selected.firm && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <WorkRounded sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }} />
                          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{selected.firm}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Joined date */}
                {selected.joined && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 2, position: "relative", zIndex: 1 }}>
                    <CalendarTodayRounded sx={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }} />
                    <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      Joined {new Date(selected.joined).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Scrollable body */}
              <Box sx={{ flex: 1, overflowY: "auto", p: 2.5,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": { bgcolor: "#E2E8F0", borderRadius: 4 },
              }}>
                {loadingDetail ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress sx={{ color: "#0D1B2A" }} size={28} />
                  </Box>
                ) : (
                  <>
                    {/* ── Task Overview ── */}
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.12em", mb: 1.5 }}>
                      Task Overview
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
                      <StatPill icon={<AssignmentRounded sx={{ fontSize: 16, color: "#0D1B2A" }} />} label="Total" value={taskStats.total} color="#0D1B2A" />
                      <StatPill icon={<CheckCircleRounded sx={{ fontSize: 16, color: "#10B981" }} />} label="Done" value={taskStats.completed} color="#10B981" />
                    </Box>
                    <Box sx={{ display: "flex", gap: 1.5, mb: 2.5 }}>
                      <StatPill icon={<HourglassTopRounded sx={{ fontSize: 16, color: "#3B82F6" }} />} label="Active" value={taskStats.in_progress} color="#3B82F6" />
                      <StatPill icon={<TrendingUpRounded sx={{ fontSize: 16, color: "#EF4444" }} />} label="Overdue" value={taskStats.overdue} color="#EF4444" />
                    </Box>

                    {/* Task progress bars */}
                    {taskStats.total > 0 && (
                      <Box sx={{ bgcolor: "#fff", borderRadius: "14px", p: 2, mb: 2.5, border: "1px solid #F0EDE5" }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#0D1B2A", mb: 1.5 }}>Progress Breakdown</Typography>
                        <StatusBar label="Completed"   value={taskStats.completed}   total={taskStats.total} color="#10B981" />
                        <StatusBar label="In Progress" value={taskStats.in_progress} total={taskStats.total} color="#3B82F6" />
                        <StatusBar label="Pending"     value={taskStats.pending}     total={taskStats.total} color="#F59E0B" />
                      </Box>
                    )}

                    {/* ── Recent Tasks ── */}
                    {memberTasks.length > 0 && (
                      <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #F0EDE5", mb: 2.5, overflow: "hidden" }}>
                        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #F5F4F0" }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#0D1B2A" }}>
                            Recent Tasks
                          </Typography>
                        </Box>
                        {memberTasks.slice(0, 5).map((task, idx) => {
                          const statusColor = { pending: "#F59E0B", in_progress: "#3B82F6", completed: "#10B981", cancelled: "#9CA3AF" }[task.status] || "#9CA3AF";
                          const priorityColor = { low: "#10B981", medium: "#F59E0B", high: "#F97316", urgent: "#EF4444" }[task.priority] || "#9CA3AF";
                          return (
                            <Box key={task.id} sx={{ px: 2, py: 1.5, borderBottom: idx < Math.min(memberTasks.length, 5) - 1 ? "1px solid #F5F4F0" : "none", display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: statusColor, flexShrink: 0 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#0D1B2A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: task.status === "completed" ? "line-through" : "none", opacity: task.status === "completed" ? 0.5 : 1 }}>
                                  {task.title}
                                </Typography>
                                {task.due_date && (
                                  <Typography sx={{ fontSize: 10, color: "#94A3B8" }}>
                                    Due {new Date(task.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ px: 1, py: 0.3, borderRadius: "6px", bgcolor: priorityColor + "12", flexShrink: 0 }}>
                                <Typography sx={{ fontSize: 9, fontWeight: 700, color: priorityColor, textTransform: "capitalize" }}>
                                  {task.priority}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}

                    {/* ── Cases ── */}
                    {memberCases.length > 0 && (
                      <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #F0EDE5", mb: 2.5, overflow: "hidden" }}>
                        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #F5F4F0", display: "flex", alignItems: "center", gap: 1 }}>
                          <GavelRounded sx={{ fontSize: 14, color: "#0D1B2A" }} />
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#0D1B2A" }}>
                            Related Cases ({memberCases.length})
                          </Typography>
                        </Box>
                        {memberCases.slice(0, 4).map((c, idx) => (
                          <Box key={c.id} sx={{ px: 2, py: 1.5, borderBottom: idx < Math.min(memberCases.length, 4) - 1 ? "1px solid #F5F4F0" : "none", display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 28, height: 28, bgcolor: "#F5F4F0", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <GavelRounded sx={{ fontSize: 13, color: "#64748B" }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#0D1B2A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {c.title || c.case_number}
                              </Typography>
                              <Typography sx={{ fontSize: 10, color: "#94A3B8", textTransform: "capitalize" }}>{c.status}</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Empty state */}
                    {taskStats.total === 0 && memberCases.length === 0 && (
                      <Box sx={{ textAlign: "center", py: 4, bgcolor: "#fff", borderRadius: "14px", border: "1px solid #F0EDE5", mb: 2.5 }}>
                        <AssignmentRounded sx={{ fontSize: 36, color: "#E2E8F0", mb: 1 }} />
                        <Typography sx={{ fontSize: 13, color: "#94A3B8" }}>No tasks or cases assigned yet</Typography>
                      </Box>
                    )}

                    {/* ── Update Role ── */}
                    <Box sx={{ bgcolor: "#fff", borderRadius: "14px", border: "1px solid #F0EDE5", p: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: editRole ? 2 : 0 }}>
                        <Box>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#0D1B2A" }}>Role & Permissions</Typography>
                          {!editRole && (
                            <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: 0.2, textTransform: "capitalize" }}>
                              Current: <strong style={{ color: rc.color }}>{selected.role}</strong>
                            </Typography>
                          )}
                        </Box>
                        {!editRole ? (
                          <IconButton size="small" onClick={() => setEditRole(true)}
                            sx={{ bgcolor: "#F1F5F9", "&:hover": { bgcolor: "#E2E8F0" }, borderRadius: "8px" }}>
                            <EditRounded sx={{ fontSize: 15, color: "#64748B" }} />
                          </IconButton>
                        ) : (
                          <IconButton size="small" onClick={() => setEditRole(false)}
                            sx={{ bgcolor: "#FEF2F2", "&:hover": { bgcolor: "#FEE2E2" }, borderRadius: "8px" }}>
                            <CloseRounded sx={{ fontSize: 15, color: "#EF4444" }} />
                          </IconButton>
                        )}
                      </Box>
                      {editRole && (
                        <Box>
                          <TextField select fullWidth size="small" value={newRole}
                            onChange={e => setNewRole(e.target.value)} sx={inputSx}>
                            {["lawyer", "staff", "admin"].map(r => (
                              <MenuItem key={r} value={r} sx={{ textTransform: "capitalize", fontSize: "0.875rem" }}>{r}</MenuItem>
                            ))}
                          </TextField>
                          <Button fullWidth onClick={handleRoleSave} disabled={savingRole}
                            startIcon={savingRole ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <SaveRounded sx={{ fontSize: 16 }} />}
                            sx={{ mt: 1.5, bgcolor: "#0D1B2A", color: "#fff", borderRadius: "10px", textTransform: "none", fontWeight: 700, "&:hover": { bgcolor: "#1B3050" } }}>
                            {savingRole ? "Saving…" : "Save Role"}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          );
        })()}
      </Drawer>

      {/* ── Add Member dialog ── */}
      <StyledDialog open={dialog} onClose={() => setDialog(false)}
        title="Add Team Member" subtitle="Create a new user and assign them a role"
        actions={
          <>
            <Button onClick={() => setDialog(false)} sx={{ borderRadius: "10px", color: "#64748B", border: "1px solid #E2E8F0", px: 2.5 }}>Cancel</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}
              sx={{ borderRadius: "10px", px: 3, fontWeight: 700, background: "#0D1B2A", "&:hover": { background: "#1B2D41" } }}>
              {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Add Member"}
            </Button>
          </>
        }
      >
        <SField label="Username *" name="username" onChange={handleChange} icon={<BadgeRounded sx={{ fontSize: 18 }} />} />
        <SField label="Email *"    name="email"    onChange={handleChange} icon={<EmailRounded   sx={{ fontSize: 18 }} />} />
        <SField label="Password *" name="password" type="password" onChange={handleChange} icon={<LockRounded sx={{ fontSize: 18 }} />} />
        <SField label="Role" name="role" select onChange={handleChange} defaultValue="staff" icon={<GroupsRounded sx={{ fontSize: 18 }} />}>
          {ROLES.map(r => <MenuItem key={r} value={r} sx={{ textTransform: "capitalize", fontSize: "0.875rem" }}>{r}</MenuItem>)}
        </SField>
        {isSuperAdmin && (
          <SField label="Firm" name="firm" select onChange={handleChange} icon={<BusinessRounded sx={{ fontSize: 18 }} />}>
            {firms.map(f => <MenuItem key={f.id} value={f.id} sx={{ fontSize: "0.875rem" }}>{f.name}</MenuItem>)}
          </SField>
        )}
      </StyledDialog>

      {/* ── Invite dialog ── */}
      <StyledDialog open={inviteDialog} onClose={() => setInviteDialog(false)}
        title="Invite Team Member" subtitle="Send an email invite with a role assignment"
        actions={
          <>
            <Button onClick={() => setInviteDialog(false)} sx={{ borderRadius: "10px", color: "#64748B", border: "1px solid #E2E8F0", px: 2.5 }}>Cancel</Button>
            <Button variant="contained" onClick={sendInvite}
              sx={{ borderRadius: "10px", px: 3, fontWeight: 700, background: "#0D1B2A", "&:hover": { background: "#1B2D41" } }}>
              Send Invite
            </Button>
          </>
        }
      >
        <SField label="Email *" value={invite.email} onChange={e => setInvite({ ...invite, email: e.target.value })} icon={<EmailRounded sx={{ fontSize: 18 }} />} />
        <SField label="Role" select value={invite.role} onChange={e => setInvite({ ...invite, role: e.target.value })} icon={<GroupsRounded sx={{ fontSize: 18 }} />}>
          {ROLES.map(r => <MenuItem key={r} value={r} sx={{ textTransform: "capitalize", fontSize: "0.875rem" }}>{r}</MenuItem>)}
        </SField>
        {isSuperAdmin && (
          <SField label="Firm" select value={invite.firm} onChange={e => setInvite({ ...invite, firm: e.target.value })} icon={<BusinessRounded sx={{ fontSize: 18 }} />}>
            {firms.map(f => <MenuItem key={f.id} value={f.id} sx={{ fontSize: "0.875rem" }}>{f.name}</MenuItem>)}
          </SField>
        )}
      </StyledDialog>

      {/* ── Snackbars ── */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity="success" sx={{ borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity="error" sx={{ borderRadius: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>{error}</Alert>
      </Snackbar>
    </Box>
  );
}
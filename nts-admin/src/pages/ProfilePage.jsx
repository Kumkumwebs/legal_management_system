import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, TextField, Avatar, Divider,
  CircularProgress, Snackbar, Alert, Chip, IconButton, Tabs, Tab
} from '@mui/material';
import {
  EditRounded, SaveRounded, CameraAltRounded, BusinessRounded,
  PersonRounded, LockRounded, UploadFileRounded, BadgeRounded,
  LocationOnRounded, EmailRounded, PhoneRounded
} from '@mui/icons-material';
import api from '../api/client';

const ROLE_CONFIG = {
  admin: { label: 'Administrator', color: '#4fc3f7', bg: '#E3F6FC' },
  lawyer: { label: 'Lawyer', color: '#81c784', bg: '#EDF7ED' },
  staff: { label: 'Staff', color: '#b0bec5', bg: '#ECEFF1' },
  super_admin: { label: 'Super Admin', color: '#c9a84c', bg: '#FEF3C7' },
};

export default function ProfilePage() {
  const [tab, setTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const fileRef = useRef();
  const logoRef = useRef();

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const [personalForm, setPersonalForm] = useState({ first_name: '', last_name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [firmForm, setFirmForm] = useState({
    name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', gstin: '', bar_registration: ''
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/me/');
      setProfile(res.data);
      setPersonalForm({ first_name: res.data.first_name || '', last_name: res.data.last_name || '', email: res.data.email || '' });
      if (res.data.firm) {
        setFirmForm({
          name: res.data.firm.name || '',
          email: res.data.firm.email || '',
          phone: res.data.firm.phone || '',
          address: res.data.firm.address || '',
          city: res.data.firm.city || '',
          state: res.data.firm.state || '',
          pincode: res.data.firm.pincode || '',
          gstin: res.data.firm.gstin || '',
          bar_registration: res.data.firm.bar_registration || '',
        });
      }
    } catch { notify('Failed to load profile', 'error'); }
    finally { setLoading(false); }
  };

  const savePersonal = async () => {
    setSaving(true);
    try {
      await api.patch('/profile/me/', personalForm);
      notify('Profile updated');
      fetchProfile();
      setEditMode(false);
    } catch { notify('Failed to update profile', 'error'); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm) {
      return notify('Passwords do not match', 'error');
    }
    setSaving(true);
    try {
      await api.patch('/profile/me/', { old_password: passwordForm.old_password, new_password: passwordForm.new_password });
      notify('Password changed successfully');
      setPasswordForm({ old_password: '', new_password: '', confirm: '' });
    } catch (e) {
      notify(e.response?.data?.error || 'Failed to change password', 'error');
    }
    finally { setSaving(false); }
  };

  const saveFirm = async () => {
    setSaving(true);
    try {
      await api.patch('/profile/firm/', firmForm);
      notify('Firm profile updated');
      fetchProfile();
      setEditMode(false);
    } catch { notify('Failed to update firm', 'error'); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('profile_picture', file);
    try {
      await api.patch('/profile/me/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('Profile picture updated');
      fetchProfile();
    } catch { notify('Failed to upload picture', 'error'); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    try {
      await api.patch('/profile/firm/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('Firm logo updated');
      fetchProfile();
    } catch { notify('Failed to upload logo', 'error'); }
  };

  const roleConfig = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.staff;
  const isAdmin = ['admin', 'super_admin'].includes(profile?.role);

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>
      {/* Page Title */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#C9A84C', textTransform: 'uppercase', mb: 0.5 }}>HP HCMS</Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 700, color: '#0D1B2A' }}>My Profile</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 3 }}>

        {/* Left Panel — User Card */}
        <Box>
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {/* Cover gradient */}
            <Box sx={{ height: 80, background: 'linear-gradient(135deg, #0D1B2A 0%, #1a2e4a 100%)' }} />
            <Box sx={{ px: 3, pb: 3, position: 'relative' }}>
              {/* Avatar with upload */}
              <Box sx={{ position: 'relative', display: 'inline-block', mt: -4 }}>
                <Avatar
                  src={profile?.profile_picture}
                  sx={{ width: 80, height: 80, border: '3px solid #fff', bgcolor: '#0D1B2A', fontSize: 28, fontWeight: 700 }}
                >
                  {(profile?.first_name || profile?.username || 'U')[0].toUpperCase()}
                </Avatar>
                <IconButton
                  onClick={() => fileRef.current?.click()}
                  size="small"
                  sx={{
                    position: 'absolute', bottom: 0, right: 0, width: 26, height: 26,
                    bgcolor: '#C9A84C', color: '#0D1B2A',
                    '&:hover': { bgcolor: '#b8973a' }, border: '2px solid #fff'
                  }}
                >
                  <CameraAltRounded sx={{ fontSize: 13 }} />
                </IconButton>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
              </Box>

              <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#0D1B2A', mt: 1.5 }}>
                {[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#8B8B80', mb: 1.5 }}>@{profile?.username}</Typography>
              <Chip label={roleConfig.label} size="small"
                sx={{ bgcolor: roleConfig.bg, color: roleConfig.color, fontWeight: 700, fontSize: 12 }} />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <EmailRounded sx={{ fontSize: 16, color: '#8B8B80' }} />
                  <Typography sx={{ fontSize: 13, color: '#3A3A35' }}>{profile?.email || 'No email set'}</Typography>
                </Box>
                {profile?.firm && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <BusinessRounded sx={{ fontSize: 16, color: '#8B8B80' }} />
                    <Typography sx={{ fontSize: 13, color: '#3A3A35' }}>{profile.firm.name}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* Firm Logo Card — admin only */}
          {isAdmin && profile?.firm && (
            <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', p: 3, mt: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#0D1B2A', mb: 2 }}>Firm Logo</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar src={profile.firm.logo} variant="rounded"
                  sx={{ width: 64, height: 64, bgcolor: '#F5F4F0', borderRadius: 2 }}>
                  <BusinessRounded sx={{ color: '#8B8B80', fontSize: 30 }} />
                </Avatar>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A' }}>{profile.firm.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: '#8B8B80' }}>Upload a square PNG or SVG</Typography>
                </Box>
              </Box>
              <Button startIcon={<UploadFileRounded />} onClick={() => logoRef.current?.click()}
                fullWidth variant="outlined"
                sx={{ textTransform: 'none', borderColor: '#E0DDD6', color: '#0D1B2A', borderRadius: 2, fontWeight: 600 }}>
                Upload Logo
              </Button>
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
            </Box>
          )}
        </Box>

        {/* Right Panel */}
        <Box>
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <Box sx={{ px: 2, borderBottom: '1px solid #F0EDE5' }}>
              <Tabs value={tab} onChange={(_, v) => { setTab(v); setEditMode(false); }} sx={{
                '& .MuiTab-root': { textTransform: 'none', fontSize: 13, fontWeight: 600, minHeight: 48 },
                '& .Mui-selected': { color: '#0D1B2A' },
                '& .MuiTabs-indicator': { bgcolor: '#C9A84C', height: 3, borderRadius: 2 }
              }}>
                <Tab icon={<PersonRounded sx={{ fontSize: 16 }} />} iconPosition="start" label="Personal Info" value="personal" />
                {isAdmin && <Tab icon={<BusinessRounded sx={{ fontSize: 16 }} />} iconPosition="start" label="Firm Details" value="firm" />}
                <Tab icon={<LockRounded sx={{ fontSize: 16 }} />} iconPosition="start" label="Security" value="security" />
              </Tabs>
            </Box>

            <Box sx={{ p: 3 }}>
              {/* PERSONAL TAB */}
              {tab === 'personal' && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0D1B2A' }}>Personal Information</Typography>
                    {!editMode ? (
                      <Button startIcon={<EditRounded />} onClick={() => setEditMode(true)}
                        sx={{ textTransform: 'none', color: '#0D1B2A', fontWeight: 600, fontSize: 13 }}>Edit</Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setEditMode(false)} sx={{ textTransform: 'none', color: '#8B8B80' }}>Cancel</Button>
                        <Button onClick={savePersonal} disabled={saving} startIcon={<SaveRounded />}
                          sx={{ bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', px: 2.5, borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#1a2e4a' } }}>
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                    {[
                      { label: 'First Name', key: 'first_name', icon: <PersonRounded sx={{ fontSize: 16, color: '#8B8B80' }} /> },
                      { label: 'Last Name', key: 'last_name', icon: <PersonRounded sx={{ fontSize: 16, color: '#8B8B80' }} /> },
                      { label: 'Email Address', key: 'email', icon: <EmailRounded sx={{ fontSize: 16, color: '#8B8B80' }} />, span: 2 },
                    ].map(field => (
                      <Box key={field.key} sx={{ gridColumn: field.span ? `span ${field.span}` : 'span 1' }}>
                        {editMode ? (
                          <TextField label={field.label} fullWidth value={personalForm[field.key]}
                            onChange={e => setPersonalForm(p => ({ ...p, [field.key]: e.target.value }))}
                            sx={inputSx} />
                        ) : (
                          <Box sx={{ p: 2, bgcolor: '#F9F9F7', borderRadius: 2 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#8B8B80', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>{field.label}</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{personalForm[field.key] || '—'}</Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: '#F9F9F7', borderRadius: 2 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#8B8B80', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>Username</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{profile?.username}</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: '#F9F9F7', borderRadius: 2 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#8B8B80', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>Role</Typography>
                      <Chip label={roleConfig.label} size="small" sx={{ bgcolor: roleConfig.bg, color: roleConfig.color, fontWeight: 700 }} />
                    </Box>
                  </Box>
                </>
              )}

              {/* FIRM TAB */}
              {tab === 'firm' && isAdmin && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0D1B2A' }}>Firm Details</Typography>
                    {!editMode ? (
                      <Button startIcon={<EditRounded />} onClick={() => setEditMode(true)}
                        sx={{ textTransform: 'none', color: '#0D1B2A', fontWeight: 600, fontSize: 13 }}>Edit</Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setEditMode(false)} sx={{ textTransform: 'none', color: '#8B8B80' }}>Cancel</Button>
                        <Button onClick={saveFirm} disabled={saving} startIcon={<SaveRounded />}
                          sx={{ bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', px: 2.5, borderRadius: 2, fontWeight: 600, '&:hover': { bgcolor: '#1a2e4a' } }}>
                          {saving ? 'Saving...' : 'Save Firm Details'}
                        </Button>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
                    {[
                      { label: 'Firm Name', key: 'name', span: 2 },
                      { label: 'Email', key: 'email' },
                      { label: 'Phone', key: 'phone' },
                      { label: 'Address', key: 'address', span: 2 },
                      { label: 'City', key: 'city' },
                      { label: 'State', key: 'state' },
                      { label: 'Pincode', key: 'pincode' },
                      { label: 'GSTIN', key: 'gstin' },
                      { label: 'Bar Registration No.', key: 'bar_registration' },
                    ].map(f => (
                      <Box key={f.key} sx={{ gridColumn: f.span ? `span ${f.span}` : 'span 1' }}>
                        {editMode ? (
                          <TextField label={f.label} fullWidth value={firmForm[f.key]}
                            onChange={e => setFirmForm(p => ({ ...p, [f.key]: e.target.value }))} sx={inputSx} />
                        ) : (
                          <Box sx={{ p: 2, bgcolor: '#F9F9F7', borderRadius: 2 }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#8B8B80', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5 }}>{f.label}</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#0D1B2A' }}>{firmForm[f.key] || '—'}</Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {/* SECURITY TAB */}
              {tab === 'security' && (
                <>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0D1B2A', mb: 3 }}>Change Password</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                    <TextField label="Current Password" type="password" fullWidth value={passwordForm.old_password}
                      onChange={e => setPasswordForm(p => ({ ...p, old_password: e.target.value }))} sx={inputSx} />
                    <TextField label="New Password" type="password" fullWidth value={passwordForm.new_password}
                      onChange={e => setPasswordForm(p => ({ ...p, new_password: e.target.value }))} sx={inputSx} />
                    <TextField label="Confirm New Password" type="password" fullWidth value={passwordForm.confirm}
                      onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} sx={inputSx}
                      error={passwordForm.confirm && passwordForm.new_password !== passwordForm.confirm}
                      helperText={passwordForm.confirm && passwordForm.new_password !== passwordForm.confirm ? "Passwords don't match" : ''} />
                    <Button onClick={savePassword} disabled={saving || !passwordForm.old_password || !passwordForm.new_password}
                      sx={{ bgcolor: '#0D1B2A', color: '#fff', textTransform: 'none', py: 1.5, borderRadius: 2, fontWeight: 700, '&:hover': { bgcolor: '#1a2e4a' } }}>
                      {saving ? 'Saving...' : 'Update Password'}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(p => ({ ...p, open: false }))}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0D1B2A' }
  }
};
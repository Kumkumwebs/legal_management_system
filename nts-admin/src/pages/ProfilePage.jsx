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
import PageHero from '../components/PageHero';
import { useTheme } from '../context/ThemeContext';

const ROLE_CONFIG = {
  admin:       { label: 'Administrator', color: '#4fc3f7', bg: '#E3F6FC' },
  lawyer:      { label: 'Lawyer',        color: '#81c784', bg: '#EDF7ED' },
  staff:       { label: 'Staff',         color: '#b0bec5', bg: '#ECEFF1' },
  super_admin: { label: 'Super Admin',   color: '#c9a84c', bg: '#FEF3C7' },
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

export default function ProfilePage() {
  const { theme } = useTheme();
  const accent    = theme.accentColor || '#C9A84C';

  const [tab,          setTab]          = useState('personal');
  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [editMode,     setEditMode]     = useState(false);
  const [snack,        setSnack]        = useState({ open: false, msg: '', severity: 'success' });
  const fileRef = useRef();
  const logoRef = useRef();

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const [personalForm, setPersonalForm] = useState({ first_name: '', last_name: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm: '' });
  const [firmForm,     setFirmForm]     = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', gstin: '', bar_registration: '' });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/me/');
      setProfile(res.data);
      setPersonalForm({ first_name: res.data.first_name || '', last_name: res.data.last_name || '', email: res.data.email || '' });
      if (res.data.firm) {
        setFirmForm({
          name:             res.data.firm.name             || '',
          email:            res.data.firm.email            || '',
          phone:            res.data.firm.phone            || '',
          address:          res.data.firm.address          || '',
          city:             res.data.firm.city             || '',
          state:            res.data.firm.state            || '',
          pincode:          res.data.firm.pincode          || '',
          gstin:            res.data.firm.gstin            || '',
          bar_registration: res.data.firm.bar_registration || '',
        });
      }
    } catch { notify('Failed to load profile', 'error'); }
    finally   { setLoading(false); }
  };

  const savePersonal = async () => {
    setSaving(true);
    try { await api.patch('/profile/me/', personalForm); notify('Profile updated'); fetchProfile(); setEditMode(false); }
    catch { notify('Failed to update profile', 'error'); }
    finally { setSaving(false); }
  };

  const savePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm) return notify('Passwords do not match', 'error');
    setSaving(true);
    try { await api.patch('/profile/me/', { old_password: passwordForm.old_password, new_password: passwordForm.new_password }); notify('Password changed'); setPasswordForm({ old_password: '', new_password: '', confirm: '' }); }
    catch (e) { notify(e.response?.data?.error || 'Failed to change password', 'error'); }
    finally { setSaving(false); }
  };

  const saveFirm = async () => {
    setSaving(true);
    try { await api.patch('/profile/firm/', firmForm); notify('Firm profile updated'); fetchProfile(); setEditMode(false); }
    catch { notify('Failed to update firm', 'error'); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('profile_picture', file);
    try { await api.patch('/profile/me/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); notify('Profile picture updated'); fetchProfile(); }
    catch { notify('Failed to upload picture', 'error'); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('logo', file);
    try { await api.patch('/profile/firm/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); notify('Firm logo updated'); fetchProfile(); }
    catch { notify('Failed to upload logo', 'error'); }
  };

  const roleConfig = ROLE_CONFIG[profile?.role] || ROLE_CONFIG.staff;
  const isAdmin    = ['admin', 'super_admin'].includes(profile?.role);

  if (loading) return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>

      {/* ✅ HERO — uses theme colors */}
      <PageHero
        label="HP HCMS · Profile"
        icon={<PersonRounded />}
        title="My Profile"
        subtitle="Manage your personal information and account settings"
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 3 }}>

        {/* Left panel */}
        <Box>
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            {/* Cover — now uses accent */}
            <Box sx={{ height: 80, background: `linear-gradient(135deg, ${theme.primaryColor || '#0D1B2A'}, ${accent})` }} />
            <Box sx={{ px: 3, pb: 3, position: 'relative' }}>
              <Box sx={{ position: 'relative', display: 'inline-block', mt: -4 }}>
                <Avatar src={profile?.profile_picture} sx={{ width: 80, height: 80, border: '3px solid #fff', bgcolor: '#0D1B2A', fontSize: 28, fontWeight: 700 }}>
                  {(profile?.first_name || profile?.username || 'U')[0].toUpperCase()}
                </Avatar>
                <IconButton onClick={() => fileRef.current?.click()} size="small" sx={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, bgcolor: accent, color: '#0D1B2A', '&:hover': { bgcolor: accent + 'cc' }, border: '2px solid #fff' }}>
                  <CameraAltRounded sx={{ fontSize: 13 }} />
                </IconButton>
                <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
              </Box>
              <Box sx={{ mt: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0D1B2A' }}>
                  {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : profile?.username}
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#64748B', mb: 1 }}>{profile?.email}</Typography>
                <Chip label={roleConfig.label} size="small" sx={{ bgcolor: roleConfig.bg, color: roleConfig.color, fontWeight: 700, fontSize: 11 }} />
              </Box>
              {profile?.firm && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#F8F7F4', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: 1 }}>
                  {profile.firm.logo ? (
                    <Box component="img" src={profile.firm.logo} sx={{ width: 28, height: 28, borderRadius: '6px', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ width: 28, height: 28, bgcolor: '#0D1B2A', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BusinessRounded sx={{ color: accent, fontSize: 15 }} />
                    </Box>
                  )}
                  <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#0D1B2A' }}>{profile.firm.name}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Quick stats */}
          <Box sx={{ mt: 2, bgcolor: '#fff', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', p: 2 }}>
            {[
              { icon: <PersonRounded sx={{ fontSize: 16 }} />,       label: 'Username',  value: profile?.username },
              { icon: <BadgeRounded  sx={{ fontSize: 16 }} />,       label: 'Role',      value: roleConfig.label },
              { icon: <BusinessRounded sx={{ fontSize: 16 }} />,     label: 'Firm',      value: profile?.firm?.name || '—' },
            ].map(({ icon, label, value }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid #F5F4F0', '&:last-child': { borderBottom: 'none' } }}>
                <Box sx={{ color: '#94A3B8' }}>{icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#0D1B2A', fontWeight: 500 }}>{value}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right panel */}
        <Box>
          <Box sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: '1px solid #F0EDE5', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13 }, '& .Mui-selected': { color: '#0D1B2A' }, '& .MuiTabs-indicator': { bgcolor: accent } }}>
              <Tab value="personal" label="Personal Info" />
              <Tab value="password" label="Password" />
              {isAdmin && <Tab value="firm" label="Firm Profile" />}
            </Tabs>

            <Box sx={{ p: 3 }}>
              {/* Personal tab */}
              {tab === 'personal' && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0D1B2A' }}>Personal Information</Typography>
                    {!editMode ? (
                      <Button startIcon={<EditRounded />} onClick={() => setEditMode(true)} sx={{ textTransform: 'none', fontWeight: 600, color: '#0D1B2A', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 13, px: 2 }}>Edit</Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setEditMode(false)} sx={{ textTransform: 'none', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: 13, px: 2 }}>Cancel</Button>
                        <Button onClick={savePersonal} disabled={saving} startIcon={<SaveRounded />} sx={{ textTransform: 'none', bgcolor: '#0D1B2A', color: '#fff', borderRadius: '8px', fontSize: 13, px: 2, fontWeight: 700, '&:hover': { bgcolor: '#1B2D41' } }}>Save</Button>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {[{ label: 'First Name', key: 'first_name' }, { label: 'Last Name', key: 'last_name' }].map(({ label, key }) => (
                      <TextField key={key} fullWidth label={label} value={personalForm[key]} onChange={e => setPersonalForm({ ...personalForm, [key]: e.target.value })} disabled={!editMode} sx={inputSx} />
                    ))}
                    <TextField fullWidth label="Email" type="email" value={personalForm.email} onChange={e => setPersonalForm({ ...personalForm, email: e.target.value })} disabled={!editMode} sx={{ ...inputSx, gridColumn: { sm: '1 / -1' } }} />
                  </Box>
                </Box>
              )}

              {/* Password tab */}
              {tab === 'password' && (
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0D1B2A', mb: 2.5 }}>Change Password</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                    {[
                      { label: 'Current Password', key: 'old_password' },
                      { label: 'New Password',     key: 'new_password' },
                      { label: 'Confirm Password', key: 'confirm' },
                    ].map(({ label, key }) => (
                      <TextField key={key} fullWidth label={label} type="password" value={passwordForm[key]} onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })} sx={inputSx} />
                    ))}
                    <Button onClick={savePassword} disabled={saving || !passwordForm.old_password || !passwordForm.new_password} sx={{ textTransform: 'none', bgcolor: '#0D1B2A', color: '#fff', borderRadius: '10px', fontWeight: 700, py: 1.2, '&:hover': { bgcolor: '#1B2D41' }, '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' } }}>
                      {saving ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Update Password'}
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Firm tab (admin only) */}
              {tab === 'firm' && isAdmin && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0D1B2A' }}>Firm Profile</Typography>
                    {!editMode ? (
                      <Button startIcon={<EditRounded />} onClick={() => setEditMode(true)} sx={{ textTransform: 'none', fontWeight: 600, color: '#0D1B2A', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: 13, px: 2 }}>Edit</Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={() => setEditMode(false)} sx={{ textTransform: 'none', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: 13, px: 2 }}>Cancel</Button>
                        <Button onClick={saveFirm} disabled={saving} startIcon={<SaveRounded />} sx={{ textTransform: 'none', bgcolor: '#0D1B2A', color: '#fff', borderRadius: '8px', fontSize: 13, px: 2, fontWeight: 700, '&:hover': { bgcolor: '#1B2D41' } }}>Save</Button>
                      </Box>
                    )}
                  </Box>

                  {/* Logo upload */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, bgcolor: '#F8F7F4', borderRadius: '12px' }}>
                    {profile?.firm?.logo ? (
                      <Box component="img" src={profile.firm.logo} sx={{ width: 52, height: 52, borderRadius: '10px', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: 52, height: 52, bgcolor: '#0D1B2A', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BusinessRounded sx={{ color: accent, fontSize: 24 }} />
                      </Box>
                    )}
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#0D1B2A' }}>Firm Logo</Typography>
                      <Button startIcon={<UploadFileRounded />} onClick={() => logoRef.current?.click()} sx={{ textTransform: 'none', fontSize: 12, color: '#64748B', p: 0, mt: 0.5, '&:hover': { color: '#0D1B2A' } }}>
                        Upload new logo
                      </Button>
                      <input ref={logoRef} type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    {[
                      { label: 'Firm Name',        key: 'name',             col: '1/-1' },
                      { label: 'Email',             key: 'email' },
                      { label: 'Phone',             key: 'phone' },
                      { label: 'City',              key: 'city' },
                      { label: 'State',             key: 'state' },
                      { label: 'Pincode',           key: 'pincode' },
                      { label: 'GSTIN',             key: 'gstin' },
                      { label: 'Bar Registration',  key: 'bar_registration' },
                      { label: 'Address',           key: 'address',          col: '1/-1', rows: 2 },
                    ].map(({ label, key, col, rows }) => (
                      <TextField key={key} fullWidth label={label} value={firmForm[key]} onChange={e => setFirmForm({ ...firmForm, [key]: e.target.value })} disabled={!editMode} multiline={!!rows} rows={rows} sx={{ ...inputSx, ...(col ? { gridColumn: col } : {}) }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled" sx={{ borderRadius: 2 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
// src/pages/BrandingSettingsPage.jsx
import { useState, useRef } from 'react';
import {
  Box, Typography, Button, CircularProgress,
  Snackbar, Alert,
} from '@mui/material';
import {
  PaletteRounded, UploadRounded, CheckCircleRounded,
  RestartAltRounded, SaveRounded, FormatColorFillRounded,
  TextFieldsRounded,
} from '@mui/icons-material';
import api from '../api/client';

// ✅ FIXED: import from the correct context file
import { useTheme, defaultTheme } from '../context/ThemeContext';

const FONT_OPTIONS = [
  { value: 'DM Sans, sans-serif',            label: 'DM Sans',    sample: 'Modern & Geometric' },
  { value: 'Inter, sans-serif',              label: 'Inter',      sample: 'Clean & Neutral' },
  { value: 'Poppins, sans-serif',            label: 'Poppins',    sample: 'Friendly & Round' },
  { value: 'Playfair Display, serif',        label: 'Playfair',   sample: 'Classic & Elegant' },
  { value: 'Georgia, serif',                label: 'Georgia',    sample: 'Traditional & Trustworthy' },
  { value: 'Roboto, sans-serif',             label: 'Roboto',     sample: 'Neutral & Readable' },
];

const PRESET_THEMES = [
  { name: 'Navy Gold',   primary: '#0D1B2A', accent: '#C9A84C' },
  { name: 'Forest',      primary: '#1a3d2b', accent: '#4CAF50' },
  { name: 'Royal Blue',  primary: '#1a237e', accent: '#FFC107' },
  { name: 'Crimson',     primary: '#7f1d1d', accent: '#F59E0B' },
  { name: 'Slate',       primary: '#1e293b', accent: '#38BDF8' },
  { name: 'Emerald',     primary: '#064e3b', accent: '#D97706' },
];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px', bgcolor: '#F8F7F4',
    '& fieldset': { borderColor: '#E8E4DC' },
    '&:hover fieldset': { borderColor: '#C9A84C' },
    '&.Mui-focused fieldset': { borderColor: '#0D1B2A', borderWidth: 1.5 },
  },
};

const SectionCard = ({ title, icon, children }) => (
  <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #F0EDE5', p: 3, mb: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
      <Box sx={{ width: 32, height: 32, bgcolor: '#F5F4F0', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0D1B2A' }}>{title}</Typography>
    </Box>
    {children}
  </Box>
);

export default function BrandingSettingsPage() {
  // ✅ FIXED: useTheme() is now safe — context always has a value
  const { theme, applyTheme } = useTheme();

  const [form,        setForm]        = useState({ ...theme });
  const [logoFile,    setLogoFile]    = useState(null);
  const [logoPreview, setLogoPreview] = useState(theme.logo);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [snack,       setSnack]       = useState({ open: false, msg: '', severity: 'success' });
  const logoRef = useRef();

  const notify = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('theme_color',  form.primaryColor);
      fd.append('accent_color', form.accentColor);
      fd.append('font_family',  form.fontFamily);
      fd.append('sidebar_dark', form.sidebarDark ? 'true' : 'false');
      if (logoFile) fd.append('logo', logoFile);

      await api.patch('/profile/firm/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Apply globally
      applyTheme({ ...form, logo: logoPreview });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      notify('Branding saved and applied!');
    } catch {
      notify('Failed to save branding', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm({ ...defaultTheme });
    setLogoPreview(null);
    setLogoFile(null);
    notify('Reset to defaults', 'info');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#F5F4F0', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <Box sx={{
        borderRadius: '20px',
        background: `linear-gradient(135deg, ${form.primaryColor} 0%, ${form.primaryColor}cc 100%)`,
        p: { xs: 3, md: 4 }, mb: 3, position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: `1px solid ${form.accentColor}25`, pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box sx={{ width: 32, height: 32, bgcolor: `${form.accentColor}25`, borderRadius: '9px', border: `1px solid ${form.accentColor}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PaletteRounded sx={{ color: form.accentColor, fontSize: 16 }} />
              </Box>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: form.accentColor, textTransform: 'uppercase' }}>
                HP HCMS · Settings
              </Typography>
            </Box>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#fff', lineHeight: 1.15, mb: 0.5 }}>
              Branding & Theme
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
              Customize your firm's logo, colors and typography
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button onClick={handleReset} startIcon={<RestartAltRounded />} sx={{
              color: 'rgba(255,255,255,0.7)', borderRadius: '12px', px: 2.5, py: 1.2,
              textTransform: 'none', fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}
              startIcon={saved ? <CheckCircleRounded /> : <SaveRounded />}
              sx={{
                bgcolor: form.accentColor, color: '#0D1B2A',
                borderRadius: '12px', px: 3, py: 1.2, fontWeight: 800, textTransform: 'none',
                boxShadow: `0 4px 20px ${form.accentColor}50`,
                '&:hover': { filter: 'brightness(1.1)' },
                transition: 'all 0.2s',
              }}>
              {saving ? <CircularProgress size={16} sx={{ color: '#0D1B2A' }} /> : saved ? 'Saved!' : 'Save Changes'}
            </Button>
          </Box>
        </Box>

        {/* Live Preview strip */}
        <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 1 }}>
          <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
            Live Preview
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {logoPreview ? (
              <Box component="img" src={logoPreview} sx={{ height: 36, maxWidth: 120, objectFit: 'contain', borderRadius: '8px' }} />
            ) : (
              <Box sx={{ height: 36, px: 2, bgcolor: `${form.accentColor}20`, border: `1px solid ${form.accentColor}40`, borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: form.accentColor, fontFamily: form.fontFamily }}>
                  {form.firmName || 'Your Firm'}
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[form.primaryColor, form.accentColor].map((c, i) => (
                <Box key={i} sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: c, border: '2px solid rgba(255,255,255,0.3)' }} />
              ))}
            </Box>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: form.fontFamily }}>
              {FONT_OPTIONS.find(f => f.value === form.fontFamily)?.label || 'Font'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>

        {/* ── LEFT ── */}
        <Box>
          {/* Logo */}
          <SectionCard title="Firm Logo" icon={<UploadRounded sx={{ fontSize: 16, color: '#0D1B2A' }} />}>
            <Box
              onClick={() => logoRef.current.click()}
              sx={{
                border: `2px dashed ${logoPreview ? '#10B981' : '#E8E4DC'}`,
                borderRadius: '14px', p: 3, textAlign: 'center', cursor: 'pointer',
                bgcolor: logoPreview ? '#ECFDF5' : '#F8F7F4',
                transition: 'all 0.2s',
                '&:hover': { borderColor: form.accentColor, bgcolor: '#FFF8E7' },
              }}
            >
              {logoPreview ? (
                <Box>
                  <Box component="img" src={logoPreview} sx={{ maxHeight: 80, maxWidth: 200, objectFit: 'contain', mb: 1.5, borderRadius: '8px' }} />
                  <Typography sx={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>Logo uploaded · Click to change</Typography>
                </Box>
              ) : (
                <Box>
                  <Box sx={{ width: 48, height: 48, bgcolor: '#F0EDE5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                    <UploadRounded sx={{ color: '#9CA3AF', fontSize: 24 }} />
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', mb: 0.3 }}>Click to upload logo</Typography>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>PNG, SVG or JPG · max 2MB · recommended 200×60px</Typography>
                </Box>
              )}
              <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
            </Box>
          </SectionCard>

          {/* Typography */}
          <SectionCard title="Typography" icon={<TextFieldsRounded sx={{ fontSize: 16, color: '#0D1B2A' }} />}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {FONT_OPTIONS.map(font => (
                <Box key={font.value}
                  onClick={() => setForm(p => ({ ...p, fontFamily: font.value }))}
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    p: 1.5, borderRadius: '10px', cursor: 'pointer',
                    bgcolor: form.fontFamily === font.value ? form.primaryColor + '10' : '#F8F7F4',
                    border: `1.5px solid ${form.fontFamily === font.value ? form.primaryColor : 'transparent'}`,
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: '#F0EDE5' },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0D1B2A', fontFamily: font.value }}>{font.label}</Typography>
                    <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontFamily: font.value }}>{font.sample}</Typography>
                  </Box>
                  {form.fontFamily === font.value && (
                    <CheckCircleRounded sx={{ color: form.primaryColor, fontSize: 18 }} />
                  )}
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Box>

        {/* ── RIGHT ── */}
        <Box>
          {/* Colors */}
          <SectionCard title="Brand Colors" icon={<FormatColorFillRounded sx={{ fontSize: 16, color: '#0D1B2A' }} />}>
            {/* Presets */}
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
              Quick Presets
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 3 }}>
              {PRESET_THEMES.map(preset => (
                <Box key={preset.name}
                  onClick={() => setForm(p => ({ ...p, primaryColor: preset.primary, accentColor: preset.accent }))}
                  sx={{
                    borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${form.primaryColor === preset.primary ? preset.accent : 'transparent'}`,
                    transition: 'all 0.15s', '&:hover': { transform: 'scale(1.03)' },
                  }}
                >
                  <Box sx={{ height: 28, bgcolor: preset.primary }} />
                  <Box sx={{ height: 14, bgcolor: preset.accent }} />
                  <Box sx={{ p: 0.8, bgcolor: '#F8F7F4' }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#64748B', textAlign: 'center' }}>{preset.name}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Custom pickers */}
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
              Custom Colors
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { label: 'Primary (Sidebar & Header)', key: 'primaryColor' },
                { label: 'Accent (Buttons & Highlights)', key: 'accentColor' },
              ].map(({ label, key }) => (
                <Box key={key}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B', mb: 1 }}>{label}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: form[key], border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', flexShrink: 0 }}
                      onClick={() => document.getElementById(`picker-${key}`).click()}
                    />
                    <input
                      id={`picker-${key}`}
                      type="color"
                      value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F8F7F4', border: '1px solid #E8E4DC', borderRadius: '10px', px: 2, py: 1.2 }}>
                      <Typography sx={{ fontSize: 13, fontFamily: 'monospace', color: '#0D1B2A', fontWeight: 700 }}>
                        {form[key]?.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </SectionCard>

          {/* Sidebar style */}
          <SectionCard title="Sidebar Style" icon={<PaletteRounded sx={{ fontSize: 16, color: '#0D1B2A' }} />}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[
                { label: 'Dark Sidebar',  value: true,  preview: '#0D1B2A' },
                { label: 'Light Sidebar', value: false, preview: '#ffffff' },
              ].map(opt => (
                <Box key={String(opt.value)}
                  onClick={() => setForm(p => ({ ...p, sidebarDark: opt.value }))}
                  sx={{
                    flex: 1, borderRadius: '12px',
                    border: `2px solid ${form.sidebarDark === opt.value ? form.accentColor : '#E8E4DC'}`,
                    overflow: 'hidden', cursor: 'pointer',
                    transition: 'all 0.15s', '&:hover': { borderColor: form.accentColor },
                  }}
                >
                  <Box sx={{ height: 56, bgcolor: opt.preview, borderRadius: '10px 10px 0 0' }}>
                    {[1, 2, 3].map(i => (
                      <Box key={i} sx={{ height: 8, mx: 1.5, mt: i === 1 ? 1.5 : 0.8, borderRadius: 4, bgcolor: opt.value ? 'rgba(255,255,255,0.15)' : '#F0EDE5' }} />
                    ))}
                  </Box>
                  <Box sx={{ p: 1, bgcolor: '#F8F7F4', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: form.sidebarDark === opt.value ? form.accentColor : '#64748B' }}>
                      {opt.label}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
// src/components/PageHero.jsx
import { Box, Typography } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

export default function PageHero({ label, icon, title, subtitle, action }) {
  const { theme } = useTheme();
  const primary = theme.primaryColor || '#0D1B2A';
  const accent  = theme.accentColor  || '#C9A84C';

  return (
    <Box sx={{
      borderRadius: '20px',
      background: `linear-gradient(135deg, ${primary} 0%, ${primary}ee 55%, ${primary}cc 100%)`,
      p: { xs: 3, md: 4 }, mb: 3, position: 'relative', overflow: 'hidden',
    }}>
      {/* Orbs */}
      <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', border: `1px solid ${accent}25`, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', top: -15, right: -15, width: 110, height: 110, borderRadius: '50%', border: `1px solid ${accent}15`, pointerEvents: 'none' }} />
      <Box sx={{ position: 'absolute', bottom: -30, left: 160, width: 140, height: 140, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          {/* Eyebrow */}
          {(label || icon) && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              {icon && (
                <Box sx={{ width: 32, height: 32, bgcolor: `${accent}25`, borderRadius: '9px', border: `1px solid ${accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ color: accent, display: 'flex', '& svg': { fontSize: 16 } }}>{icon}</Box>
                </Box>
              )}
              {label && (
                <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase' }}>
                  {label}
                </Typography>
              )}
            </Box>
          )}
          {/* Title */}
          <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800, color: '#fff', lineHeight: 1.15, mb: subtitle ? 0.5 : 0, letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          {/* Subtitle */}
          {subtitle && (
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {/* Action */}
        {action && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>{action}</Box>}
      </Box>
    </Box>
  );
}
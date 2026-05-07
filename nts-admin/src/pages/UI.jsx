import { Box, Typography, Skeleton } from '@mui/material';
import { TrendingUpRounded, TrendingDownRounded } from '@mui/icons-material';

// ─── PageHeader ─────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography variant="h5" fontWeight={700} color="text.primary">{title}</Typography>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{subtitle}</Typography>}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}

// ─── StatCard ───────────────────────────────────────────
export function StatCard({ title, value, icon, color = '#1a2e4a', trend, trendLabel, loading }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(26,46,74,0.06)',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `${color}10`,
          transform: 'translate(20px, -20px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton width={80} height={40} sx={{ mt: 0.5 }} />
          ) : (
            <Typography variant="h4" fontWeight={700} sx={{ color, mt: 0.5, lineHeight: 1 }}>
              {value}
            </Typography>
          )}
          {trend !== undefined && !loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              {trend >= 0
                ? <TrendingUpRounded sx={{ fontSize: 14, color: 'success.main' }} />
                : <TrendingDownRounded sx={{ fontSize: 14, color: 'error.main' }} />
              }
              <Typography variant="caption" sx={{ color: trend >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                {Math.abs(trend)}%
              </Typography>
              {trendLabel && (
                <Typography variant="caption" color="text.secondary">{trendLabel}</Typography>
              )}
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${color}18, ${color}28)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Box>
  );
}

// ─── EmptyState ─────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Box sx={{ fontSize: 56, color: 'divider', mb: 2 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={600} color="text.secondary">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>{description}</Typography>
      )}
    </Box>
  );
}

// ─── SectionCard ────────────────────────────────────────
export function SectionCard({ title, action, children, sx = {} }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 2px 8px rgba(26,46,74,0.06)',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {title && (
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
          {action}
        </Box>
      )}
      {children}
    </Box>
  );
}

// ─── StatusChip ─────────────────────────────────────────
export function StatusChip({ status }) {
  const configs = {
    open:    { label: 'Open',    color: '#1565c0', bg: '#e3f2fd' },
    closed:  { label: 'Closed',  color: '#2e7d32', bg: '#e8f5e9' },
    pending: { label: 'Pending', color: '#e65100', bg: '#fff3e0' },
    paid:    { label: 'Paid',    color: '#2e7d32', bg: '#e8f5e9' },
    unpaid:  { label: 'Unpaid',  color: '#c62828', bg: '#ffebee' },
    partial: { label: 'Partial', color: '#e65100', bg: '#fff3e0' },
  };
  const cfg = configs[status?.toLowerCase()] || { label: status, color: '#546e7a', bg: '#eceff1' };
  return (
    <Box
      component="span"
      sx={{
        px: 1.2,
        py: 0.35,
        borderRadius: 1.5,
        fontSize: '0.72rem',
        fontWeight: 600,
        color: cfg.color,
        bgcolor: cfg.bg,
        display: 'inline-block',
        letterSpacing: '0.02em',
      }}
    >
      {cfg.label}
    </Box>
  );
}

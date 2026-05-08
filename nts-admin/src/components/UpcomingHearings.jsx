import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import { GavelRounded, AccessTimeRounded, LocationOnRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
 
export function UpcomingHearingsWidget() {
  const [hearings, setHearings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();
 
  useEffect(() => {
    api.get('/cases/upcoming-hearings/?days=14')
      .then(res => setHearings(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
 
  const getUrgencyStyle = (days) => {
    if (days === 0) return { color: '#EF4444', bg: '#FEF2F2', label: 'Today' };
    if (days === 1) return { color: '#F97316', bg: '#FFF7ED', label: 'Tomorrow' };
    if (days <= 3)  return { color: '#F59E0B', bg: '#FFFBEB', label: `${days} days` };
    return           { color: '#3B82F6', bg: '#EFF6FF', label: `${days} days` };
  };
 
  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #F0EDE5', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F5F4F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 32, height: 32, bgcolor: '#EFF6FF', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GavelRounded sx={{ color: '#3B82F6', fontSize: 16 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0D1B2A' }}>Upcoming Hearings</Typography>
            <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>Next 14 days</Typography>
          </Box>
        </Box>
        {hearings.length > 0 && (
          <Chip label={hearings.length} size="small"
            sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: '#EFF6FF', color: '#3B82F6' }} />
        )}
      </Box>
 
      {loading ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={20} sx={{ color: '#0D1B2A' }} /></Box>
      ) : hearings.length === 0 ? (
        <Box sx={{ p: 5, textAlign: 'center' }}>
          <GavelRounded sx={{ fontSize: 28, color: '#D0CEC7', mb: 1 }} />
          <Typography sx={{ fontSize: 13, color: '#9CA3AF' }}>No hearings in the next 14 days</Typography>
        </Box>
      ) : (
        <Box>
          {hearings.slice(0, 6).map((h, idx) => {
            const urg = getUrgencyStyle(h.days_until);
            return (
              <Box key={h.id}
                onClick={() => navigate(`/cases`)}
                sx={{
                  display: 'flex', gap: 2, px: 3, py: 2,
                  borderBottom: idx < Math.min(hearings.length, 6) - 1 ? '1px solid #F5F4F0' : 'none',
                  cursor: 'pointer', transition: 'background 0.12s',
                  '&:hover': { bgcolor: '#FAFAF8' },
                }}>
                {/* Date bubble */}
                <Box sx={{ width: 44, height: 44, bgcolor: urg.bg, borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: urg.color, lineHeight: 1 }}>
                    {new Date(h.date).getDate()}
                  </Typography>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: urg.color, textTransform: 'uppercase' }}>
                    {new Date(h.date).toLocaleString('en-IN', { month: 'short' })}
                  </Typography>
                </Box>
 
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.3 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0D1B2A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.case_title}
                    </Typography>
                    <Box sx={{ px: 1.2, py: 0.2, borderRadius: '20px', bgcolor: urg.bg, flexShrink: 0, ml: 1 }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, color: urg.color }}>{urg.label}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF', mb: 0.3 }}>{h.client_name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {h.start_time && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <AccessTimeRounded sx={{ fontSize: 11, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
                          {new Date(`2000-01-01T${h.start_time}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    )}
                    {h.court_name && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                        <LocationOnRounded sx={{ fontSize: 11, color: '#9CA3AF' }} />
                        <Typography sx={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
                          {h.court_name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
 

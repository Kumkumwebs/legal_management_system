import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, GavelRounded, LockOutlined, PersonOutline } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [localError, setLocalError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ REMOVED useEffect redirect — App.jsx already handles it via:
  //    user ? <Navigate to="/" replace /> : <LoginPage />

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      const ok = await login(username, password);
      if (ok) navigate('/', { replace: true }); // ✅ Fixed: '/' not '/dashboard'
    } catch (err) {
      setLocalError(err?.response?.data?.detail || 'Invalid username or password');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      background: '#F9F6F0',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Decorative shapes ── */}
      <Box sx={{
        position: 'absolute', top: -80, left: -80,
        width: 220, height: 220, borderRadius: '50%',
        background: '#0D1B2A',
        zIndex: -1, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', top: 20, left: 20,
        width: 100, height: 100, borderRadius: '50%',
        border: '1.5px solid rgba(201,168,76,0.5)',
        zIndex: -1, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', top: 62, left: 62,
        width: 16, height: 16, borderRadius: '50%',
        background: '#C9A84C',
        zIndex: -1, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -60, right: -60,
        width: 200, height: 200, borderRadius: '24px',
        background: '#0D1B2A', transform: 'rotate(15deg)',
        zIndex: -1, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: 18, right: 18,
        width: 80, height: 80, borderRadius: '10px',
        border: '1.5px solid rgba(201,168,76,0.4)', transform: 'rotate(10deg)',
        zIndex: -1, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: 60, left: -40,
        width: 130, height: 130, borderRadius: '50%',
        border: '1px solid rgba(201,168,76,0.2)',
        zIndex: -1, pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', top: -50, right: '28%',
        width: 160, height: 160, borderRadius: '50%',
        border: '1px solid rgba(13,27,42,0.06)',
        zIndex: -1, pointerEvents: 'none',
      }} />

      {/* ── Left branding panel ── */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        justifyContent: 'center',
        width: '48%',
        minHeight: '100vh',
        px: { lg: 8, xl: 11 },
        py: 6,
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 6 }}>
          <Box sx={{
            width: 46, height: 46, borderRadius: '13px',
            background: '#0D1B2A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(13,27,42,0.22)',
          }}>
            <GavelRounded sx={{ fontSize: 23, color: '#C9A84C' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0D1B2A', lineHeight: 1, letterSpacing: '-0.02em' }}>
              HP Highcourt

            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', letterSpacing: '0.13em', textTransform: 'uppercase', mt: 0.35 }}>
              Management System
            </Typography>
          </Box>
        </Box>

        {/* Headline */}
        <Box sx={{ mb: 3.5 }}>
          <Typography sx={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: { lg: '2.6rem', xl: '3.2rem' },
            fontWeight: 400, color: '#0D1B2A',
            lineHeight: 1.15, letterSpacing: '-0.02em', display: 'block',
          }}>
            Your entire practice,
          </Typography>
          <Typography sx={{
            fontFamily: '"DM Serif Display", serif',
            fontStyle: 'italic',
            fontSize: { lg: '2.6rem', xl: '3.2rem' },
            fontWeight: 400, color: '#C9A84C',
            lineHeight: 1.15, letterSpacing: '-0.02em', display: 'block',
          }}>
            one dashboard.
          </Typography>
        </Box>

        <Typography sx={{ color: '#64748B', fontSize: '0.93rem', lineHeight: 1.8, maxWidth: 370, mb: 5 }}>
          Manage clients, cases, documents, hearings, and revenue in one beautifully unified legal workspace built for modern law firms.
        </Typography>

        {/* Feature pills */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 5 }}>
          {['Client Management', 'Case Tracking', 'Document Vault', 'Payment Reports', 'Team Roles'].map((feat) => (
            <Box key={feat} sx={{
              px: 1.75, py: 0.65,
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '99px',
              display: 'flex', alignItems: 'center', gap: 0.75,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0 }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#0D1B2A' }}>{feat}</Typography>
            </Box>
          ))}
        </Box>

        {/* Stats row */}
        <Box sx={{
          display: 'flex',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          overflow: 'hidden',
          maxWidth: 390,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        }}>
          {[['500+', 'Law Firms'], ['98%', 'Uptime SLA'], ['24/7', 'Support']].map(([val, label], i) => (
            <Box key={label} sx={{
              flex: 1, py: 2.25, px: 2,
              borderRight: i < 2 ? '1px solid #F1F5F9' : 'none',
              textAlign: 'center',
            }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0D1B2A', letterSpacing: '-0.02em' }}>{val}</Typography>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.3, letterSpacing: '0.05em' }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right login panel ── */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1,
        px: 2,
        py: 4,
      }}>
        <Card sx={{
          width: '100%',
          maxWidth: 460,
          borderRadius: '24px',
          background: '#FFFFFF',
          boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 24px 80px rgba(13,27,42,0.12)',
          border: '1px solid #EEF0F3',
          overflow: 'visible',
          position: 'relative',
        }}>
          {/* Gold stripe */}
          <Box sx={{
            position: 'absolute',
            top: 0, left: 32, right: 32,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #C9A84C 30%, #E8C97A 65%, transparent)',
            borderRadius: '0 0 4px 4px',
          }} />

          <CardContent sx={{ p: { xs: 3.5, sm: 5 }, pt: { xs: 4.5, sm: 5.5 } }}>

            {/* Mobile-only logo */}
            <Box sx={{ display: { lg: 'none' }, mb: 4, textAlign: 'center' }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: '14px',
                background: '#0D1B2A',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                mb: 1.5,
              }}>
                <GavelRounded sx={{ fontSize: 24, color: '#C9A84C' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0D1B2A', display: 'block' }}>
                HP Highcourt management system
              </Typography>
            </Box>

            {/* Lock icon badge */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, mb: 3 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: '12px',
                background: '#F9F6F0',
                border: '1px solid #E8C97A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <LockOutlined sx={{ color: '#C9A84C', fontSize: 20 }} />
              </Box>
            </Box>

            {/* Heading */}
            <Box sx={{ mb: 4 }}>
              <Typography sx={{
                fontFamily: '"DM Serif Display", serif',
                fontSize: '1.9rem', fontWeight: 400,
                color: '#0D1B2A', lineHeight: 1.15, mb: 0.75,
              }}>
                Welcome back
              </Typography>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Sign in to access your legal workspace
              </Typography>
            </Box>

            {/* Error alert */}
            {localError && (
              <Alert severity="error" sx={{
                mb: 3, borderRadius: '12px',
                border: '1px solid #FECACA', background: '#FEF2F2',
                '& .MuiAlert-icon': { color: '#EF4444' },
              }}>
                {localError}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column' }}>

              {/* Username */}
              <Box sx={{ mb: 2.5 }}>
                <Typography sx={{
                  fontSize: '0.75rem', fontWeight: 700, color: '#475569',
                  textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.9,
                }}>
                  Username
                </Typography>
                <TextField
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required fullWidth
                  placeholder="Enter your username"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: '#F9F6F0',
                      fontSize: '0.925rem',
                      '& fieldset': { borderColor: '#E2E8F0', borderWidth: '1.5px' },
                      '&:hover fieldset': { borderColor: '#C9A84C' },
                      '&.Mui-focused fieldset': { borderColor: '#C9A84C', borderWidth: '2px' },
                    },
                    '& .MuiOutlinedInput-input': { py: 1.5, px: 1.5 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline sx={{ color: '#C9A84C', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Password */}
              <Box sx={{ mb: 3.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.9 }}>
                  <Typography sx={{
                    fontSize: '0.75rem', fontWeight: 700, color: '#475569',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    Password
                  </Typography>
                  <Typography sx={{
                    fontSize: '0.78rem', color: '#C9A84C', fontWeight: 600,
                    cursor: 'pointer', '&:hover': { color: '#A07830' },
                  }}>
                    Forgot password?
                  </Typography>
                </Box>
                <TextField
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required fullWidth
                  placeholder="Enter your password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: '#F9F6F0',
                      fontSize: '0.925rem',
                      '& fieldset': { borderColor: '#E2E8F0', borderWidth: '1.5px' },
                      '&:hover fieldset': { borderColor: '#C9A84C' },
                      '&.Mui-focused fieldset': { borderColor: '#C9A84C', borderWidth: '2px' },
                    },
                    '& .MuiOutlinedInput-input': { py: 1.5, px: 1.5 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#C9A84C', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPass(!showPass)} edge="end" size="small"
                          sx={{ color: '#94A3B8', '&:hover': { color: '#C9A84C' } }}
                        >
                          {showPass ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Sign In button */}
              <Button
                type="submit" variant="contained" fullWidth size="large"
                disabled={loading}
                sx={{
                  borderRadius: '12px', py: 1.65,
                  fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.01em',
                  background: '#0D1B2A', color: '#FFFFFF', border: '1px solid #0D1B2A',
                  '&:hover': {
                    background: '#1B2D41',
                    boxShadow: '0 8px 24px rgba(13,27,42,0.28)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': { transform: 'translateY(0)' },
                  '&.Mui-disabled': { background: '#CBD5E1', color: '#FFFFFF', border: 'none' },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: '#FFFFFF' }} /> : 'Sign In'}
              </Button>
            </Box>

            {/* Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
              <Box sx={{ flex: 1, height: '1px', background: '#F1F5F9' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#CBD5E1', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Secured with JWT
              </Typography>
              <Box sx={{ flex: 1, height: '1px', background: '#F1F5F9' }} />
            </Box>

            {/* Security trust badges */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              {['256-bit SSL', 'SOC 2 Ready', 'GDPR Safe'].map((badge) => (
                <Box key={badge} sx={{
                  display: 'flex', alignItems: 'center', gap: 0.6,
                  px: 1.4, py: 0.55,
                  background: '#F9F6F0', border: '1px solid #E2E8F0', borderRadius: '99px',
                }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 600 }}>{badge}</Typography>
                </Box>
              ))}
            </Box>

            {/* Footer */}
            <Typography sx={{ mt: 3.5, textAlign: 'center', color: '#CBD5E1', fontSize: '0.74rem' }}>
              © {new Date().getFullYear()} NTS Legal Pro · All rights reserved
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default LoginPage;
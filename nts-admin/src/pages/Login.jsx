import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Alert,
  CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, GavelRounded } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes float-a {
  0%,100% { transform: translate(0,0) scale(1); }
  33%      { transform: translate(40px,-30px) scale(1.08); }
  66%      { transform: translate(-20px,20px) scale(0.95); }
}
@keyframes float-b {
  0%,100% { transform: translate(0,0) scale(1); }
  40%      { transform: translate(-35px,25px) scale(1.05); }
  70%      { transform: translate(25px,-15px) scale(0.97); }
}
@keyframes float-c {
  0%,100% { transform: translate(0,0); }
  50%      { transform: translate(20px,-40px); }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes lineGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes pulse-ring {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.5); opacity: 0; }
}

.lp {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #0D1B2A;
}

/* ════════ LEFT PANEL ════════ */
.lp-left {
  position: relative;
  width: 52%;
  display: none;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 52px;
  overflow: hidden;
  background: linear-gradient(145deg, #0A1520 0%, #0D1B2A 50%, #111f30 100%);
}
@media (min-width: 1024px) { .lp-left { display: flex; } }

.lp-orb { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(60px); }
.lp-orb-1 { width: 480px; height: 480px; top: -100px; left: -120px; background: radial-gradient(circle, rgba(201,168,76,0.18) 0%, transparent 70%); animation: float-a 14s ease-in-out infinite; }
.lp-orb-2 { width: 360px; height: 360px; bottom: -80px; right: -80px; background: radial-gradient(circle, rgba(41,82,140,0.35) 0%, transparent 70%); animation: float-b 18s ease-in-out infinite; }
.lp-orb-3 { width: 240px; height: 240px; top: 45%; left: 40%; background: radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%); animation: float-c 10s ease-in-out infinite; }
.lp-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 48px 48px; }
.lp-grain { position: absolute; inset: 0; opacity: 0.04; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 160px; pointer-events: none; }

.lp-nav { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; animation: fadeSlideUp 0.6s ease both; }
.lp-logo { display: flex; align-items: center; gap: 14px; }
.lp-logo-icon { width: 42px; height: 42px; border-radius: 11px; background: linear-gradient(135deg, #C9A84C 0%, #E8C97A 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 1px rgba(201,168,76,0.4), 0 8px 20px rgba(201,168,76,0.2); }
.lp-logo-name { font-size: 0.88rem; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
.lp-logo-sub { font-family: 'DM Mono', monospace; font-size: 0.58rem; color: rgba(201,168,76,0.65); letter-spacing: 0.2em; text-transform: uppercase; margin-top: 4px; }
.lp-status { display: flex; align-items: center; gap: 8px; padding: 6px 14px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 99px; font-family: 'DM Mono', monospace; font-size: 0.62rem; color: rgba(255,255,255,0.5); letter-spacing: 0.1em; }
.lp-status-dot { position: relative; width: 7px; height: 7px; }
.lp-status-dot::before, .lp-status-dot::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: #4ADE80; }
.lp-status-dot::after { animation: pulse-ring 1.8s ease-out infinite; }

.lp-hero { position: relative; z-index: 2; animation: fadeSlideUp 0.7s ease 0.1s both; }
.lp-kicker { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.lp-kicker-line { height: 1px; width: 40px; background: linear-gradient(90deg, #C9A84C, transparent); transform-origin: left; animation: lineGrow 0.8s ease 0.4s both; }
.lp-kicker-text { font-family: 'DM Mono', monospace; font-size: 0.65rem; color: #C9A84C; letter-spacing: 0.22em; text-transform: uppercase; }
.lp-headline { font-family: 'DM Serif Display', serif; font-size: clamp(2.4rem, 3.2vw, 3.6rem); font-weight: 400; color: #fff; line-height: 1.06; letter-spacing: -0.025em; margin-bottom: 22px; }
.lp-headline em { font-style: italic; color: #C9A84C; }
.lp-desc { font-size: 0.95rem; color: rgba(255,255,255,0.45); line-height: 1.75; max-width: 420px; }

.lp-glass { margin-top: 44px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px; backdrop-filter: blur(12px); display: grid; grid-template-columns: 1fr 1fr 1fr; }
.lp-stat { padding: 0 24px; border-right: 1px solid rgba(255,255,255,0.07); }
.lp-stat:first-child { padding-left: 0; }
.lp-stat:last-child  { border: none; }
.lp-stat-val { font-family: 'DM Mono', monospace; font-size: 1.65rem; font-weight: 500; color: #C9A84C; letter-spacing: -0.02em; }
.lp-stat-label { font-size: 0.72rem; color: rgba(255,255,255,0.4); margin-top: 4px; }

.lp-quote-wrap { position: relative; z-index: 2; animation: fadeSlideUp 0.7s ease 0.2s both; }
.lp-quote { display: flex; gap: 16px; align-items: flex-start; }
.lp-quote-bar { width: 2px; min-height: 48px; background: linear-gradient(to bottom, #C9A84C, transparent); border-radius: 2px; flex-shrink: 0; margin-top: 2px; }
.lp-quote-text { font-family: 'DM Serif Display', serif; font-style: italic; font-size: 0.95rem; color: rgba(255,255,255,0.6); line-height: 1.6; }
.lp-quote-author { display: block; margin-top: 10px; font-family: 'DM Sans', sans-serif; font-style: normal; font-size: 0.72rem; color: rgba(255,255,255,0.35); letter-spacing: 0.06em; text-transform: uppercase; }

/* ════════ RIGHT PANEL ════════ */
.lp-right {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  background: #F8F5EF; padding: 40px 28px; position: relative;
  min-height: 100vh; /* ✅ Fix: ensure right panel always fills full height */
}
.lp-right::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(13,27,42,0.04) 1px, transparent 1px); background-size: 24px 24px; }
.lp-arc   { position: absolute; top: -80px; right: -80px; width: 240px; height: 240px; border-radius: 50%; border: 1px solid rgba(201,168,76,0.12); pointer-events: none; }
.lp-arc-2 { position: absolute; top: -40px; right: -40px; width: 140px; height: 140px; border-radius: 50%; border: 1px solid rgba(201,168,76,0.08); pointer-events: none; }

.lp-form-wrap { width: 100%; max-width: 400px; position: relative; z-index: 1; animation: fadeSlideUp 0.6s ease 0.15s both; }
.lp-mb-brand { display: flex; flex-direction: column; align-items: center; margin-bottom: 32px; }
@media (min-width: 1024px) { .lp-mb-brand { display: none; } }
.lp-mb-icon { width: 52px; height: 52px; border-radius: 14px; background: #0D1B2A; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 8px 24px rgba(13,27,42,0.18); }
.lp-mb-name { font-size: 0.88rem; font-weight: 700; color: #0D1B2A; }
.lp-mb-sub { font-family: 'DM Mono', monospace; font-size: 0.58rem; color: #C9A84C; letter-spacing: 0.2em; text-transform: uppercase; margin-top: 5px; }
.lp-step { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.lp-step-dot { width: 8px; height: 8px; border-radius: 50%; background: #C9A84C; box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
.lp-step-text { font-family: 'DM Mono', monospace; font-size: 0.64rem; color: #C9A84C; letter-spacing: 0.18em; text-transform: uppercase; }
.lp-heading { font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; color: #0D1B2A; line-height: 1.1; letter-spacing: -0.025em; margin-bottom: 8px; }
.lp-heading em { font-style: italic; color: #C9A84C; }
.lp-sub { font-size: 0.875rem; color: #64748B; line-height: 1.6; margin-bottom: 32px; }
.lp-field { margin-bottom: 20px; }
.lp-field-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.lp-field-label { font-size: 0.75rem; font-weight: 600; color: #0D1B2A; letter-spacing: 0.04em; }
.lp-field-link { font-size: 0.74rem; color: #94A3B8; cursor: pointer; transition: color 0.18s; background: none; border: none; padding: 0; font-family: 'DM Sans', sans-serif; }
.lp-field-link:hover { color: #C9A84C; }
.lp-divider { height: 1px; background: linear-gradient(90deg, transparent, #E2E8F0 30%, #E2E8F0 70%, transparent); margin: 24px 0; }
.lp-foot { display: flex; align-items: center; justify-content: center; gap: 16px; font-family: 'DM Mono', monospace; font-size: 0.64rem; color: #CBD5E1; letter-spacing: 0.08em; }
.lp-foot-sep { width: 3px; height: 3px; border-radius: 50%; background: #E2E8F0; }
`;

function parseLoginError(err) {
  if (!err.response) {
    if (err.request) return 'Cannot reach the server. Check that the Django server is running on port 8000.';
    return 'Network error. Please check your internet connection.';
  }
  const data   = err.response.data;
  const status = err.response.status;
  const msg =
    data?.error ||
    data?.detail ||
    data?.message ||
    (Array.isArray(data?.non_field_errors) ? data.non_field_errors[0] : null) ||
    (typeof data === 'string' ? data : null);
  if (msg) return msg;
  if (status === 401) return 'Incorrect username or password.';
  if (status === 400) return 'Username and password are required.';
  if (status === 403) return 'Access denied.';
  if (status === 500) return 'Server error. Please try again later.';
  return `Login failed (HTTP ${status}).`;
}

const LoginPage = () => {
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [localError, setLocalError] = useState('');
  const [focusedField, setFocused]  = useState(null);
  const [loading, setLoading]       = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);
    try {
      await login(username, password);
      // ✅ FIXED: was navigate('/') which hit the public website route
      // Now correctly navigates to the protected dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setLocalError(parseLoginError(err));
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = (key) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: '11px',
      background: '#FFFFFF',
      fontSize: '0.9rem',
      fontFamily: '"DM Sans", sans-serif',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      '& fieldset': {
        borderColor: focusedField === key ? '#0D1B2A' : '#E2E8F0',
        borderWidth: focusedField === key ? '1.5px' : '1px',
        transition: 'all 0.2s',
      },
      '&:hover fieldset': { borderColor: '#CBD5E1' },
      '&.Mui-focused fieldset': { borderColor: '#0D1B2A', borderWidth: '1.5px' },
      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(13,27,42,0.07), 0 2px 8px rgba(13,27,42,0.06)' },
    },
    '& .MuiOutlinedInput-input': {
      py: 1.5, px: 1.75,
      '&::placeholder': { color: '#CBD5E1', opacity: 1 },
    },
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="lp">

        {/* ══════ LEFT PANEL ══════ */}
        <div className="lp-left">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
          <div className="lp-grid" />
          <div className="lp-grain" />
          <nav className="lp-nav">
            <div className="lp-logo">
              <div className="lp-logo-icon">
                <GavelRounded sx={{ fontSize: 20, color: '#0D1B2A' }} />
              </div>
              <div>
                <div className="lp-logo-name">NTS online services opc pvt LTD</div>
                <div className="lp-logo-sub">Management System</div>
              </div>
            </div>
            <div className="lp-status">
              <span className="lp-status-dot" />
              LIVE
            </div>
          </nav>
          <div className="lp-hero">
            <div className="lp-kicker">
              <div className="lp-kicker-line" />
              <span className="lp-kicker-text">Chamber Portal</span>
            </div>
            <h1 className="lp-headline">
              Justice moves<br />
              <em>at your speed.</em>
            </h1>
            <p className="lp-desc">
              One unified workspace for clients, cases, hearings,
              documents and revenue — built for the modern law chamber.
            </p>
            <div className="lp-glass">
              <div className="lp-stat"><div className="lp-stat-val">12K+</div><div className="lp-stat-label">Cases Filed</div></div>
              <div className="lp-stat"><div className="lp-stat-val">500+</div><div className="lp-stat-label">Law Firms</div></div>
              <div className="lp-stat"><div className="lp-stat-val">99.9%</div><div className="lp-stat-label">Uptime</div></div>
            </div>
          </div>
          <div className="lp-quote-wrap">
            <div className="lp-quote">
              <div className="lp-quote-bar" />
              <div>
                <div className="lp-quote-text">
                  "Intake to hearing in minutes. Our entire chamber runs on this."
                  <span className="lp-quote-author">— Adv. R. Sharma, Senior Counsel</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════ RIGHT PANEL ══════ */}
        <div className="lp-right">
          <div className="lp-arc" />
          <div className="lp-arc-2" />
          <div className="lp-form-wrap">
            {/* Mobile brand */}
            <div className="lp-mb-brand">
              <div className="lp-mb-icon">
                <GavelRounded sx={{ fontSize: 24, color: '#C9A84C' }} />
              </div>
              <div className="lp-mb-name">NTS online services opc pvt LTD</div>
              <div className="lp-mb-sub">Management System</div>
            </div>

            <div className="lp-step">
              <div className="lp-step-dot" />
              <span className="lp-step-text">Authenticate</span>
            </div>

            <h2 className="lp-heading">Welcome <em>back.</em></h2>
            <p className="lp-sub">Sign in to access your legal workspace.</p>

            {localError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5, borderRadius: '11px',
                  border: '1px solid #FECACA', background: '#FEF2F2',
                  fontFamily: '"DM Sans"', fontSize: '0.83rem', py: 0.6,
                  '& .MuiAlert-icon': { color: '#EF4444', fontSize: 20 },
                }}
              >
                {localError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Username */}
              <div className="lp-field">
                <div className="lp-field-top">
                  <span className="lp-field-label">Username</span>
                </div>
                <TextField
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused('user')}
                  onBlur={() => setFocused(null)}
                  required fullWidth
                  placeholder="e.g. adv.ramsharma"
                  autoComplete="username"
                  sx={fieldSx('user')}
                />
              </div>

              {/* Password */}
              <div className="lp-field">
                <div className="lp-field-top">
                  <span className="lp-field-label">Password</span>
                  <button
                    type="button"
                    className="lp-field-link"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot password?
                  </button>
                </div>
                <TextField
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('pass')}
                  onBlur={() => setFocused(null)}
                  required fullWidth
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  sx={fieldSx('pass')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPass((p) => !p)}
                          edge="end" size="small"
                          sx={{
                            color: '#CBD5E1', mr: 0.25,
                            '&:hover': { color: '#0D1B2A', background: 'transparent' },
                            transition: 'color 0.18s',
                          }}
                        >
                          {showPass
                            ? <VisibilityOff sx={{ fontSize: 18 }} />
                            : <Visibility sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              <Button
                type="submit" fullWidth disabled={loading}
                sx={{
                  mt: 0.5, py: 1.6, borderRadius: '11px',
                  fontFamily: '"DM Sans"', fontSize: '0.92rem', fontWeight: 700,
                  textTransform: 'none', letterSpacing: '0.01em',
                  background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2D41 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 14px rgba(13,27,42,0.25), inset 0 1px 0 rgba(255,255,255,0.07)',
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.22s ease',
                  '&::after': {
                    content: '""', position: 'absolute', top: 0, left: '-100%',
                    width: '60%', height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.12), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1B2D41 0%, #243A52 100%)',
                    boxShadow: '0 8px 24px rgba(13,27,42,0.32), inset 0 1px 0 rgba(255,255,255,0.07)',
                    transform: 'translateY(-1px)',
                    '&::after': { left: '140%' },
                  },
                  '&:active': { transform: 'translateY(0)', boxShadow: '0 3px 10px rgba(13,27,42,0.2)' },
                  '&.Mui-disabled': { background: '#E2E8F0', color: '#94A3B8', boxShadow: 'none' },
                }}
              >
                {loading
                  ? <CircularProgress size={20} sx={{ color: '#fff' }} />
                  : 'Sign in to Chambers'}
              </Button>
            </Box>

            <div className="lp-divider" />
            <div className="lp-foot">
              <span>256-BIT TLS</span>
              <span className="lp-foot-sep" />
              <span>JWT SECURE</span>
              <span className="lp-foot-sep" />
              <span>© {new Date().getFullYear()} NTS Legal Pro</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default LoginPage;
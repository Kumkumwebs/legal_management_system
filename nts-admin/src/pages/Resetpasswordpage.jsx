import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { GavelRounded, LockResetRounded, Visibility, VisibilityOff, CheckRounded, ArrowBackRounded } from '@mui/icons-material';
import api from '../api/client';

const T = {
  navy: '#0D1B2A', navy2: '#1B2D41',
  gold: '#C9A84C', slate: '#64748B',
  slateL: '#94A3B8', border: '#E8EDF2',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing:border-box;margin:0;padding:0; }

@keyframes fadeUp      { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
@keyframes float-a     { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(40px,-30px) scale(1.08);} 66%{transform:translate(-20px,20px) scale(0.95);} }
@keyframes float-b     { 0%,100%{transform:translate(0,0) scale(1);} 40%{transform:translate(-35px,25px) scale(1.05);} 70%{transform:translate(25px,-15px) scale(0.97);} }
@keyframes pulse-ring  { 0%{transform:scale(1);opacity:.6;} 100%{transform:scale(1.5);opacity:0;} }
@keyframes scalePop    { from{opacity:0;transform:scale(.6);}to{opacity:1;transform:scale(1);} }
@keyframes checkDraw   { from{stroke-dashoffset:60;}to{stroke-dashoffset:0;} }
@keyframes circleDraw  { from{stroke-dashoffset:200;}to{stroke-dashoffset:0;} }
@keyframes barFill     { from{width:0;}to{width:var(--w);} }

/* ── Root ── */
.rp-root {
  display:flex;min-height:100vh;
  font-family:'DM Sans',sans-serif;background:#0D1B2A;
}

/* ── Left ── */
.rp-left {
  position:relative;width:52%;display:none;
  flex-direction:column;justify-content:space-between;
  padding:48px 52px;overflow:hidden;
  background:linear-gradient(145deg,#0A1520 0%,#0D1B2A 50%,#111f30 100%);
}
@media(min-width:1024px){ .rp-left{display:flex;} }

.rp-orb { position:absolute;border-radius:50%;pointer-events:none;filter:blur(60px); }
.rp-orb-1 { width:480px;height:480px;top:-100px;left:-120px;
  background:radial-gradient(circle,rgba(201,168,76,.18) 0%,transparent 70%);
  animation:float-a 14s ease-in-out infinite; }
.rp-orb-2 { width:360px;height:360px;bottom:-80px;right:-80px;
  background:radial-gradient(circle,rgba(41,82,140,.35) 0%,transparent 70%);
  animation:float-b 18s ease-in-out infinite; }

.rp-grid {
  position:absolute;inset:0;
  background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
  background-size:48px 48px;
}
.rp-grain { position:absolute;inset:0;opacity:.04;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:160px;pointer-events:none;
}

.rp-nav { position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;animation:fadeUp .6s ease both; }
.rp-logo { display:flex;align-items:center;gap:14px; }
.rp-logo-icon { width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#C9A84C 0%,#E8C97A 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1px rgba(201,168,76,.4),0 8px 20px rgba(201,168,76,.2); }
.rp-logo-name { font-size:.88rem;font-weight:700;color:#fff;letter-spacing:-.01em; }
.rp-logo-sub  { font-family:'DM Mono',monospace;font-size:.58rem;color:rgba(201,168,76,.65);letter-spacing:.2em;text-transform:uppercase;margin-top:4px; }
.rp-status { display:flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:99px;font-family:'DM Mono',monospace;font-size:.62rem;color:rgba(255,255,255,.5);letter-spacing:.1em; }
.rp-status-dot { position:relative;width:7px;height:7px; }
.rp-status-dot::before,.rp-status-dot::after { content:'';position:absolute;inset:0;border-radius:50%;background:#4ADE80; }
.rp-status-dot::after { animation:pulse-ring 1.8s ease-out infinite; }

.rp-hero { position:relative;z-index:2;animation:fadeUp .7s ease .1s both; }
.rp-kicker { display:inline-flex;align-items:center;gap:10px;margin-bottom:24px; }
.rp-kicker-line { height:1px;width:40px;background:linear-gradient(90deg,#C9A84C,transparent); }
.rp-kicker-text { font-family:'DM Mono',monospace;font-size:.65rem;color:#C9A84C;letter-spacing:.22em;text-transform:uppercase; }

.rp-headline { font-family:'DM Serif Display',serif;font-size:clamp(2.4rem,3.2vw,3.4rem);font-weight:400;color:#fff;line-height:1.08;letter-spacing:-.025em;margin-bottom:20px; }
.rp-headline em { font-style:italic;color:#C9A84C; }
.rp-desc { font-size:.95rem;color:rgba(255,255,255,.45);line-height:1.75;max-width:420px; }

/* Password tips card */
.rp-tips {
  margin-top:40px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
  border-radius:16px;padding:24px 28px;backdrop-filter:blur(12px);
}
.rp-tips-title { font-family:'DM Mono',monospace;font-size:.64rem;color:#C9A84C;letter-spacing:.18em;text-transform:uppercase;margin-bottom:16px; }
.rp-tip { display:flex;align-items:center;gap:12px;margin-bottom:12px; }
.rp-tip:last-child { margin-bottom:0; }
.rp-tip-dot { width:6px;height:6px;border-radius:50%;background:rgba(201,168,76,.4);flex-shrink:0; }
.rp-tip-dot.ok { background:#4ADE80; }
.rp-tip-text { font-size:.8rem;color:rgba(255,255,255,.5);line-height:1.4; }

/* ── Right ── */
.rp-right {
  flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:#F8F5EF;padding:40px 28px;position:relative;
}
.rp-right::before { content:'';position:absolute;inset:0;background-image:radial-gradient(rgba(13,27,42,.04) 1px,transparent 1px);background-size:24px 24px; }
.rp-arc  { position:absolute;top:-80px;right:-80px;width:240px;height:240px;border-radius:50%;border:1px solid rgba(201,168,76,.12);pointer-events:none; }
.rp-arc2 { position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;border:1px solid rgba(201,168,76,.08);pointer-events:none; }

.rp-form-wrap { width:100%;max-width:400px;position:relative;z-index:1;animation:fadeUp .6s ease .15s both; }

.rp-mb-brand { display:flex;flex-direction:column;align-items:center;margin-bottom:32px; }
@media(min-width:1024px){ .rp-mb-brand { display:none; } }
.rp-mb-icon { width:52px;height:52px;border-radius:14px;background:#0D1B2A;display:flex;align-items:center;justify-content:center;margin-bottom:12px;box-shadow:0 8px 24px rgba(13,27,42,.18); }
.rp-mb-name { font-size:.88rem;font-weight:700;color:#0D1B2A; }
.rp-mb-sub  { font-family:'DM Mono',monospace;font-size:.58rem;color:#C9A84C;letter-spacing:.2em;text-transform:uppercase;margin-top:5px; }

.rp-back { display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:600;color:#64748B;cursor:pointer;margin-bottom:28px;transition:color .18s;background:none;border:none;padding:0;font-family:'DM Sans',sans-serif; }
.rp-back:hover { color:#0D1B2A; }

.rp-icon-wrap { width:60px;height:60px;border-radius:16px;background:#0D1B2A;display:flex;align-items:center;justify-content:center;margin-bottom:22px;box-shadow:0 8px 24px rgba(13,27,42,.2); }
.rp-step-ind { display:flex;align-items:center;gap:10px;margin-bottom:16px; }
.rp-step-ind-dot { width:8px;height:8px;border-radius:50%;background:#C9A84C;box-shadow:0 0 0 3px rgba(201,168,76,.15); }
.rp-step-ind-text { font-family:'DM Mono',monospace;font-size:.64rem;color:#C9A84C;letter-spacing:.18em;text-transform:uppercase; }

.rp-title    { font-family:'DM Serif Display',serif;font-size:2rem;font-weight:400;color:#0D1B2A;line-height:1.1;letter-spacing:-.025em;margin-bottom:8px; }
.rp-title em { font-style:italic;color:#C9A84C; }
.rp-subtitle { font-size:.875rem;color:#64748B;line-height:1.6;margin-bottom:28px; }

/* Field */
.rp-field { margin-bottom:18px; }
.rp-field-label { display:block;font-size:.75rem;font-weight:600;color:#0D1B2A;letter-spacing:.04em;margin-bottom:8px; }

/* Strength bar */
.rp-strength { margin-top:10px; }
.rp-strength-label { font-size:.72rem;color:#64748B;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center; }
.rp-strength-track { height:4px;background:#E8EDF2;border-radius:4px;overflow:hidden; }
.rp-strength-fill  { height:100%;border-radius:4px;transition:width .35s ease,background .35s ease; }

/* Rules checklist */
.rp-rules { display:flex;flex-direction:column;gap:6px;margin-top:14px; }
.rp-rule  { display:flex;align-items:center;gap:8px;font-size:.76rem;color:#94A3B8;transition:color .2s; }
.rp-rule.ok { color:#22C55E; }
.rp-rule-dot { width:16px;height:16px;border-radius:50%;border:1.5px solid #E2E8F0;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s; }
.rp-rule.ok .rp-rule-dot { background:#22C55E;border-color:#22C55E; }

/* Error token */
.rp-token-error { display:flex;flex-direction:column;align-items:center;text-align:center;padding:16px 0; }
.rp-token-icon  { width:60px;height:60px;border-radius:16px;background:#FEF2F2;display:flex;align-items:center;justify-content:center;margin-bottom:20px; }
.rp-token-title { font-family:'DM Serif Display',serif;font-size:1.6rem;color:#0D1B2A;margin-bottom:8px; }
.rp-token-msg   { font-size:.875rem;color:#64748B;line-height:1.6;margin-bottom:24px;max-width:300px; }

/* Success */
.rp-success-wrap { display:flex;flex-direction:column;align-items:center;text-align:center;padding:8px 0;animation:scalePop .5s cubic-bezier(.34,1.56,.64,1) both; }
.rp-success-icon { width:72px;height:72px;margin-bottom:24px; }
.rp-success-icon circle { stroke-dasharray:200;stroke-dashoffset:200;animation:circleDraw .6s ease .1s both; }
.rp-success-icon path   { stroke-dasharray:60;stroke-dashoffset:60;animation:checkDraw .5s ease .5s both; }
.rp-success-title { font-family:'DM Serif Display',serif;font-size:1.75rem;font-weight:400;color:#0D1B2A;margin-bottom:10px; }
.rp-success-msg   { font-size:.875rem;color:#64748B;line-height:1.65;max-width:300px;margin-bottom:28px; }

.rp-foot { margin-top:28px;display:flex;align-items:center;justify-content:center;gap:14px;font-family:'DM Mono',monospace;font-size:.64rem;color:#CBD5E1;letter-spacing:.08em; }
.rp-foot-sep { width:3px;height:3px;border-radius:50%;background:#E2E8F0; }
`;

/* ─── Password strength helper ─── */
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  return score; // 0-4
}
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLORS = ['', '#EF4444', '#F59E0B', '#3B82F6', '#22C55E'];
const STRENGTH_WIDTHS = ['0%', '25%', '50%', '75%', '100%'];

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [showCf, setShowCf]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [done, setDone]             = useState(false);
  const [tokenValid, setTokenValid] = useState(true); // assume valid; API will reject if not

  const strength = getStrength(password);

  const rules = [
    { label: 'At least 8 characters',       ok: password.length >= 8 },
    { label: 'One uppercase letter',         ok: /[A-Z]/.test(password) },
    { label: 'One number',                   ok: /[0-9]/.test(password) },
    { label: 'One special character',        ok: /[^A-Za-z0-9]/.test(password) },
    { label: 'Passwords match',              ok: password && password === confirm },
  ];

  const canSubmit = rules.every(r => r.ok) && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password/', { token, password });
      setDone(true);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.detail || '';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        setTokenValid(false);
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '11px', background: '#FFFFFF',
      fontSize: '.92rem', fontFamily: '"DM Sans",sans-serif',
      transition: 'all .2s ease',
      '& fieldset': { borderColor: T.border, borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#CBD5E1' },
      '&.Mui-focused fieldset': { borderColor: T.navy, borderWidth: '1.5px' },
      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(13,27,42,.07)' },
    },
    '& .MuiOutlinedInput-input': { py: 1.5, px: 1.75, '&::placeholder': { color: '#CBD5E1', opacity: 1 } },
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-root">

        {/* ══ LEFT ══ */}
        <div className="rp-left">
          <div className="rp-orb rp-orb-1" />
          <div className="rp-orb rp-orb-2" />
          <div className="rp-grid" />
          <div className="rp-grain" />

          <nav className="rp-nav">
            <div className="rp-logo">
              <div className="rp-logo-icon"><GavelRounded sx={{ fontSize: 20, color: '#0D1B2A' }} /></div>
              <div>
                <div className="rp-logo-name">NTS online services opc pvt LTD</div>
                <div className="rp-logo-sub">Management System</div>
              </div>
            </div>
            <div className="rp-status"><span className="rp-status-dot" />SECURE</div>
          </nav>

          <div className="rp-hero">
            <div className="rp-kicker">
              <div className="rp-kicker-line" />
              <span className="rp-kicker-text">Password Reset</span>
            </div>
            <h1 className="rp-headline">Choose a strong<br /><em>new password.</em></h1>
            <p className="rp-desc">
              A strong password protects your clients, cases, and
              sensitive legal data from unauthorised access.
            </p>

            <div className="rp-tips">
              <div className="rp-tips-title">Password Guidelines</div>
              {[
                'Minimum 8 characters in length',
                'Mix uppercase & lowercase letters',
                'Include at least one number',
                'Add a special character (!, @, #…)',
                'Avoid using your username or common words',
              ].map((tip, i) => (
                <div className="rp-tip" key={i}>
                  <div className={`rp-tip-dot${strength >= Math.ceil((i + 1) * 4 / 5) ? ' ok' : ''}`} />
                  <div className="rp-tip-text">{tip}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '.64rem', color: 'rgba(255,255,255,.25)', letterSpacing: '.1em' }}>
            © {new Date().getFullYear()} NTS LEGAL PRO
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="rp-right">
          <div className="rp-arc" />
          <div className="rp-arc2" />

          <div className="rp-form-wrap">
            {/* Mobile brand */}
            <div className="rp-mb-brand">
              <div className="rp-mb-icon"><GavelRounded sx={{ fontSize: 24, color: T.gold }} /></div>
              <div className="rp-mb-name">NTS online services opc pvt LTD</div>
              <div className="rp-mb-sub">Management System</div>
            </div>

            <button className="rp-back" onClick={() => navigate('/login')}>
              <ArrowBackRounded sx={{ fontSize: 16 }} />Back to sign in
            </button>

            {/* ── Invalid / expired token ── */}
            {!tokenValid && (
              <div className="rp-token-error">
                <div className="rp-token-icon">
                  <LockResetRounded sx={{ fontSize: 28, color: '#EF4444' }} />
                </div>
                <h2 className="rp-token-title">Link expired</h2>
                <p className="rp-token-msg">
                  This reset link is invalid or has expired. Reset links are valid for <strong>30 minutes</strong>.
                </p>
                <Button
                  onClick={() => navigate('/forgot-password')}
                  sx={{
                    py: 1.4, px: 4, borderRadius: '11px',
                    fontFamily: '"DM Sans"', fontSize: '.9rem', fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg,#0D1B2A 0%,#1B2D41 100%)',
                    color: '#fff', boxShadow: '0 4px 14px rgba(13,27,42,.25)',
                    '&:hover': { background: 'linear-gradient(135deg,#1B2D41 0%,#243A52 100%)', transform: 'translateY(-1px)' },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  Request a new link
                </Button>
              </div>
            )}

            {/* ── Success ── */}
            {done && (
              <div className="rp-success-wrap">
                <svg className="rp-success-icon" viewBox="0 0 72 72" fill="none">
                  <circle cx="36" cy="36" r="30" stroke="#22C55E" strokeWidth="2.5" fill="rgba(34,197,94,0.08)" />
                  <path d="M22 36.5l10 10 18-20" stroke="#22C55E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h2 className="rp-success-title">Password updated</h2>
                <p className="rp-success-msg">
                  Your password has been changed successfully. You can now sign in with your new credentials.
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5, px: 5, borderRadius: '11px',
                    fontFamily: '"DM Sans"', fontSize: '.92rem', fontWeight: 700,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg,#0D1B2A 0%,#1B2D41 100%)',
                    color: '#fff', boxShadow: '0 4px 14px rgba(13,27,42,.25)',
                    '&:hover': { background: 'linear-gradient(135deg,#1B2D41 0%,#243A52 100%)', boxShadow: '0 8px 24px rgba(13,27,42,.32)', transform: 'translateY(-1px)' },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  Sign in to Chambers
                </Button>
              </div>
            )}

            {/* ── Form ── */}
            {tokenValid && !done && (
              <>
                <div className="rp-icon-wrap">
                  <LockResetRounded sx={{ fontSize: 28, color: T.gold }} />
                </div>
                <div className="rp-step-ind">
                  <div className="rp-step-ind-dot" />
                  <span className="rp-step-ind-text">Step 03 — New Password</span>
                </div>
                <h2 className="rp-title">Set new <em>password.</em></h2>
                <p className="rp-subtitle">Must be different from your previous password.</p>

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: '11px', border: '1px solid #FECACA', background: '#FEF2F2', fontFamily: '"DM Sans"', fontSize: '.83rem', py: .6, '& .MuiAlert-icon': { color: '#EF4444', fontSize: 20 } }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  {/* New password */}
                  <div className="rp-field">
                    <label className="rp-field-label">New password</label>
                    <TextField
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required fullWidth placeholder="••••••••••"
                      sx={fieldSx}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small"
                              sx={{ color: T.slateL, '&:hover': { color: T.navy, background: 'transparent' }, transition: 'color .18s' }}>
                              {showPw ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Strength bar */}
                    {password && (
                      <div className="rp-strength">
                        <div className="rp-strength-label">
                          <span>Strength</span>
                          <span style={{ color: STRENGTH_COLORS[strength], fontWeight: 600 }}>
                            {STRENGTH_LABELS[strength]}
                          </span>
                        </div>
                        <div className="rp-strength-track">
                          <div className="rp-strength-fill"
                            style={{ width: STRENGTH_WIDTHS[strength], background: STRENGTH_COLORS[strength] }} />
                        </div>
                      </div>
                    )}

                    {/* Rules */}
                    {password && (
                      <div className="rp-rules">
                        {rules.slice(0, 4).map((r, i) => (
                          <div className={`rp-rule${r.ok ? ' ok' : ''}`} key={i}>
                            <div className="rp-rule-dot">
                              {r.ok && <CheckRounded sx={{ fontSize: 10, color: '#fff' }} />}
                            </div>
                            {r.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="rp-field">
                    <label className="rp-field-label">Confirm password</label>
                    <TextField
                      type={showCf ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required fullWidth placeholder="••••••••••"
                      sx={{
                        ...fieldSx,
                        '& .MuiOutlinedInput-root': {
                          ...fieldSx['& .MuiOutlinedInput-root'],
                          '& fieldset': {
                            borderColor: confirm
                              ? (confirm === password ? '#22C55E' : '#EF4444')
                              : T.border,
                            borderWidth: confirm ? '1.5px' : '1px',
                          },
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowCf(!showCf)} edge="end" size="small"
                              sx={{ color: T.slateL, '&:hover': { color: T.navy, background: 'transparent' }, transition: 'color .18s' }}>
                              {showCf ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {confirm && confirm !== password && (
                      <div style={{ fontSize: '.74rem', color: '#EF4444', marginTop: 6 }}>
                        Passwords do not match
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit" fullWidth disabled={!canSubmit}
                    sx={{
                      py: 1.6, borderRadius: '11px',
                      fontFamily: '"DM Sans"', fontSize: '.92rem', fontWeight: 700,
                      textTransform: 'none', letterSpacing: '.01em',
                      background: 'linear-gradient(135deg,#0D1B2A 0%,#1B2D41 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 14px rgba(13,27,42,.25),inset 0 1px 0 rgba(255,255,255,.07)',
                      transition: 'all .22s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg,#1B2D41 0%,#243A52 100%)',
                        boxShadow: '0 8px 24px rgba(13,27,42,.32)',
                        transform: 'translateY(-1px)',
                      },
                      '&:active': { transform: 'translateY(0)' },
                      '&.Mui-disabled': { background: '#E2E8F0', color: '#94A3B8', boxShadow: 'none' },
                    }}
                  >
                    {loading
                      ? <CircularProgress size={20} sx={{ color: '#fff' }} />
                      : 'Update password'}
                  </Button>
                </Box>
              </>
            )}

            <div className="rp-foot">
              <span>256-BIT TLS</span>
              <span className="rp-foot-sep" />
              <span>JWT SECURE</span>
              <span className="rp-foot-sep" />
              <span>© {new Date().getFullYear()} NTS Legal Pro</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
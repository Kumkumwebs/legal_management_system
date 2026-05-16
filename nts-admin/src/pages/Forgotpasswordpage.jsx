import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { GavelRounded, ArrowBackRounded, MailOutlineRounded } from '@mui/icons-material';
import api from '../api/client';

/* ─── Shared design tokens (matches LoginPage) ─── */
const T = {
  navy:  '#0D1B2A',
  navy2: '#1B2D41',
  gold:  '#C9A84C',
  slate: '#64748B',
  slateL:'#94A3B8',
  border:'#E8EDF2',
  cream: '#F9F6F0',
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes float-a  { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(40px,-30px) scale(1.08);} 66%{transform:translate(-20px,20px) scale(0.95);} }
@keyframes float-b  { 0%,100%{transform:translate(0,0) scale(1);} 40%{transform:translate(-35px,25px) scale(1.05);} 70%{transform:translate(25px,-15px) scale(0.97);} }
@keyframes pulse-ring { 0%{transform:scale(1);opacity:.6;} 100%{transform:scale(1.5);opacity:0;} }
@keyframes checkDraw { from{stroke-dashoffset:60;} to{stroke-dashoffset:0;} }
@keyframes circleDraw { from{stroke-dashoffset:200;} to{stroke-dashoffset:0;} }
@keyframes scalePop { from{opacity:0;transform:scale(0.6);} to{opacity:1;transform:scale(1);} }

/* ── Root ── */
.fp-root {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: #0D1B2A;
}

/* ── Left panel ── */
.fp-left {
  position: relative;
  width: 52%;
  display: none;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 52px;
  overflow: hidden;
  background: linear-gradient(145deg,#0A1520 0%,#0D1B2A 50%,#111f30 100%);
}
@media(min-width:1024px){ .fp-left { display:flex; } }

.fp-orb {
  position:absolute; border-radius:50%;
  pointer-events:none; filter:blur(60px);
}
.fp-orb-1 { width:480px;height:480px;top:-100px;left:-120px;
  background:radial-gradient(circle,rgba(201,168,76,.18) 0%,transparent 70%);
  animation:float-a 14s ease-in-out infinite; }
.fp-orb-2 { width:360px;height:360px;bottom:-80px;right:-80px;
  background:radial-gradient(circle,rgba(41,82,140,.35) 0%,transparent 70%);
  animation:float-b 18s ease-in-out infinite; }

.fp-grid {
  position:absolute;inset:0;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
  background-size:48px 48px;
}
.fp-grain {
  position:absolute;inset:0;opacity:.04;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:160px;pointer-events:none;
}

.fp-nav {
  position:relative;z-index:2;
  display:flex;align-items:center;justify-content:space-between;
  animation:fadeUp .6s ease both;
}
.fp-logo { display:flex;align-items:center;gap:14px; }
.fp-logo-icon {
  width:42px;height:42px;border-radius:11px;
  background:linear-gradient(135deg,#C9A84C 0%,#E8C97A 100%);
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 0 1px rgba(201,168,76,.4),0 8px 20px rgba(201,168,76,.2);
}
.fp-logo-name { font-size:.88rem;font-weight:700;color:#fff;letter-spacing:-.01em; }
.fp-logo-sub {
  font-family:'DM Mono',monospace;
  font-size:.58rem;color:rgba(201,168,76,.65);
  letter-spacing:.2em;text-transform:uppercase;margin-top:4px;
}
.fp-status {
  display:flex;align-items:center;gap:8px;
  padding:6px 14px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
  border-radius:99px;font-family:'DM Mono',monospace;
  font-size:.62rem;color:rgba(255,255,255,.5);letter-spacing:.1em;
}
.fp-status-dot { position:relative;width:7px;height:7px; }
.fp-status-dot::before,.fp-status-dot::after {
  content:'';position:absolute;inset:0;border-radius:50%;background:#4ADE80;
}
.fp-status-dot::after { animation:pulse-ring 1.8s ease-out infinite; }

/* ── Left hero ── */
.fp-hero {
  position:relative;z-index:2;
  animation:fadeUp .7s ease .1s both;
}
.fp-kicker {
  display:inline-flex;align-items:center;gap:10px;margin-bottom:24px;
}
.fp-kicker-line {
  height:1px;width:40px;
  background:linear-gradient(90deg,#C9A84C,transparent);
}
.fp-kicker-text {
  font-family:'DM Mono',monospace;
  font-size:.65rem;color:#C9A84C;letter-spacing:.22em;text-transform:uppercase;
}
.fp-headline {
  font-family:'DM Serif Display',serif;
  font-size:clamp(2.4rem,3.2vw,3.4rem);
  font-weight:400;color:#fff;
  line-height:1.08;letter-spacing:-.025em;
  margin-bottom:20px;
}
.fp-headline em { font-style:italic;color:#C9A84C; }
.fp-desc {
  font-size:.95rem;color:rgba(255,255,255,.45);
  line-height:1.75;max-width:420px;
}

/* Steps list on the left */
.fp-steps {
  margin-top:40px;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  border-radius:16px;padding:24px 28px;
  backdrop-filter:blur(12px);
  display:flex;flex-direction:column;gap:20px;
}
.fp-step-item { display:flex;align-items:flex-start;gap:16px; }
.fp-step-num {
  width:30px;height:30px;border-radius:8px;
  background:rgba(201,168,76,.12);border:1px solid rgba(201,168,76,.25);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
  font-family:'DM Mono',monospace;font-size:.72rem;font-weight:500;color:#C9A84C;
}
.fp-step-title { font-size:.83rem;font-weight:600;color:#fff;margin-bottom:3px; }
.fp-step-desc  { font-size:.76rem;color:rgba(255,255,255,.4);line-height:1.5; }

/* ── Right panel ── */
.fp-right {
  flex:1;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  background:#F8F5EF;
  padding:40px 28px;position:relative;
}
.fp-right::before {
  content:'';position:absolute;inset:0;
  background-image:radial-gradient(rgba(13,27,42,.04) 1px,transparent 1px);
  background-size:24px 24px;
}
.fp-arc  { position:absolute;top:-80px;right:-80px;width:240px;height:240px;border-radius:50%;border:1px solid rgba(201,168,76,.12);pointer-events:none; }
.fp-arc2 { position:absolute;top:-40px;right:-40px;width:140px;height:140px;border-radius:50%;border:1px solid rgba(201,168,76,.08);pointer-events:none; }

.fp-form-wrap {
  width:100%;max-width:400px;
  position:relative;z-index:1;
  animation:fadeUp .6s ease .15s both;
}

/* Mobile brand */
.fp-mb-brand { display:flex;flex-direction:column;align-items:center;margin-bottom:32px; }
@media(min-width:1024px){ .fp-mb-brand { display:none; } }
.fp-mb-icon {
  width:52px;height:52px;border-radius:14px;background:#0D1B2A;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:12px;box-shadow:0 8px 24px rgba(13,27,42,.18);
}
.fp-mb-name { font-size:.88rem;font-weight:700;color:#0D1B2A; }
.fp-mb-sub  {
  font-family:'DM Mono',monospace;font-size:.58rem;
  color:#C9A84C;letter-spacing:.2em;text-transform:uppercase;margin-top:5px;
}

/* Back link */
.fp-back {
  display:inline-flex;align-items:center;gap:6px;
  font-size:.78rem;font-weight:600;color:#64748B;
  cursor:pointer;margin-bottom:28px;
  transition:color .18s;
  background:none;border:none;padding:0;
  font-family:'DM Sans',sans-serif;
}
.fp-back:hover { color:#0D1B2A; }

/* Icon area */
.fp-icon-wrap {
  width:60px;height:60px;border-radius:16px;
  background:#0D1B2A;
  display:flex;align-items:center;justify-content:center;
  margin-bottom:22px;
  box-shadow:0 8px 24px rgba(13,27,42,.2);
}

/* Step indicator */
.fp-step-ind {
  display:flex;align-items:center;gap:10px;margin-bottom:16px;
}
.fp-step-ind-dot { width:8px;height:8px;border-radius:50%;background:#C9A84C;box-shadow:0 0 0 3px rgba(201,168,76,.15); }
.fp-step-ind-text {
  font-family:'DM Mono',monospace;font-size:.64rem;
  color:#C9A84C;letter-spacing:.18em;text-transform:uppercase;
}

/* Heading */
.fp-title   { font-family:'DM Serif Display',serif;font-size:2rem;font-weight:400;color:#0D1B2A;line-height:1.1;letter-spacing:-.025em;margin-bottom:8px; }
.fp-title em { font-style:italic;color:#C9A84C; }
.fp-subtitle { font-size:.875rem;color:#64748B;line-height:1.6;margin-bottom:28px; }

/* Field */
.fp-field       { margin-bottom:20px; }
.fp-field-label { display:block;font-size:.75rem;font-weight:600;color:#0D1B2A;letter-spacing:.04em;margin-bottom:8px; }

/* Success state */
.fp-success-wrap {
  display:flex;flex-direction:column;align-items:center;
  text-align:center;padding:8px 0;
  animation:scalePop .5s cubic-bezier(.34,1.56,.64,1) both;
}
.fp-success-icon {
  width:72px;height:72px;margin-bottom:24px;
  animation:scalePop .5s cubic-bezier(.34,1.56,.64,1) both;
}
.fp-success-icon circle {
  stroke-dasharray:200;stroke-dashoffset:200;
  animation:circleDraw .6s ease .1s both;
}
.fp-success-icon path {
  stroke-dasharray:60;stroke-dashoffset:60;
  animation:checkDraw .5s ease .5s both;
}
.fp-success-title  { font-family:'DM Serif Display',serif;font-size:1.75rem;font-weight:400;color:#0D1B2A;margin-bottom:10px; }
.fp-success-msg    { font-size:.875rem;color:#64748B;line-height:1.65;max-width:320px;margin-bottom:28px; }
.fp-success-email  { display:inline-block;font-family:'DM Mono',monospace;font-size:.8rem;color:#0D1B2A;background:#F0EBE0;border:1px solid #E2D8C4;border-radius:8px;padding:6px 14px;margin-bottom:28px; }
.fp-resend {
  font-size:.78rem;color:#94A3B8;
  font-family:'DM Sans',sans-serif;
}
.fp-resend span { color:#C9A84C;cursor:pointer;font-weight:600; }
.fp-resend span:hover { color:#A07830; }

/* Footer */
.fp-foot {
  margin-top:28px;
  display:flex;align-items:center;justify-content:center;gap:14px;
  font-family:'DM Mono',monospace;font-size:.64rem;color:#CBD5E1;letter-spacing:.08em;
}
.fp-foot-sep { width:3px;height:3px;border-radius:50%;background:#E2E8F0; }
`;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [sent, setSent]         = useState(false);
  const [resendCD, setResendCD] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email });
      setSent(true);
      // 60-second resend cooldown
      setResendCD(60);
      const t = setInterval(() => {
        setResendCD(prev => { if (prev <= 1) { clearInterval(t); return 0; } return prev - 1; });
      }, 1000);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCD > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email });
      setResendCD(60);
      const t = setInterval(() => {
        setResendCD(prev => { if (prev <= 1) { clearInterval(t); return 0; } return prev - 1; });
      }, 1000);
    } catch {/* silent */} finally { setLoading(false); }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '11px', background: '#FFFFFF',
      fontSize: '0.92rem', fontFamily: '"DM Sans", sans-serif',
      transition: 'all 0.2s ease',
      '& fieldset': { borderColor: T.border, borderWidth: '1px' },
      '&:hover fieldset': { borderColor: '#CBD5E1' },
      '&.Mui-focused fieldset': { borderColor: T.navy, borderWidth: '1.5px' },
      '&.Mui-focused': { boxShadow: '0 0 0 4px rgba(13,27,42,0.07)' },
    },
    '& .MuiOutlinedInput-input': {
      py: 1.5, px: 1.75,
      '&::placeholder': { color: '#CBD5E1', opacity: 1 },
    },
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="fp-root">

        {/* ══ LEFT PANEL ══ */}
        <div className="fp-left">
          <div className="fp-orb fp-orb-1" />
          <div className="fp-orb fp-orb-2" />
          <div className="fp-grid" />
          <div className="fp-grain" />

          <nav className="fp-nav">
            <div className="fp-logo">
              <div className="fp-logo-icon">
                <GavelRounded sx={{ fontSize: 20, color: '#0D1B2A' }} />
              </div>
              <div>
                <div className="fp-logo-name">HP High Court</div>
                <div className="fp-logo-sub">Management System</div>
              </div>
            </div>
            <div className="fp-status">
              <span className="fp-status-dot" />
              SECURE
            </div>
          </nav>

          <div className="fp-hero">
            <div className="fp-kicker">
              <div className="fp-kicker-line" />
              <span className="fp-kicker-text">Account Recovery</span>
            </div>
            <h1 className="fp-headline">
              Back in your<br />
              <em>chamber shortly.</em>
            </h1>
            <p className="fp-desc">
              Regaining access is quick and secure — just follow
              the three steps on the right.
            </p>

            <div className="fp-steps">
              {[
                ['01', 'Enter your email',   'Provide the email linked to your HP HCMS account.'],
                ['02', 'Check your inbox',   'We\'ll send a secure reset link valid for 30 minutes.'],
                ['03', 'Set new password',   'Click the link and choose a strong new password.'],
              ].map(([n, title, desc]) => (
                <div className="fp-step-item" key={n}>
                  <div className="fp-step-num">{n}</div>
                  <div>
                    <div className="fp-step-title">{title}</div>
                    <div className="fp-step-desc">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* bottom spacer */}
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: '.64rem', color: 'rgba(255,255,255,.25)', letterSpacing: '.1em' }}>
            © {new Date().getFullYear()} NTS LEGAL PRO
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="fp-right">
          <div className="fp-arc" />
          <div className="fp-arc2" />

          <div className="fp-form-wrap">
            {/* Mobile brand */}
            <div className="fp-mb-brand">
              <div className="fp-mb-icon">
                <GavelRounded sx={{ fontSize: 24, color: T.gold }} />
              </div>
              <div className="fp-mb-name">HP High Court</div>
              <div className="fp-mb-sub">Management System</div>
            </div>

            {/* Back button */}
            <button className="fp-back" onClick={() => navigate('/login')}>
              <ArrowBackRounded sx={{ fontSize: 16 }} />
              Back to sign in
            </button>

            {!sent ? (
              /* ── FORM STATE ── */
              <>
                <div className="fp-icon-wrap">
                  <MailOutlineRounded sx={{ fontSize: 28, color: T.gold }} />
                </div>

                <div className="fp-step-ind">
                  <div className="fp-step-ind-dot" />
                  <span className="fp-step-ind-text">Step 01 — Recovery</span>
                </div>

                <h2 className="fp-title">Forgot your <em>password?</em></h2>
                <p className="fp-subtitle">
                  No worries. Enter your account email and we'll send you a secure reset link.
                </p>

                {error && (
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2.5, borderRadius: '11px',
                      border: '1px solid #FECACA', background: '#FEF2F2',
                      fontFamily: '"DM Sans"', fontSize: '.83rem', py: .6,
                      '& .MuiAlert-icon': { color: '#EF4444', fontSize: 20 },
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <div className="fp-field">
                    <label className="fp-field-label">Email address</label>
                    <TextField
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required fullWidth
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      sx={fieldSx}
                    />
                  </div>

                  <Button
                    type="submit" fullWidth disabled={loading}
                    sx={{
                      py: 1.6, borderRadius: '11px',
                      fontFamily: '"DM Sans"',
                      fontSize: '.92rem', fontWeight: 700,
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
                      : 'Send reset link'}
                  </Button>
                </Box>
              </>
            ) : (
              /* ── SUCCESS STATE ── */
              <div className="fp-success-wrap">
                {/* Animated check SVG */}
                <svg className="fp-success-icon" viewBox="0 0 72 72" fill="none">
                  <circle cx="36" cy="36" r="30" stroke="#22C55E" strokeWidth="2.5" fill="rgba(34,197,94,0.08)" />
                  <path d="M22 36.5l10 10 18-20" stroke="#22C55E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                <h2 className="fp-success-title">Check your inbox</h2>
                <p className="fp-success-msg">
                  We've sent a password reset link to:
                </p>
                <span className="fp-success-email">{email}</span>
                <p className="fp-success-msg" style={{ fontSize: '.82rem', marginBottom: 0 }}>
                  The link expires in <strong style={{ color: '#0D1B2A' }}>30 minutes</strong>.
                  Check your spam folder if you don't see it.
                </p>

                <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#E2E8F0,transparent)', width: '100%', margin: '24px 0' }} />

                <div className="fp-resend">
                  {resendCD > 0
                    ? <>Resend available in <span style={{ color: '#0D1B2A', cursor: 'default' }}>{resendCD}s</span></>
                    : <>Didn't receive it? <span onClick={handleResend}>Resend email</span></>}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="fp-foot" style={{ marginTop: sent ? 28 : 24 }}>
              <span>256-BIT TLS</span>
              <span className="fp-foot-sep" />
              <span>JWT SECURE</span>
              <span className="fp-foot-sep" />
              <span>© {new Date().getFullYear()} NTS Legal Pro</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
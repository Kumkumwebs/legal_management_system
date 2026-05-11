import { useState, useEffect } from 'react';
import apiClient from "../api/client";
import { requestPermission } from "../firebase";
import { CircularProgress } from '@mui/material';
import {
  PeopleRounded, GavelRounded, AttachMoneyRounded, EventRounded,
  TrendingUpRounded, BusinessRounded, VerifiedRounded,
  AssignmentTurnedInRounded, AccountBalanceWalletRounded,
  ArrowUpwardRounded, ScheduleRounded,
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { clientsAPI, casesAPI, paymentsAPI, firmsAPI, plansAPI, teamAPI } from '../api/services';

/* ─── role ──────────────────────────────────────── */
const user       = JSON.parse(localStorage.getItem('user') || '{}');
const role       = user?.role;
const isSuperAdmin = user?.is_superuser || role === 'super_admin';
const isAdmin    = role === 'admin';
const isLawyer   = role === 'lawyer';
const isStaff    = role === 'staff';

/* ─── tokens ─────────────────────────────────────── */
const T = {
  navy:   '#0D1B2A',
  navy2:  '#1B2D41',
  gold:   '#C9A84C',
  goldL:  '#E8C97A',
  cream:  '#F9F6F0',
  bg:     '#F2F4F7',
  white:  '#FFFFFF',
  slate:  '#64748B',
  border: '#E2E8F0',
};

const ROLE_META = {
  super_admin: { label: 'Super Admin',    color: '#C9A84C', bg: '#FFF8E7' },
  admin:       { label: 'Administrator',  color: '#2563EB', bg: '#EFF6FF' },
  lawyer:      { label: 'Lawyer',         color: '#059669', bg: '#ECFDF5' },
  staff:       { label: 'Staff',          color: '#7C3AED', bg: '#F5F3FF' },
};

/* ─── css animations ─────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes countUp {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.dash-root {
  font-family: 'DM Sans', sans-serif;
  background: ${T.bg};
  min-height: 100vh;
  padding-bottom: 48px;
}

/* Hero banner */
.hero {
  position: relative;
  overflow: hidden;
  padding: 32px 36px 28px;
  margin-bottom: 32px;
  animation: fadeUp 0.5s ease both;
}
.hero-bg {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, ${T.navy} 0%, ${T.navy2} 60%, #24405A 100%);
}
.hero-orb1 {
  position: absolute; top: -60px; right: -60px;
  width: 260px; height: 260px; border-radius: 50%;
  background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.hero-orb2 {
  position: absolute; bottom: -40px; left: 100px;
  width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
  pointer-events: none;
}
.hero-grid-line {
  position: absolute; inset: 0; opacity: 0.03;
  background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; }

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 10px; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase;
  color: ${T.gold};
  margin-bottom: 10px;
}
.hero-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: ${T.gold}; display: inline-block;
}

.hero-title {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem; font-weight: 400;
  color: #fff; margin: 0 0 6px;
  line-height: 1.15;
}
.hero-title em { font-style: italic; color: ${T.goldL}; }

.hero-sub {
  font-size: 0.82rem; color: rgba(255,255,255,0.5);
  margin: 0; font-weight: 400; max-width: 480px;
}

.hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 18px;
  padding: 5px 12px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 99px;
  font-size: 0.7rem; font-weight: 600; color: rgba(255,255,255,0.6);
}
.hero-badge-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #22C55E;
  box-shadow: 0 0 0 3px rgba(34,197,94,0.25);
}

/* Body */
.body { padding: 0 28px; }

/* Section label */
.section-label {
  font-size: 0.65rem; font-weight: 800; letter-spacing: 0.14em;
  text-transform: uppercase; color: ${T.slate};
  margin: 0 0 14px;
}

/* Stat grid */
.stat-grid { display: grid; gap: 16px; margin-bottom: 28px; }
.cols-4 { grid-template-columns: repeat(4, 1fr); }
.cols-3 { grid-template-columns: repeat(3, 1fr); }
.cols-2 { grid-template-columns: repeat(2, 1fr); }
.cols-1 { grid-template-columns: 1fr; }

@media (max-width: 960px) {
  .cols-4 { grid-template-columns: repeat(2, 1fr); }
  .cols-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 540px) {
  .cols-4, .cols-3, .cols-2 { grid-template-columns: 1fr; }
  .body { padding: 0 16px; }
  .hero { padding: 24px 16px 20px; }
}

/* Stat card */
.stat-card {
  background: ${T.white};
  border-radius: 16px;
  padding: 22px 22px 18px;
  border: 1px solid ${T.border};
  position: relative;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  animation: fadeUp 0.45s ease both;
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(13,27,42,0.09);
}
.stat-card-stripe {
  position: absolute; top: 0; left: 20px; right: 20px; height: 2px;
  border-radius: 0 0 3px 3px;
}
.stat-card-shine {
  position: absolute; top: -30px; right: -30px;
  width: 110px; height: 110px; border-radius: 50%;
  opacity: 0.06;
}
.stat-icon-wrap {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 16px;
}
.stat-label {
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: ${T.slate}; margin: 0 0 4px;
}
.stat-value {
  font-family: 'DM Mono', monospace;
  font-size: 2rem; font-weight: 500; color: ${T.navy};
  margin: 0; line-height: 1;
  animation: countUp 0.5s ease both;
}
.stat-trend {
  display: inline-flex; align-items: center; gap: 3px;
  font-size: 0.68rem; font-weight: 600; margin-top: 8px;
  padding: 2px 8px; border-radius: 99px;
}

/* Chart card */
.chart-card {
  background: ${T.white};
  border-radius: 16px;
  padding: 24px;
  border: 1px solid ${T.border};
  margin-bottom: 24px;
  animation: fadeUp 0.55s ease both;
}
.chart-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.chart-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1rem; font-weight: 400; color: ${T.navy}; margin: 0;
}
.chart-pill {
  font-size: 0.68rem; font-weight: 700; padding: 4px 12px;
  border-radius: 99px; background: ${T.cream}; color: ${T.slate};
  letter-spacing: 0.05em; text-transform: uppercase;
  border: 1px solid ${T.border};
}

/* Two-col layout */
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
@media (max-width: 720px) { .two-col { grid-template-columns: 1fr; } }

/* Cases list card */
.list-card {
  background: ${T.white};
  border-radius: 16px;
  padding: 22px 22px;
  border: 1px solid ${T.border};
  animation: fadeUp 0.6s ease both;
}
.list-card-title {
  font-family: 'DM Serif Display', serif;
  font-size: 1rem; font-weight: 400; color: ${T.navy};
  margin: 0 0 16px;
}
.list-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #F1F5F9;
}
.list-item:last-child { border-bottom: none; }
.list-bullet {
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; font-size: 0.65rem; font-weight: 800;
  color: #fff; background: ${T.navy};
}
.list-name {
  font-size: 0.83rem; font-weight: 500; color: ${T.navy};
  margin: 0;
}
.list-sub {
  font-size: 0.68rem; color: ${T.slate}; margin: 2px 0 0;
}

/* Activity card */
.activity-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid #F1F5F9;
}
.activity-item:last-child { border-bottom: none; }
.activity-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.activity-dot-track {
  position: relative;
}

/* Loading */
.dash-loading {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  background: rgba(242,244,247,0.75); z-index: 10; backdrop-filter: blur(3px);
}

/* Stagger delays */
.delay-0 { animation-delay: 0s; }
.delay-1 { animation-delay: 0.06s; }
.delay-2 { animation-delay: 0.12s; }
.delay-3 { animation-delay: 0.18s; }
`;

/* ══════════════════════════════════════════════════
   SMALL COMPONENTS
══════════════════════════════════════════════════ */

function Hero({ eyebrow, title, italic, sub }) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="hero">
      <div className="hero-bg" />
      <div className="hero-orb1" />
      <div className="hero-orb2" />
      <div className="hero-grid-line" />
      <div className="hero-content" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="hero-eyebrow">
            <span className="hero-dot" /> {eyebrow}
          </div>
          <h1 className="hero-title">
            {title} {italic && <em>{italic}</em>}
          </h1>
          <p className="hero-sub">{sub}</p>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {date} · {time}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, bg, trend, delay = 0 }) {
  return (
    <div className={`stat-card delay-${delay}`}>
      <div className="stat-card-stripe" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="stat-card-shine" style={{ background: color }} />
      <div className="stat-icon-wrap" style={{ background: bg }}>
        <span style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</span>
      </div>
      <p className="stat-label">{title}</p>
      <p className="stat-value">{value}</p>
      {trend && (
        <span className="stat-trend" style={{ background: `${color}18`, color }}>
          <ArrowUpwardRounded style={{ fontSize: 10 }} /> {trend}
        </span>
      )}
    </div>
  );
}

function ChartCard({ title, pill, children }) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <p className="chart-title">{title}</p>
        {pill && <span className="chart-pill">{pill}</span>}
      </div>
      {children}
    </div>
  );
}

function ListCard({ title, items, emptyText = 'No items yet' }) {
  return (
    <div className="list-card">
      <p className="list-card-title">{title}</p>
      {items.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: T.slate, textAlign: 'center', padding: '20px 0' }}>{emptyText}</p>
      ) : items.map((item, i) => (
        <div className="list-item" key={item.id || i}>
          <div className="list-bullet" style={{
            background: `hsl(${(item.id || i) * 47 % 360},35%,28%)`,
          }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div>
            <p className="list-name">{item.primary}</p>
            {item.secondary && <p className="list-sub">{item.secondary}</p>}
          </div>
          {item.badge && (
            <span style={{
              marginLeft: 'auto', fontSize: '0.65rem', fontWeight: 700,
              padding: '2px 8px', borderRadius: 99,
              background: item.badgeBg || '#F1F5F9',
              color: item.badgeColor || T.slate,
            }}>
              {item.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

const TOOLTIP_STYLE = {
  contentStyle: {
    background: T.navy, border: 'none', borderRadius: 10,
    color: '#fff', fontSize: 12, fontFamily: 'DM Sans', padding: '8px 14px',
  },
  labelStyle: { color: 'rgba(255,255,255,0.55)', marginBottom: 2 },
  itemStyle: { color: '#fff' },
  cursor: { fill: 'rgba(13,27,42,0.04)' },
};

/* ══════════════════════════════════════════════════
   DASHBOARD VIEWS
══════════════════════════════════════════════════ */

function SuperAdminDash({ stats }) {
  const barData = [
    { name: 'Firms', value: stats.firms },
    { name: 'Plans', value: stats.plans },
    { name: 'Team', value: stats.team },
  ];

  const rm = ROLE_META.super_admin;

  return (
    <>
      <Hero
        eyebrow="Super Admin · Control Panel"
        title="Platform"
        italic="Overview"
        sub="Manage all firms, subscription plans, and team members across the platform"
      />
      <div className="body">
        <p className="section-label">Platform Metrics</p>
        <div className="stat-grid cols-3">
          <StatCard title="Total Firms"    value={stats.firms}  icon={<BusinessRounded style={{ fontSize: 20 }} />}  color="#C9A84C" bg="#FFF8E7" trend="Active" delay={0} />
          <StatCard title="Active Plans"   value={stats.plans}  icon={<VerifiedRounded style={{ fontSize: 20 }} />}   color="#2563EB" bg="#EFF6FF" delay={1} />
          <StatCard title="Team Members"   value={stats.team}   icon={<PeopleRounded style={{ fontSize: 20 }} />}    color="#7C3AED" bg="#F5F3FF" delay={2} />
        </div>

        <ChartCard title="Platform At a Glance" pill="Live">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: T.slate, fontFamily: 'DM Sans' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" fill={T.gold} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function AdminDash({ data }) {
  const totalRevenue = (data.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayHearings = (data.cases || []).filter(c => c.next_hearing === today).length;
  const pending = (data.payments || []).filter(p => p.status === 'pending').length;

  const areaData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 5 + i);
    const month = d.toLocaleString('default', { month: 'short' });
    const mCases = (data.cases || []).filter(c => c.created_at?.slice(5, 7) === String(d.getMonth() + 1).padStart(2, '0')).length;
    const mPay   = (data.payments || []).filter(p => p.created_at?.slice(5, 7) === String(d.getMonth() + 1).padStart(2, '0'))
                    .reduce((s, p) => s + Number(p.amount || 0), 0);
    return { month, cases: mCases, revenue: mPay };
  });

  const recentCases = (data.cases || []).slice(0, 5).map(c => ({
    id: c.id,
    primary: c.title,
    secondary: c.client_name || c.status,
    badge: c.status,
    badgeBg: c.status === 'active' ? '#ECFDF5' : '#F1F5F9',
    badgeColor: c.status === 'active' ? '#059669' : T.slate,
  }));

  return (
    <>
      <Hero
        eyebrow="Administrator · Firm Overview"
        title="Good to see you,"
        italic={`${user?.username || 'Admin'}`}
        sub="Here's your firm's complete activity snapshot for today"
      />
      <div className="body">
        <p className="section-label">Key Metrics</p>
        <div className="stat-grid cols-4">
          <StatCard title="Total Clients"     value={data.clients?.length || 0}  icon={<PeopleRounded style={{ fontSize: 20 }} />}               color="#2563EB" bg="#EFF6FF"  delay={0} />
          <StatCard title="Active Cases"      value={data.cases?.length || 0}    icon={<GavelRounded style={{ fontSize: 20 }} />}                color="#7C3AED" bg="#F5F3FF"  delay={1} />
          <StatCard title="Revenue"           value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={<AccountBalanceWalletRounded style={{ fontSize: 20 }} />} color="#059669" bg="#ECFDF5" delay={2} />
          <StatCard title="Today's Hearings"  value={todayHearings}              icon={<EventRounded style={{ fontSize: 20 }} />}                color="#C9A84C" bg="#FFF8E7"  delay={3} />
        </div>

        <div className="two-col">
          <ChartCard title="Revenue Trend" pill="6 Months">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#059669" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fill="url(#rev)" dot={{ fill: '#059669', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Cases Filed" pill="6 Months">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={areaData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: T.slate }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="cases" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="two-col">
          <ListCard title="Recent Cases" items={recentCases} emptyText="No cases yet" />

          <div className="list-card">
            <p className="list-card-title">Quick Stats</p>
            {[
              { label: 'Pending Payments', val: pending,                      color: '#EF4444', bg: '#FEF2F2' },
              { label: 'Completed Cases',  val: (data.cases || []).filter(c => c.status === 'closed').length, color: '#059669', bg: '#ECFDF5' },
              { label: 'New Clients (total)', val: data.clients?.length || 0, color: '#2563EB', bg: '#EFF6FF' },
            ].map((s, i) => (
              <div className="list-item" key={i}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                <p className="list-name" style={{ flex: 1 }}>{s.label}</p>
                <span style={{
                  fontSize: '0.78rem', fontWeight: 700,
                  padding: '2px 10px', borderRadius: 99,
                  background: s.bg, color: s.color,
                }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function LawyerDash({ data }) {
  const today = new Date().toISOString().slice(0, 10);
  const todayHearings = (data.cases || []).filter(c => c.next_hearing === today).length;
  const activeCases   = (data.cases || []).filter(c => c.status === 'active').length;

  const upcoming = (data.cases || [])
    .filter(c => c.next_hearing && c.next_hearing >= today)
    .sort((a, b) => a.next_hearing?.localeCompare(b.next_hearing))
    .slice(0, 5)
    .map(c => ({
      id: c.id,
      primary: c.title,
      secondary: c.next_hearing ? `Hearing: ${new Date(c.next_hearing).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'No hearing scheduled',
      badge: c.status,
      badgeBg: c.status === 'active' ? '#ECFDF5' : '#F1F5F9',
      badgeColor: c.status === 'active' ? '#059669' : T.slate,
    }));

  return (
    <>
      <Hero
        eyebrow="Lawyer · My Workspace"
        title="Your cases,"
        italic="at a glance"
        sub="Stay on top of active cases and upcoming hearings"
      />
      <div className="body">
        <p className="section-label">Workload Summary</p>
        <div className="stat-grid cols-2">
          <StatCard title="My Cases"        value={data.cases?.length || 0} icon={<GavelRounded style={{ fontSize: 20 }} />}    color="#7C3AED" bg="#F5F3FF" delay={0} />
          <StatCard title="Active Cases"    value={activeCases}             icon={<AssignmentTurnedInRounded style={{ fontSize: 20 }} />} color="#059669" bg="#ECFDF5" delay={1} />
        </div>
        <div className="stat-grid cols-2" style={{ marginTop: -12 }}>
          <StatCard title="Today's Hearings" value={todayHearings}          icon={<EventRounded style={{ fontSize: 20 }} />}     color="#C9A84C" bg="#FFF8E7" delay={2} />
          <StatCard title="Total Assigned"   value={data.cases?.length || 0} icon={<ScheduleRounded style={{ fontSize: 20 }} />} color="#2563EB" bg="#EFF6FF" delay={3} />
        </div>

        <div className="two-col">
          <ListCard title="Upcoming Hearings" items={upcoming} emptyText="No upcoming hearings" />
          <ListCard
            title="Recent Cases"
            items={(data.cases || []).slice(0, 5).map(c => ({
              id: c.id,
              primary: c.title,
              secondary: c.client_name || `Case #${c.id}`,
              badge: c.status,
              badgeBg: '#F1F5F9', badgeColor: T.slate,
            }))}
            emptyText="No cases assigned"
          />
        </div>
      </div>
    </>
  );
}

function StaffDash({ data }) {
  const total   = (data.payments || []).length;
  const paid    = (data.payments || []).filter(p => p.status === 'paid').length;
  const pending = (data.payments || []).filter(p => p.status === 'pending').length;
  const revenue = (data.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);

  const recentPayments = (data.payments || []).slice(0, 5).map(p => ({
    id: p.id,
    primary: p.client_name || `Payment #${p.id}`,
    secondary: `₹${Number(p.amount || 0).toLocaleString('en-IN')}`,
    badge: p.status,
    badgeBg: p.status === 'paid' ? '#ECFDF5' : '#FEF9C3',
    badgeColor: p.status === 'paid' ? '#059669' : '#B45309',
  }));

  return (
    <>
      <Hero
        eyebrow="Staff · Operations"
        title="Payment"
        italic="Operations"
        sub="Track and manage payment records and daily operations"
      />
      <div className="body">
        <p className="section-label">Payment Overview</p>
        <div className="stat-grid cols-2">
          <StatCard title="Total Payments" value={total}   icon={<AttachMoneyRounded style={{ fontSize: 20 }} />}       color="#7C3AED" bg="#F5F3FF" delay={0} />
          <StatCard title="Total Revenue"  value={`₹${revenue.toLocaleString('en-IN')}`} icon={<AccountBalanceWalletRounded style={{ fontSize: 20 }} />} color="#059669" bg="#ECFDF5" delay={1} />
        </div>
        <div className="stat-grid cols-2" style={{ marginTop: -12 }}>
          <StatCard title="Paid"           value={paid}    icon={<VerifiedRounded style={{ fontSize: 20 }} />}          color="#2563EB" bg="#EFF6FF" delay={2} />
          <StatCard title="Pending"        value={pending} icon={<ScheduleRounded style={{ fontSize: 20 }} />}          color="#EF4444" bg="#FEF2F2" delay={3} />
        </div>

        <ListCard title="Recent Payments" items={recentPayments} emptyText="No payments recorded" />
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [data, setData]           = useState({ clients: [], cases: [], payments: [] });
  const [adminStats, setAdminStats] = useState({ firms: 0, plans: 0, team: 0 });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (isSuperAdmin) {
          const [f, p, t] = await Promise.all([firmsAPI.getAll(), plansAPI.getAll(), teamAPI.getAll()]);
          setAdminStats({
            firms: (f.data?.results ?? f.data ?? []).length,
            plans: (p.data?.results ?? p.data ?? []).length,
            team:  (t.data?.results ?? t.data ?? []).length,
          });
        } else if (isAdmin) {
          const [c, cs, p] = await Promise.all([clientsAPI.getAll(), casesAPI.getAll(), paymentsAPI.getAll()]);
          setData({
            clients:  c.data?.results ?? c.data ?? [],
            cases:    cs.data?.results ?? cs.data ?? [],
            payments: p.data?.results ?? p.data ?? [],
          });
        } else if (isLawyer) {
          const cs = await casesAPI.getAll();
          setData({ cases: cs.data?.results ?? cs.data ?? [] });
        } else if (isStaff) {
          const p = await paymentsAPI.getAll();
          setData({ payments: p.data?.results ?? p.data ?? [] });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    const setupFCM = async () => {
      try {
        if (localStorage.getItem('fcm_saved')) return;
        const token = await requestPermission();
        if (!token) return;
        await apiClient.post('/notifications/save-token/', { token });
        localStorage.setItem('fcm_saved', 'true');
      } catch (err) {
        console.error('FCM error:', err);
      }
    };
    setupFCM();
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="dash-root">
        {loading ? (
          <div className="dash-loading">
            <div style={{ textAlign: 'center' }}>
              <CircularProgress sx={{ color: T.gold }} size={36} />
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.8rem', color: T.slate, marginTop: 12 }}>Loading your dashboard…</p>
            </div>
          </div>
        ) : (
          <>
            {isSuperAdmin && <SuperAdminDash stats={adminStats} />}
            {isAdmin      && <AdminDash data={data} />}
            {isLawyer     && <LawyerDash data={data} />}
            {isStaff      && <StaffDash data={data} />}
          </>
        )}
      </div>
    </>
  );
}
import { useState, useEffect } from 'react';
import apiClient from "../api/client";
import { requestPermission, onMessageListener } from "../firebase";
import { Box, Grid, CircularProgress } from '@mui/material';
import {
  PeopleRounded, GavelRounded, AttachMoneyRounded, EventRounded,
} from '@mui/icons-material';

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';

import {
  clientsAPI, casesAPI, paymentsAPI,
  firmsAPI, plansAPI, teamAPI
} from '../api/services';

import { PageHeader, SectionCard } from './UI';


/* ─── USER ROLE ───────────────── */
const user = JSON.parse(localStorage.getItem("user") || "{}");
const role = user?.role;
const isSuperAdmin = user?.is_superuser || role === "super_admin";
const isAdmin = role === "admin";
const isLawyer = role === "lawyer";
const isStaff = role === "staff";

/* ─── STYLES ───────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  .dash-root * { box-sizing: border-box; }

  .dash-root {
    font-family: 'DM Sans', sans-serif;
    background: #F5F4F0;
    min-height: 100vh;
    padding: 0 0 40px 0;
  }

  .dash-header {
    background: #0D1B2A;
    padding: 28px 32px 24px;
    margin-bottom: 32px;
    position: relative;
    overflow: hidden;
  }

  .dash-header::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    pointer-events: none;
  }

  .dash-header::after {
    content: '';
    position: absolute;
    bottom: -30px; left: 120px;
    width: 140px; height: 140px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
    pointer-events: none;
  }

  .dash-header-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin: 0 0 6px;
  }

  .dash-header-title {
    font-size: 26px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 4px;
    line-height: 1.2;
  }

  .dash-header-sub {
    font-size: 13px;
    color: rgba(255,255,255,0.45);
    margin: 0;
    font-weight: 400;
  }

  .dash-body {
    padding: 0 32px;
  }

  .stat-grid {
    display: grid;
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .stat-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .stat-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .stat-grid-1 { grid-template-columns: 1fr; }

  @media (max-width: 900px) {
    .stat-grid-4, .stat-grid-3 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 540px) {
    .stat-grid-4, .stat-grid-3, .stat-grid-2 { grid-template-columns: 1fr; }
    .dash-body { padding: 0 16px; }
    .dash-header { padding: 20px 16px 18px; }
  }

  .stat-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 22px 24px;
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(0,0,0,0.05);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.07);
  }

  .stat-card-accent {
    position: absolute;
    top: 0; right: 0;
    width: 80px; height: 80px;
    border-radius: 0 14px 0 80px;
    opacity: 0.07;
  }

  .stat-card-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
    font-size: 18px;
  }

  .stat-card-icon svg {
    width: 18px; height: 18px;
  }

  .stat-card-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #9A9A96;
    margin: 0 0 6px;
  }

  .stat-card-value {
    font-size: 30px;
    font-weight: 600;
    color: #0D1B2A;
    margin: 0;
    font-family: 'DM Mono', monospace;
    line-height: 1;
  }

  /* Color variants */
  .ic-blue { background: #EBF2FF; color: #2B66D1; }
  .ic-blue .stat-card-accent { background: #2B66D1; }

  .ic-green { background: #EAFAF1; color: #1A8A4A; }
  .ic-green .stat-card-accent { background: #1A8A4A; }

  .ic-amber { background: #FFF8EB; color: #C47F17; }
  .ic-amber .stat-card-accent { background: #C47F17; }

  .ic-purple { background: #F0EDFE; color: #5B45C7; }
  .ic-purple .stat-card-accent { background: #5B45C7; }

  .ic-rose { background: #FEF0F3; color: #C1395A; }
  .ic-rose .stat-card-accent { background: #C1395A; }

  .ic-teal { background: #E6F9F5; color: #0E8A72; }
  .ic-teal .stat-card-accent { background: #0E8A72; }

  /* Chart section */
  .chart-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 24px;
    border: 1px solid rgba(0,0,0,0.05);
    margin-bottom: 24px;
  }

  .chart-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .chart-card-title {
    font-size: 14px;
    font-weight: 600;
    color: #0D1B2A;
    margin: 0;
    letter-spacing: 0.2px;
  }

  .chart-card-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 20px;
    background: #F5F4F0;
    color: #6B6B67;
    letter-spacing: 0.5px;
  }

  /* Cases list */
  .cases-card {
    background: #ffffff;
    border-radius: 14px;
    padding: 22px 24px;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .cases-card-title {
    font-size: 14px;
    font-weight: 600;
    color: #0D1B2A;
    margin: 0 0 16px;
  }

  .case-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #F2F1EE;
  }

  .case-item:last-child { border-bottom: none; }

  .case-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #0D1B2A;
    flex-shrink: 0;
  }

  .case-name {
    font-size: 13px;
    color: #2A2A28;
    font-weight: 500;
    margin: 0;
  }

  /* Loading overlay */
  .dash-loading {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(245,244,240,0.7);
    z-index: 10;
  }
`;

/* ─── MAIN COMPONENT ───────────────── */
export default function DashboardPage() {

  const [data, setData] = useState({
    clients: [],
    cases: [],
    payments: []
  });

  const [adminStats, setAdminStats] = useState({
    firms: 0,
    plans: 0,
    team: 0
  });

  const [loading, setLoading] = useState(true);

  /* ─── FETCH DATA ───────────────── */

  useEffect(() => {

    const fetchData = async () => {
      try {

        // 🔥 SUPER ADMIN
        if (isSuperAdmin) {
          const [f, p, t] = await Promise.all([
            firmsAPI.getAll(),
            plansAPI.getAll(),
            teamAPI.getAll()
          ]);

          setAdminStats({
            firms: (f.data?.results ?? f.data ?? []).length,
            plans: (p.data?.results ?? p.data ?? []).length,
            team: (t.data?.results ?? t.data ?? []).length,
          });

          return;
        }

        // 🔥 ADMIN
        if (isAdmin) {
          const [c, cs, p] = await Promise.all([
            clientsAPI.getAll(),
            casesAPI.getAll(),
            paymentsAPI.getAll(),
          ]);

          setData({
            clients: c.data?.results ?? c.data ?? [],
            cases: cs.data?.results ?? cs.data ?? [],
            payments: p.data?.results ?? p.data ?? [],
          });
        }

        // 🔥 LAWYER
        if (isLawyer) {
          const cs = await casesAPI.getAll();
          setData({
            cases: cs.data?.results ?? cs.data ?? []
          });
        }

        // 🔥 STAFF
        if (isStaff) {
          const p = await paymentsAPI.getAll();
          setData({
            payments: p.data?.results ?? p.data ?? []
          });
        }

      } catch (err) {
        console.error("DATA ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

 useEffect(() => {

  const setupFCM = async () => {
    try {
      // 🚫 prevent multiple runs
      const alreadySaved = localStorage.getItem("fcm_saved");

      if (alreadySaved) {
        console.log("⚠️ Token already saved, skipping...");
        return;
      }

      const token = await requestPermission();

      console.log("🔥 FCM TOKEN:", token);

      if (!token) return;

      await apiClient.post("/notifications/save-token/", {
        token: token,
      });

      localStorage.setItem("fcm_saved", "true");  // ✅ lock

      console.log("✅ Token saved to backend");

    } catch (err) {
      console.error("❌ TOKEN SAVE ERROR:", err);
    }
  };

  setupFCM();

}, []);
  
  const totalRevenue = (data.payments || []).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const today = new Date().toISOString().slice(0, 10);

  const todayHearings = (data.cases || []).filter(
    (c) => c.next_hearing === today
  ).length;

  const barData = [
    { name: 'Clients', count: (data.clients || []).length },
    { name: 'Cases', count: (data.cases || []).length },
    { name: 'Payments', count: (data.payments || []).length },
  ];

  /* ─── RETURN UI ───────────────── */
  return (
    <>
      <style>{styles}</style>
      <div className="dash-root">

        {/* 🔥 SUPER ADMIN */}
        {isSuperAdmin && (
          <>
            <DashHeader
              label="Super Admin"
              title="Control Panel"
              sub="Manage firms, subscription plans & team members"
            />
            <div className="dash-body">
              <div className="stat-grid stat-grid-3">
                <StatCard title="Total Firms" value={adminStats.firms} icon={<PeopleRounded />} colorClass="ic-blue" />
                <StatCard title="Active Plans" value={adminStats.plans} icon={<AttachMoneyRounded />} colorClass="ic-green" />
                <StatCard title="Team Members" value={adminStats.team} icon={<PeopleRounded />} colorClass="ic-purple" />
              </div>
            </div>
          </>
        )}

        {/* 🔥 ADMIN */}
        {isAdmin && (
          <>
            <DashHeader
              label="Admin"
              title="Firm Overview"
              sub="Complete snapshot of your firm's activity"
            />
            <div className="dash-body">
              <div className="stat-grid stat-grid-4">
                <StatCard title="Clients" value={data.clients.length} icon={<PeopleRounded />} colorClass="ic-blue" />
                <StatCard title="Cases" value={data.cases.length} icon={<GavelRounded />} colorClass="ic-purple" />
                <StatCard title="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={<AttachMoneyRounded />} colorClass="ic-green" />
                <StatCard title="Today's Hearings" value={todayHearings} icon={<EventRounded />} colorClass="ic-amber" />
              </div>
              <ChartSection barData={barData} />
            </div>
          </>
        )}

        {/* 🔥 LAWYER */}
        {isLawyer && (
          <>
            <DashHeader
              label="Lawyer"
              title="My Workspace"
              sub="Your active cases and upcoming hearings"
            />
            <div className="dash-body">
              <div className="stat-grid stat-grid-2">
                <StatCard title="My Cases" value={data.cases.length} icon={<GavelRounded />} colorClass="ic-purple" />
                <StatCard title="Today's Hearings" value={todayHearings} icon={<EventRounded />} colorClass="ic-amber" />
              </div>
              <div className="cases-card">
                <p className="cases-card-title">Recent Cases</p>
                {data.cases.slice(0, 5).map(c => (
                  <div className="case-item" key={c.id}>
                    <div className="case-dot" />
                    <p className="case-name">{c.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 🔥 STAFF */}
        {isStaff && (
          <>
            <DashHeader
              label="Staff"
              title="Operations"
              sub="Payment records and daily operations"
            />
            <div className="dash-body">
              <div className="stat-grid stat-grid-1">
                <StatCard title="Total Payments" value={data.payments.length} icon={<AttachMoneyRounded />} colorClass="ic-teal" />
              </div>
            </div>
          </>
        )}

        {loading && (
          <div className="dash-loading">
            <CircularProgress sx={{ color: '#0D1B2A' }} />
          </div>
        )}

      </div>
    </>
  );
}

/* ─── SMALL COMPONENTS ───────────────── */

const DashHeader = ({ label, title, sub }) => (
  <div className="dash-header">
    <p className="dash-header-label">{label}</p>
    <p className="dash-header-title">{title}</p>
    <p className="dash-header-sub">{sub}</p>
  </div>
);

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <div className="stat-card-accent" />
    <div className="stat-card-icon">{icon}</div>
    <p className="stat-card-label">{title}</p>
    <p className="stat-card-value">{value}</p>
  </div>
);

const ChartSection = ({ barData }) => (
  <div className="chart-card">
    <div className="chart-card-header">
      <p className="chart-card-title">Overview</p>
      <span className="chart-card-badge">This Month</span>
    </div>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={barData} barSize={36}>
        <CartesianGrid strokeDasharray="3 3" stroke="#EDECE9" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#9A9A96', fontFamily: 'DM Sans' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#9A9A96', fontFamily: 'DM Sans' }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(13,27,42,0.04)' }}
          contentStyle={{
            background: '#0D1B2A',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontSize: 13,
            fontFamily: 'DM Sans',
            padding: '8px 14px',
          }}
          labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}
          itemStyle={{ color: '#fff' }}
        />
        <Bar dataKey="count" fill="#0D1B2A" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
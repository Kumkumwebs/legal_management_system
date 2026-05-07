import { useEffect, useState } from "react";
import { plansAPI } from "../api/services";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

/* ─── INJECT STYLES ─────────────────────────────────────── */
const injectStyles = () => {
    if (document.getElementById("admin-plans-styles")) return;
    const el = document.createElement("style");
    el.id = "admin-plans-styles";
    el.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .ap-root {
            font-family: 'DM Sans', sans-serif;
            background: #F4F3EF;
            min-height: 100vh;
            padding: 36px 32px 72px;
            position: relative;
        }

        /* Thin gold top bar */
        .ap-root::before {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: linear-gradient(90deg, #0D1B2A, #C9A84C 50%, #0D1B2A);
            z-index: 999;
        }

        /* ── Header ── */
        .ap-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            margin-bottom: 36px;
            flex-wrap: wrap;
            gap: 16px;
        }

        .ap-eyebrow {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .ap-eyebrow-line {
            width: 24px; height: 1.5px;
            background: #C9A84C;
            border-radius: 2px;
        }

        .ap-eyebrow-label {
            font-size: 0.67rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #C9A84C;
        }

        .ap-title {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.6rem, 2.8vw, 2.2rem);
            font-weight: 600;
            color: #0D1B2A;
            margin: 0 0 4px;
            line-height: 1.1;
            letter-spacing: -0.02em;
        }

        .ap-title em {
            font-style: italic;
            font-weight: 400;
            color: #C9A84C;
        }

        .ap-subtitle {
            font-size: 0.8rem;
            color: #8A8A80;
            margin: 0;
        }

        /* Create button */
        .ap-create-btn {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            padding: 12px 22px;
            background: #0D1B2A;
            color: #FAFAF8;
            border: none;
            border-radius: 12px;
            font-family: 'DM Sans', sans-serif;
            font-size: 0.82rem;
            font-weight: 600;
            letter-spacing: 0.03em;
            cursor: pointer;
            transition: all 0.18s ease;
            white-space: nowrap;
            flex-shrink: 0;
        }

        .ap-create-btn:hover {
            background: #162840;
            transform: translateY(-1px);
            box-shadow: 0 8px 24px rgba(13,27,42,0.22);
        }

        .ap-create-btn:active { transform: scale(0.98); }

        .ap-btn-icon {
            width: 20px; height: 20px;
            border-radius: 6px;
            background: rgba(201,168,76,0.2);
            display: flex; align-items: center; justify-content: center;
            font-size: 16px;
            color: #C9A84C;
            line-height: 1;
            flex-shrink: 0;
        }

        /* ── Plan Card ── */
        .ap-card {
            background: #fff;
            border-radius: 18px;
            border: 1px solid rgba(13,27,42,0.07);
            overflow: hidden;
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: box-shadow 0.22s ease, transform 0.22s ease;
            animation: ap-rise 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }

        .ap-card:hover {
            box-shadow: 0 18px 48px rgba(13,27,42,0.1);
            transform: translateY(-4px);
        }

        @keyframes ap-rise {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .ap-card:nth-child(1) { animation-delay: 0.04s; }
        .ap-card:nth-child(2) { animation-delay: 0.1s; }
        .ap-card:nth-child(3) { animation-delay: 0.16s; }

        /* Color band */
        .ap-card-band {
            height: 4px;
            flex-shrink: 0;
        }

        .ap-card-body {
            padding: 24px 22px 20px;
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        /* Card top */
        .ap-card-top {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .ap-card-icon {
            width: 38px; height: 38px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
        }

        .ap-card-name {
            font-size: 1rem;
            font-weight: 600;
            color: #0D1B2A;
            margin: 0 0 2px;
            letter-spacing: -0.01em;
        }

        .ap-card-tag {
            font-size: 0.68rem;
            color: #9A9A90;
            font-weight: 400;
        }

        /* Price block */
        .ap-price-block {
            padding: 14px 0;
            border-top: 1px solid #F0EFE9;
            border-bottom: 1px solid #F0EFE9;
            margin-bottom: 14px;
        }

        .ap-price-row {
            display: flex;
            align-items: flex-end;
            gap: 2px;
        }

        .ap-price-sym {
            font-family: 'DM Mono', monospace;
            font-size: 0.9rem;
            color: #8A8A80;
            margin-bottom: 6px;
        }

        .ap-price-num {
            font-family: 'DM Mono', monospace;
            font-size: 2.4rem;
            font-weight: 500;
            color: #0D1B2A;
            line-height: 1;
            letter-spacing: -0.04em;
        }

        .ap-price-per {
            font-size: 0.72rem;
            color: #9A9A90;
            margin-bottom: 6px;
        }

        /* Stat row */
        .ap-stat-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid #F5F4F0;
        }

        .ap-stat-row:last-child { border-bottom: none; }

        .ap-stat-dot {
            width: 5px; height: 5px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .ap-stat-label {
            display: flex;
            align-items: center;
            gap: 7px;
            font-size: 0.76rem;
            color: #6A6A62;
        }

        .ap-stat-val {
            font-family: 'DM Mono', monospace;
            font-size: 0.76rem;
            font-weight: 500;
            color: #0D1B2A;
        }

        /* Card actions */
        .ap-card-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: auto;
            padding-top: 16px;
        }

        .ap-action-btn {
            padding: 10px 0;
            border-radius: 10px;
            font-family: 'DM Sans', sans-serif;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            transition: all 0.15s ease;
            letter-spacing: 0.02em;
        }

        .ap-action-btn:hover { transform: translateY(-1px); }

        .ap-btn-edit {
            background: #F5F4F0;
            color: #0D1B2A;
            border: 1px solid rgba(13,27,42,0.1);
        }

        .ap-btn-edit:hover { background: #ECEAE2; }

        .ap-btn-delete {
            background: #FEF2F2;
            color: #B91C1C;
            border: 1px solid rgba(185,28,28,0.12);
        }

        .ap-btn-delete:hover { background: #FEE2E2; }

        /* ── Modal styles ── */
        .ap-modal-overlay {
            /* handled by MUI Dialog */
        }

        .ap-modal-paper {
            border-radius: 20px !important;
            overflow: hidden !important;
            box-shadow: 0 32px 80px rgba(13,27,42,0.22) !important;
            max-width: 460px !important;
            width: 100% !important;
        }

        .ap-modal-header {
            background: #0D1B2A;
            padding: 24px 28px 20px !important;
            position: relative;
        }

        .ap-modal-header::after {
            content: '';
            position: absolute;
            bottom: 0; left: 28px; right: 28px;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
        }

        .ap-modal-eyebrow {
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: #C9A84C;
            margin: 0 0 6px;
        }

        .ap-modal-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.4rem;
            font-weight: 500;
            color: #FAFAF8;
            margin: 0;
            letter-spacing: -0.01em;
        }

        .ap-modal-title em {
            font-style: italic;
            font-weight: 400;
            color: #C9A84C;
        }

        .ap-modal-body {
            padding: 24px 28px !important;
            background: #F7F6F2;
        }

        .ap-field-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 14px;
        }

        .ap-field-group.full { grid-template-columns: 1fr; }

        .ap-field-wrap {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .ap-field-label {
            font-size: 0.68rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #6A6A62;
        }

        .ap-field-input {
            background: #fff;
            border: 1px solid rgba(13,27,42,0.12);
            border-radius: 10px;
            padding: 11px 14px;
            font-family: 'DM Sans', sans-serif;
            font-size: 0.88rem;
            color: #0D1B2A;
            outline: none;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
            width: 100%;
            box-sizing: border-box;
            -moz-appearance: textfield;
        }

        .ap-field-input:focus {
            border-color: #C9A84C;
            box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }

        .ap-field-input::-webkit-inner-spin-button,
        .ap-field-input::-webkit-outer-spin-button { -webkit-appearance: none; }

        .ap-field-prefix {
            display: flex;
            align-items: center;
            background: #fff;
            border: 1px solid rgba(13,27,42,0.12);
            border-radius: 10px;
            overflow: hidden;
            transition: border-color 0.15s, box-shadow 0.15s;
        }

        .ap-field-prefix:focus-within {
            border-color: #C9A84C;
            box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
        }

        .ap-prefix-sym {
            padding: 11px 10px 11px 14px;
            font-size: 0.82rem;
            color: #9A9A90;
            font-family: 'DM Mono', monospace;
            flex-shrink: 0;
            border-right: 1px solid rgba(13,27,42,0.08);
            background: #F9F8F4;
        }

        .ap-prefix-input {
            border: none;
            outline: none;
            padding: 11px 12px;
            font-family: 'DM Sans', sans-serif;
            font-size: 0.88rem;
            color: #0D1B2A;
            flex: 1;
            background: transparent;
            -moz-appearance: textfield;
        }

        .ap-prefix-input::-webkit-inner-spin-button,
        .ap-prefix-input::-webkit-outer-spin-button { -webkit-appearance: none; }

        /* Modal footer */
        .ap-modal-footer {
            padding: 16px 28px 22px !important;
            background: #F7F6F2;
            display: flex !important;
            justify-content: flex-end;
            gap: 10px;
            border-top: 1px solid rgba(13,27,42,0.07);
        }

        .ap-modal-cancel {
            padding: 11px 22px;
            border-radius: 10px;
            background: transparent;
            color: #6A6A62;
            border: 1px solid rgba(13,27,42,0.12);
            font-family: 'DM Sans', sans-serif;
            font-size: 0.82rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s;
        }

        .ap-modal-cancel:hover {
            background: rgba(13,27,42,0.05);
            color: #0D1B2A;
        }

        .ap-modal-submit {
            padding: 11px 28px;
            border-radius: 10px;
            background: #0D1B2A;
            color: #FAFAF8;
            border: none;
            font-family: 'DM Sans', sans-serif;
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
            letter-spacing: 0.03em;
        }

        .ap-modal-submit:hover {
            background: #162840;
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(13,27,42,0.2);
        }

        .ap-modal-submit:active { transform: scale(0.98); }

        @media (max-width: 600px) {
            .ap-root { padding: 20px 14px 60px; }
            .ap-field-group { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(el);
};

/* ─── CARD ACCENTS per index ─── */
const CARD_ACCENTS = [
    { band: "linear-gradient(90deg,#1E40AF,#60A5FA)", dot: "#3B82F6", icon: "📋" },
    { band: "linear-gradient(90deg,#6D28D9,#A78BFA)", dot: "#7C3AED", icon: "🚀" },
    { band: "linear-gradient(90deg,#92400E,#C9A84C)", dot: "#B45309", icon: "💎" },
];

/* ─── FIELD component ─── */
const Field = ({ label, value, onChange, type = "text", prefix }) => (
    <div className="ap-field-wrap">
        <span className="ap-field-label">{label}</span>
        {prefix ? (
            <div className="ap-field-prefix">
                <span className="ap-prefix-sym">{prefix}</span>
                <input
                    className="ap-prefix-input"
                    type={type}
                    value={value}
                    onChange={onChange}
                />
            </div>
        ) : (
            <input
                className="ap-field-input"
                type={type}
                value={value}
                onChange={onChange}
            />
        )}
    </div>
);

/* ─── MAIN COMPONENT ─── */
export default function AdminPlansPage() {
    const [plans, setPlans] = useState([]);
    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const [form, setForm] = useState({
        name: "",
        monthly_price: "",
        yearly_price: "",
        max_clients: "",
        max_team_members: "",
        storage_limit_gb: "",
        message_limit: ""
    });

    useEffect(() => {
        injectStyles();
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await plansAPI.getAll();
            setPlans(res.data);
        } catch (err) {
            console.log("FETCH ERROR:", err);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            monthly_price: "",
            yearly_price: "",
            max_clients: "",
            max_team_members: "",
            storage_limit_gb: "",
            message_limit: ""
        });
    };

    // ================= CREATE =================
    const handleCreate = async () => {
        debugger;
        try {
            if (!form.name || !form.monthly_price) {
                alert("Please fill required fields");
                return;
            }

            const payload = {
                name: form.name?.trim() || "Basic Plan",
                monthly_price: Number(form.monthly_price || 0),
                yearly_price: Number(form.yearly_price || 0),
                max_clients: Number(form.max_clients || 0),
                max_team_members: Number(form.max_team_members || 0),
                storage_limit_gb: Number(form.storage_limit_gb || 0),
                description: form.description?.trim() || '',
            };

            await plansAPI.create(payload);
            setOpen(false);
            resetForm();
            fetchPlans();

        } catch (err) {
            console.log("CREATE ERROR:", err.response?.data);
        }
    };

    // ================= EDIT =================
    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setForm({
            ...plan,
            monthly_price: plan.monthly_price || "",
            yearly_price: plan.yearly_price || "",
        });
        setEditOpen(true);
    };

    // ================= UPDATE =================
    const handleUpdate = async () => {
        try {
            const payload = {
                ...form,
                monthly_price: Number(form.monthly_price),
                yearly_price: Number(form.yearly_price),
                max_clients: Number(form.max_clients),
                max_team_members: Number(form.max_team_members),
                storage_limit_gb: Number(form.storage_limit_gb),
                message_limit: Number(form.message_limit),
            };

            await plansAPI.update(selectedPlan.id, payload);
            setEditOpen(false);
            resetForm();
            fetchPlans();

        } catch (err) {
            console.log("UPDATE ERROR:", err);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        try {
            await plansAPI.delete(id);
            fetchPlans();
        } catch (err) {
            console.log("DELETE ERROR:", err);
        }
    };

    /* ── Shared form fields JSX ── */
    const FormFields = ({ showName = false }) => (
        <>
            {showName && (
                <div className="ap-field-group full">
                    <Field
                        label="Plan Name *"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>
            )}
            <div className="ap-field-group">
                <Field label="Monthly Price *" value={form.monthly_price} type="number" prefix="₹"
                    onChange={(e) => setForm({ ...form, monthly_price: e.target.value })} />
                <Field label="Yearly Price" value={form.yearly_price} type="number" prefix="₹"
                    onChange={(e) => setForm({ ...form, yearly_price: e.target.value })} />
            </div>
            <div className="ap-field-group">
                <Field label="Max Clients" value={form.max_clients} type="number"
                    onChange={(e) => setForm({ ...form, max_clients: e.target.value })} />
                <Field label="Team Members" value={form.max_team_members} type="number"
                    onChange={(e) => setForm({ ...form, max_team_members: e.target.value })} />
            </div>
            <div className="ap-field-group">
                <Field label="Storage (GB)" value={form.storage_limit_gb} type="number"
                    onChange={(e) => setForm({ ...form, storage_limit_gb: e.target.value })} />
                <Field label="Message Limit" value={form.message_limit} type="number"
                    onChange={(e) => setForm({ ...form, message_limit: e.target.value })} />
            </div>
        </>
    );

    return (
        <div className="ap-root">

            {/* ── HEADER ── */}
            <div className="ap-header">
                <div>
                    <div className="ap-eyebrow">
                        <div className="ap-eyebrow-line" />
                        <span className="ap-eyebrow-label">Super Admin</span>
                    </div>
                    <div className="ap-title">Plan <em>Management</em></div>
                    <p className="ap-subtitle">Create and manage subscription tiers for your firms</p>
                </div>

                <button className="ap-create-btn" onClick={() => setOpen(true)}>
                    <span className="ap-btn-icon">+</span>
                    Create Plan
                </button>
            </div>

            {/* ── PLAN CARDS ── */}
            <Grid container spacing={2.5} alignItems="stretch">
                {plans.map((plan, index) => {
                    const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
                    return (
                        <Grid item xs={12} sm={6} md={4} key={plan.id} sx={{ display: "flex" }}>
                            <div className="ap-card" style={{ width: "100%", animationDelay: `${index * 0.06}s` }}>

                                {/* Color band */}
                                <div className="ap-card-band" style={{ background: accent.band }} />

                                <div className="ap-card-body">

                                    {/* Top */}
                                    <div className="ap-card-top">
                                        <div
                                            className="ap-card-icon"
                                            style={{
                                                background: `${accent.dot}12`,
                                                border: `1px solid ${accent.dot}28`,
                                            }}
                                        >
                                            {accent.icon}
                                        </div>
                                        <div>
                                            <p className="ap-card-name">{plan.name}</p>
                                            <span className="ap-card-tag">Monthly billing</span>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="ap-price-block">
                                        <div className="ap-price-row">
                                            <span className="ap-price-sym">₹</span>
                                            <span className="ap-price-num">
                                                {parseFloat(plan.monthly_price || 0).toFixed(0)}
                                            </span>
                                            <span className="ap-price-per">&nbsp;/ mo</span>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div style={{ flex: 1, marginBottom: 14 }}>
                                        {[
                                            { label: "Clients", val: plan.max_clients },
                                            { label: "Team members", val: plan.max_team_members },
                                            { label: "Storage", val: `${plan.storage_limit_gb ?? "—"} GB` },
                                            { label: "Messages", val: plan.message_limit ?? "—" },
                                        ].map(({ label, val }) => (
                                            <div className="ap-stat-row" key={label}>
                                                <div className="ap-stat-label">
                                                    <div className="ap-stat-dot" style={{ background: accent.dot }} />
                                                    {label}
                                                </div>
                                                <span className="ap-stat-val">{val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="ap-card-actions">
                                        <button className="ap-action-btn ap-btn-edit" onClick={() => handleEdit(plan)}>
                                            ✏ Edit
                                        </button>
                                        <button className="ap-action-btn ap-btn-delete" onClick={() => handleDelete(plan.id)}>
                                            🗑 Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Grid>
                    );
                })}
            </Grid>

            {/* ================= CREATE MODAL ================= */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{ className: "ap-modal-paper" }}
            >
                <div className="ap-modal-header">
                    <p className="ap-modal-eyebrow">New Subscription</p>
                    <p className="ap-modal-title">Create <em>Plan</em></p>
                </div>

                <div className="ap-modal-body">
                    <div className="ap-field-group full" style={{ marginBottom: 14 }}>
                        <Field
                            label="Plan Name *"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="ap-field-group">
                        <Field label="Monthly Price *" value={form.monthly_price} type="number" prefix="₹"
                            onChange={(e) => setForm({ ...form, monthly_price: e.target.value })} />
                        <Field label="Yearly Price" value={form.yearly_price} type="number" prefix="₹"
                            onChange={(e) => setForm({ ...form, yearly_price: e.target.value })} />
                    </div>
                    <div className="ap-field-group">
                        <Field label="Max Clients" value={form.max_clients} type="number"
                            onChange={(e) => setForm({ ...form, max_clients: e.target.value })} />
                        <Field label="Team Members" value={form.max_team_members} type="number"
                            onChange={(e) => setForm({ ...form, max_team_members: e.target.value })} />
                    </div>
                    <div className="ap-field-group">
                        <Field label="Storage (GB)" value={form.storage_limit_gb} type="number"
                            onChange={(e) => setForm({ ...form, storage_limit_gb: e.target.value })} />
                        <Field label="Message Limit" value={form.message_limit} type="number"
                            onChange={(e) => setForm({ ...form, message_limit: e.target.value })} />
                    </div>
                </div>

                <div className="ap-modal-footer">
                    <button className="ap-modal-cancel" onClick={() => setOpen(false)}>Cancel</button>
                    <button className="ap-modal-submit" onClick={handleCreate}>Create Plan</button>
                </div>
            </Dialog>

            {/* ================= EDIT MODAL ================= */}
            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                PaperProps={{ className: "ap-modal-paper" }}
            >
                <div className="ap-modal-header">
                    <p className="ap-modal-eyebrow">Modify Subscription</p>
                    <p className="ap-modal-title">Edit <em>Plan</em></p>
                </div>

                <div className="ap-modal-body">
                    <div className="ap-field-group full" style={{ marginBottom: 14 }}>
                        <Field
                            label="Plan Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="ap-field-group">
                        <Field label="Monthly Price" value={form.monthly_price} type="number" prefix="₹"
                            onChange={(e) => setForm({ ...form, monthly_price: e.target.value })} />
                        <Field label="Yearly Price" value={form.yearly_price} type="number" prefix="₹"
                            onChange={(e) => setForm({ ...form, yearly_price: e.target.value })} />
                    </div>
                    <div className="ap-field-group">
                        <Field label="Max Clients" value={form.max_clients} type="number"
                            onChange={(e) => setForm({ ...form, max_clients: e.target.value })} />
                        <Field label="Team Members" value={form.max_team_members} type="number"
                            onChange={(e) => setForm({ ...form, max_team_members: e.target.value })} />
                    </div>
                    <div className="ap-field-group">
                        <Field label="Storage (GB)" value={form.storage_limit_gb} type="number"
                            onChange={(e) => setForm({ ...form, storage_limit_gb: e.target.value })} />
                        <Field label="Message Limit" value={form.message_limit} type="number"
                            onChange={(e) => setForm({ ...form, message_limit: e.target.value })} />
                    </div>
                </div>

                <div className="ap-modal-footer">
                    <button className="ap-modal-cancel" onClick={() => setEditOpen(false)}>Cancel</button>
                    <button className="ap-modal-submit" onClick={handleUpdate}>Update Plan</button>
                </div>
            </Dialog>

        </div>
    );
}
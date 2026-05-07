import { useEffect, useState } from "react";
import { plansAPI } from "../api/services";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from "@mui/material";
import { CheckCircleRounded, StarRounded, RocketLaunchRounded, DiamondRounded } from "@mui/icons-material";

// ── per-plan visual config (index-based, no logic change) ──
const PLAN_STYLES = [
  { icon: <StarRounded />,         gradient: "linear-gradient(135deg, #1E3A5F 0%, #0D1B2A 100%)", accent: "#60A5FA", badge: null },
  { icon: <RocketLaunchRounded />, gradient: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)", accent: "#A78BFA", badge: "Most Popular" },
  { icon: <DiamondRounded />,      gradient: "linear-gradient(135deg, #92400E 0%, #78350F 100%)", accent: "#C9A84C",  badge: "Best Value" },
];

const FeatureRow = ({ label, value, accent }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.9, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <CheckCircleRounded sx={{ fontSize: 15, color: accent, flexShrink: 0 }} />
    <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", flex: 1 }}>{label}</Typography>
    <Typography sx={{ fontSize: "0.82rem", color: "#fff", fontWeight: 700 }}>{value}</Typography>
  </Box>
);

export default function PlansPage() {

  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchActivePlan();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await plansAPI.getAll();
      setPlans(res.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  const fetchActivePlan = async () => {
    try {
      const res = await plansAPI.getActive();
      setActivePlan(res.data.plan);
    } catch (err) {
      console.log("No active plan");
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      await plansAPI.subscribe(planId);
      alert("Plan Activated ✅");
      setActivePlan(planId);
    } catch (err) {
      console.error("Subscribe error:", err);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: "100vh", background: "#F9F6F0" }}>

      {/* ── Page header ── */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Box sx={{
          display: "inline-flex", alignItems: "center", gap: 1,
          px: 2, py: 0.6, borderRadius: "99px", mb: 2,
          background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)",
        }}>
          <StarRounded sx={{ fontSize: 14, color: "#C9A84C" }} />
          <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#C9A84C", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Flexible Pricing
          </Typography>
        </Box>

        <Typography sx={{
          fontFamily: '"DM Serif Display", serif',
          fontSize: { xs: "2rem", sm: "2.6rem" },
          fontWeight: 400, color: "#0D1B2A", lineHeight: 1.15, mb: 1.5,
        }}>
          Choose Your Plan
        </Typography>
        <Typography sx={{ color: "#64748B", fontSize: "0.95rem", maxWidth: 460, mx: "auto", lineHeight: 1.7 }}>
          Scale your legal practice with the right tools. Upgrade or downgrade anytime.
        </Typography>
      </Box>

      {/* ── Plan cards ── */}
      <Grid container spacing={3} justifyContent="center">
        {plans.map((plan, index) => {
          const style   = PLAN_STYLES[index % PLAN_STYLES.length];
          const isActive = activePlan === plan.id;

          return (
            <Grid item xs={12} md={4} key={plan.id}>
              <Box sx={{
                borderRadius: "24px",
                background: style.gradient,
                p: "1px",
                boxShadow: isActive
                  ? `0 0 0 2px ${style.accent}, 0 24px 48px rgba(0,0,0,0.22)`
                  : "0 8px 32px rgba(0,0,0,0.14)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: `0 0 0 2px ${style.accent}60, 0 32px 60px rgba(0,0,0,0.2)`,
                },
                position: "relative",
              }}>

                {/* Popular / Best value badge */}
                {style.badge && (
                  <Box sx={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    px: 2, py: 0.5, borderRadius: "99px",
                    background: `linear-gradient(90deg, ${style.accent}, ${style.accent}cc)`,
                    boxShadow: `0 4px 16px ${style.accent}60`,
                    whiteSpace: "nowrap", zIndex: 2,
                  }}>
                    <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {style.badge}
                    </Typography>
                  </Box>
                )}

                <Card sx={{
                  borderRadius: "23px",
                  background: "rgba(13,27,42,0.92)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "none",
                  border: "none",
                  height: "100%",
                }}>
                  <CardContent sx={{ p: 3.5 }}>

                    {/* Plan icon + name */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                      <Box sx={{
                        width: 42, height: 42, borderRadius: "12px",
                        background: `${style.accent}20`,
                        border: `1px solid ${style.accent}35`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: style.accent, "& svg": { fontSize: 20 },
                      }}>
                        {style.icon}
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#fff" }}>
                        {plan.name}
                      </Typography>
                    </Box>

                    {/* Price */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
                        <Typography sx={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.45)", mb: 0.6 }}>₹</Typography>
                        <Typography sx={{
                          fontSize: "2.8rem", fontWeight: 800, color: "#fff",
                          letterSpacing: "-0.04em", lineHeight: 1,
                        }}>
                          {plan.monthly_price}
                        </Typography>
                        <Typography sx={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", mb: 0.8 }}>/ mo</Typography>
                      </Box>
                      {/* Accent underline */}
                      <Box sx={{ width: 40, height: 2, borderRadius: 1, background: style.accent, mt: 1 }} />
                    </Box>

                    {/* Features */}
                    <Box sx={{ mb: 3.5 }}>
                      <FeatureRow label="Clients"  value={plan.max_clients}       accent={style.accent} />
                      <FeatureRow label="Team members" value={plan.max_team_members}  accent={style.accent} />
                      <FeatureRow label="Storage"  value={`${plan.storage_limit_gb} GB`} accent={style.accent} />
                      <FeatureRow label="Messages" value={plan.message_limit}     accent={style.accent} />
                    </Box>

                    {/* CTA button */}
                    {isActive ? (
                      <Button
                        variant="contained"
                        fullWidth
                        disabled
                        startIcon={<CheckCircleRounded />}
                        sx={{
                          py: 1.4, borderRadius: "12px", fontWeight: 700, fontSize: "0.875rem",
                          background: "rgba(34,197,94,0.15)",
                          color: "#4ADE80",
                          border: "1px solid rgba(34,197,94,0.3)",
                          "&.Mui-disabled": {
                            background: "rgba(34,197,94,0.12)",
                            color: "#4ADE80",
                          },
                        }}
                      >
                        Active Plan
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleSubscribe(plan.id)}
                        sx={{
                          py: 1.4, borderRadius: "12px", fontWeight: 700, fontSize: "0.875rem",
                          background: `linear-gradient(135deg, ${style.accent}, ${style.accent}cc)`,
                          color: "#0D1B2A",
                          boxShadow: `0 4px 20px ${style.accent}50`,
                          "&:hover": {
                            background: `linear-gradient(135deg, ${style.accent}dd, ${style.accent})`,
                            boxShadow: `0 6px 28px ${style.accent}70`,
                            transform: "translateY(-1px)",
                          },
                          transition: "all 0.18s ease",
                        }}
                      >
                        Choose Plan
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* ── Footer note ── */}
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography sx={{ fontSize: "0.8rem", color: "#94A3B8" }}>
          All plans include 24/7 support · Cancel anytime · No hidden fees
        </Typography>
      </Box>
    </Box>
  );
}
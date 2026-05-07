import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography
} from "@mui/material";

import {
  Dashboard,
  People,
  Gavel,
  Description,
  Payment,
  Group,
  Business
} from "@mui/icons-material";

import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const drawerWidth = 252;

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  lawyer: 'Lawyer',
  staff: 'Staff',
};

const ROLE_COLORS = {
  super_admin: '#c9a84c',
  admin: '#4fc3f7',
  lawyer: '#81c784',
  staff: '#b0bec5',
};

export default function Sidebar() {
  const [menuItems, setMenuItems] = useState([]);
  const [role, setRole] = useState("staff");
  const [username, setUsername] = useState("");
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user?.role || "staff";
    setRole(userRole);
    setUsername(user?.username || "User");

    if (userRole === "super_admin") {
      setMenuItems([
        { text: "Dashboard", icon: <Dashboard />, path: "/" },
        { text: "Firms", icon: <Business />, path: "/firms" },
        { text: "Team", icon: <Group />, path: "/team" }
      ]);
    } else if (userRole === "admin") {
      setMenuItems([
        { text: "Dashboard", icon: <Dashboard />, path: "/" },
        { text: "Clients", icon: <People />, path: "/clients" },
        { text: "Cases", icon: <Gavel />, path: "/cases" },
        { text: "Documents", icon: <Description />, path: "/documents" },
        { text: "Payments", icon: <Payment />, path: "/payments" },
        { text: "Team", icon: <Group />, path: "/team" }
      ]);
    } else if (userRole === "lawyer") {
      setMenuItems([
        { text: "Dashboard", icon: <Dashboard />, path: "/" },
        { text: "Clients", icon: <People />, path: "/clients" },
        { text: "Cases", icon: <Gavel />, path: "/cases" },
        { text: "Documents", icon: <Description />, path: "/documents" }
      ]);
    } else {
      setMenuItems([
        { text: "Dashboard", icon: <Dashboard />, path: "/" },
        { text: "Clients", icon: <People />, path: "/clients" }
      ]);
    }
  }, []);

  const roleColor = ROLE_COLORS[role] || '#b0bec5';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          border: 'none',
          background: 'linear-gradient(180deg, #0f1d2f 0%, #1a2e4a 100%)',
          color: '#fff',
        }
      }}
    >
      {/* ── Logo Header ── */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #c9a84c, #dfc070)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
            }}
          >
            <Gavel sx={{ color: '#0f1d2f', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#fff',
                lineHeight: 1.2,
              }}
            >
              NTS Legal Pro
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontWeight: 500 }}>
              LEGAL MANAGEMENT
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2, mb: 1, height: 1, bgcolor: 'rgba(255,255,255,0.08)' }} />

      {/* ── Navigation ── */}
      <Box sx={{ px: 1.5, pt: 0.5, flex: 1 }}>
        <Typography
          sx={{
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.3)',
            px: 1.5,
            mb: 0.5,
            textTransform: 'uppercase',
          }}
        >
          Main Menu
        </Typography>

        <List disablePadding>
          {menuItems.map((item) => {
            const active = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <ListItemButton
                key={item.text}
                component={NavLink}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  py: 1.1,
                  mb: 0.25,
                  position: 'relative',
                  background: active ? 'rgba(201,168,76,0.15)' : 'transparent',
                  '&:hover': {
                    background: active ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.06)',
                  },
                  '&::before': active ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: '60%',
                    borderRadius: '0 3px 3px 0',
                    background: '#c9a84c',
                  } : {},
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: active ? '#c9a84c' : 'rgba(255,255,255,0.5)',
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* ── User Card Footer ── */}
      <Box sx={{ mx: 2, mb: 0.5, height: 1, bgcolor: 'rgba(255,255,255,0.08)' }} />

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2.5,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Avatar */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${roleColor}30, ${roleColor}60)`,
              border: `1.5px solid ${roleColor}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: roleColor }}>
              {(username[0] || 'U').toUpperCase()}
            </Typography>
          </Box>

          {/* Name + Role */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}
              noWrap
            >
              {username}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.25,
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: roleColor }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: roleColor, letterSpacing: '0.04em' }}>
                {ROLE_LABELS[role] || role}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
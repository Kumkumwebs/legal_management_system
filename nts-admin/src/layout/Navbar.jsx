import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Menu,
  MenuItem,
  Avatar
} from "@mui/material";

import {
  Search,
  Notifications
} from "@mui/icons-material";

import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  lawyer: 'Lawyer',
  staff: 'Staff',
};

export default function Navbar() {
  const { logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({ username: "User", role: "staff" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser({
      username: storedUser?.username || "User",
      role: storedUser?.role || "staff"
    });
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    window.location.href = "/login";
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "#fff",
        color: "#1a2e4a",
        borderBottom: '1px solid',
        borderColor: 'rgba(26,46,74,0.08)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: '64px !important' }}>

        {/* Search */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: '#f4f6f9',
            border: '1px solid rgba(26,46,74,0.08)',
            borderRadius: 2.5,
            px: 2,
            py: 0.7,
            width: { xs: 200, sm: 320 },
            transition: 'all 0.2s',
            '&:focus-within': {
              bgcolor: '#fff',
              borderColor: '#1a2e4a',
              boxShadow: '0 0 0 3px rgba(26,46,74,0.08)',
            },
            '&:hover': {
              bgcolor: '#eef1f5',
            },
          }}
        >
          <Search sx={{ color: "#90a4ae", fontSize: 20, mr: 1 }} />
          <InputBase
            placeholder="Search clients, cases..."
            sx={{
              color: "#1a2e4a",
              fontSize: "0.85rem",
              width: "100%",
              fontWeight: 400,
              '& ::placeholder': { color: '#90a4ae', opacity: 1 },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Notifications */}
        <IconButton
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: '#f4f6f9',
            border: '1px solid rgba(26,46,74,0.06)',
            position: 'relative',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: '#eef1f5', transform: 'translateY(-1px)' },
          }}
        >
          <Notifications sx={{ color: "#546e7a", fontSize: 20 }} />
          {/* Notification dot */}
          <Box sx={{
            position: 'absolute', top: 7, right: 8,
            width: 7, height: 7, borderRadius: '50%',
            bgcolor: '#c62828',
            border: '1.5px solid #fff',
          }} />
        </IconButton>

        {/* Divider */}
        <Box sx={{ width: 1, height: 28, bgcolor: 'rgba(26,46,74,0.1)', mx: 0.5 }} />

        {/* User Info */}
        <Box
          onClick={handleMenuOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
            px: 1.5,
            py: 0.8,
            borderRadius: 2.5,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: '#f4f6f9',
            },
          }}
        >
          <Avatar
            sx={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg, #1a2e4a, #2d4a72)",
              fontSize: "0.8rem",
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(26,46,74,0.25)',
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography sx={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: '#1a2e4a',
              lineHeight: 1.2,
            }}>
              {user.username}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{
                width: 5, height: 5, borderRadius: '50%',
                bgcolor: user.role === 'super_admin' ? '#c9a84c'
                  : user.role === 'admin' ? '#1565c0'
                  : user.role === 'lawyer' ? '#2e7d32' : '#90a4ae',
              }} />
              <Typography sx={{
                fontSize: "0.65rem",
                fontWeight: 600,
                color: '#90a4ae',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}>
                {ROLE_LABELS[user.role] || user.role}
              </Typography>
            </Box>
          </Box>

          {/* Dropdown arrow */}
          <Box sx={{
            width: 0, height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '4px solid #90a4ae',
            ml: 0.5,
          }} />
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: 2.5,
              border: '1px solid rgba(26,46,74,0.08)',
              boxShadow: '0 8px 32px rgba(26,46,74,0.12)',
              overflow: 'hidden',
            },
          }}
        >
          {/* User header in dropdown */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(26,46,74,0.08)', bgcolor: '#fafbfc' }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a2e4a' }}>
              {user.username}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#90a4ae' }}>
              {ROLE_LABELS[user.role] || user.role}
            </Typography>
          </Box>

          <MenuItem
            disabled
            sx={{
              py: 1.2, px: 2,
              '&.Mui-disabled': { opacity: 0.55 },
              fontSize: '0.85rem',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>My Profile</Typography>
          </MenuItem>

          <Box sx={{ mx: 1.5, height: 1, bgcolor: 'rgba(26,46,74,0.06)' }} />

          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.2, px: 2,
              color: '#c62828',
              fontSize: '0.85rem',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: '#ffebee' },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#c62828' }}>Logout</Typography>
          </MenuItem>
        </Menu>

      </Toolbar>
    </AppBar>
  );
}
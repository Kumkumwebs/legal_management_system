import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
  Menu, MenuItem, Badge, InputBase, Tooltip, Divider
} from '@mui/material';

import {
  DashboardRounded, PeopleRounded, GavelRounded, FolderRounded,
  PaymentsRounded, GroupsRounded, SearchRounded, NotificationsRounded,
  MenuRounded, LogoutRounded, AccountCircleRounded,
  KeyboardArrowDownRounded, BalanceRounded,
  AssignmentRounded, SupportAgentRounded, SettingsRounded,
  CalendarMonthRounded, BarChartRounded
} from '@mui/icons-material';

import { useAuth } from '../auth/AuthProvider';

const DRAWER_WIDTH = 252;

// ✅ FIXED: single consistent name
const MENU_CONFIG = {
  super_admin: [
    'Dashboard',
    'Firms',
    'Plans',
    'Subscriptions',
    'Support',
    'Settings',
  ],
  admin: [
    'Dashboard',
    'Clients',
    'Cases',
    'Documents',
    'Payments',
    'Team',
    'Tasks',
    'Plans',
    'Support',
    'Settings',
  ],
  lawyer: [
    'Dashboard',
    'Cases',
    'Hearings',
    'Documents',
    'Clients',
    'Tasks',
    'Support',
    'Profile',
    'Settings',
  ],
  staff: [
    'Dashboard',
    'Clients',
    'Cases',
    'Documents',
    'Payments',
    'Tasks',
    'Support',
    'Profile',
    'Settings',
  ]
};

// ✅ FIXED: all new items added
const navItems = [
  { label: 'Dashboard',   icon: <DashboardRounded />,     path: '/' },
  { label: 'Clients',     icon: <PeopleRounded />,         path: '/clients' },
  { label: 'Firms',       icon: <BalanceRounded />,        path: '/firms' },
  { label: 'Cases',       icon: <GavelRounded />,          path: '/cases' },
  { label: 'Hearings',    icon: <CalendarMonthRounded />,  path: '/hearings' },
  { label: 'Documents',   icon: <FolderRounded />,         path: '/documents' },
  { label: 'Payments',    icon: <PaymentsRounded />,       path: '/payments' },
  { label: 'Team',        icon: <GroupsRounded />,         path: '/team' },
  { label: 'Tasks',       icon: <AssignmentRounded />,     path: '/tasks' },
  { label: 'Plans',       icon: <PaymentsRounded />,       path: '/plans' },
  { label: 'Reports',     icon: <BarChartRounded />,       path: '/reports' },
  { label: 'Subscriptions', icon: <PaymentsRounded />,    path: '/subscriptions' },
  { label: 'Support',     icon: <SupportAgentRounded />,   path: '/support' },
  { label: 'Profile',     icon: <AccountCircleRounded />,  path: '/profile' },
  { label: 'Settings',    icon: <SettingsRounded />,       path: '/settings' },
];

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

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const role = (user?.role || 'staff').toLowerCase();
  const roleColor = ROLE_COLORS[role] || '#b0bec5';

  // ✅ FIXED: uses MENU_CONFIG (not MENU_CONFIG_UPDATED)
  const allowedMenu = navItems.filter(item => {
    const config = MENU_CONFIG[role] || [];
    return config.includes(item.label);
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ══════════════════════════════════════════════════════
  // SIDEBAR
  // ══════════════════════════════════════════════════════
  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0f1d2f 0%, #1a2e4a 100%)',
        color: 'white',
      }}
    >
      {/* ── Logo ── */}
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
            <BalanceRounded sx={{ color: '#0f1d2f', fontSize: 20 }} />
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
              HP HCMS
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', fontWeight: 500 }}>
              HIGHCOURT MANAGEMENT
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* ── Navigation ── */}
      <Box sx={{ px: 1.5, pt: 1.5, flex: 1, overflowY: 'auto' }}>
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
          {allowedMenu.map(({ label, icon, path }) => {
            const active = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);

            return (
              <ListItem key={label} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  sx={{
                    borderRadius: 2,
                    px: 1.5,
                    py: 1.1,
                    position: 'relative',
                    background: active ? 'rgba(201,168,76,0.15)' : 'transparent',
                    transition: 'all 0.15s',
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
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: active ? 600 : 400,
                      color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* ── User Card ── */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />
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
          <Avatar
            sx={{
              width: 36,
              height: 36,
              background: `linear-gradient(135deg, ${roleColor}30, ${roleColor}60)`,
              border: `1.5px solid ${roleColor}40`,
              fontSize: '0.85rem',
              fontWeight: 800,
              color: roleColor,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}
              noWrap
            >
              {user?.username || 'User'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: roleColor }} />
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: roleColor, letterSpacing: '0.04em' }}>
                {ROLE_LABELS[role] || role}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // ══════════════════════════════════════════════════════
  // MAIN UI
  // ══════════════════════════════════════════════════════
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6f9' }}>

      {/* Sidebar — Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Sidebar — Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Top Bar ── */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            color: '#1a2e4a',
            borderBottom: '1px solid rgba(26,46,74,0.08)',
          }}
        >
          <Toolbar sx={{ gap: 1.5, minHeight: '64px !important' }}>

            {/* Mobile menu toggle */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{
                display: { md: 'none' },
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: '#f4f6f9',
              }}
            >
              <MenuRounded sx={{ fontSize: 20 }} />
            </IconButton>

            {/* Search */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#f4f6f9',
                border: '1px solid rgba(26,46,74,0.08)',
                borderRadius: 2.5,
                px: 2,
                py: 0.7,
                flex: 1,
                maxWidth: 360,
                transition: 'all 0.2s',
                '&:focus-within': {
                  bgcolor: '#fff',
                  borderColor: '#1a2e4a',
                  boxShadow: '0 0 0 3px rgba(26,46,74,0.08)',
                },
                '&:hover': { bgcolor: '#eef1f5' },
              }}
            >
              <SearchRounded sx={{ color: '#90a4ae', fontSize: 20, mr: 1 }} />
              <InputBase
                placeholder="Search clients, cases..."
                sx={{
                  fontSize: '0.85rem',
                  flex: 1,
                  fontWeight: 400,
                  color: '#1a2e4a',
                  '& ::placeholder': { color: '#90a4ae', opacity: 1 },
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Notifications */}
            <Tooltip title="Notifications" arrow>
              <IconButton
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 2,
                  bgcolor: '#f4f6f9',
                  border: '1px solid rgba(26,46,74,0.06)',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#eef1f5', transform: 'translateY(-1px)' },
                }}
              >
                <Badge
                  badgeContent={3}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.6rem',
                      height: 16,
                      minWidth: 16,
                      borderRadius: '50%',
                      border: '1.5px solid #fff',
                    },
                  }}
                >
                  <NotificationsRounded sx={{ color: '#546e7a', fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            <Box sx={{ width: 1, height: 28, bgcolor: 'rgba(26,46,74,0.1)', mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

            {/* User Profile */}
            <Box
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                cursor: 'pointer',
                px: 1.5,
                py: 0.8,
                borderRadius: 2.5,
                transition: 'all 0.15s',
                '&:hover': { bgcolor: '#f4f6f9' },
              }}
            >
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  background: 'linear-gradient(135deg, #1a2e4a, #2d4a72)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(26,46,74,0.25)',
                }}
              >
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a2e4a', lineHeight: 1.2 }}>
                  {user?.username || 'User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: roleColor }} />
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#90a4ae', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    {ROLE_LABELS[role] || role}
                  </Typography>
                </Box>
              </Box>
              <KeyboardArrowDownRounded sx={{ fontSize: 18, color: '#90a4ae', display: { xs: 'none', sm: 'block' } }} />
            </Box>

            {/* Dropdown */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
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
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(26,46,74,0.08)', bgcolor: '#fafbfc' }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#1a2e4a' }}>
                  {user?.username}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#90a4ae' }}>
                  {ROLE_LABELS[role] || role}
                </Typography>
              </Box>

              <MenuItem
                component={Link}
                to="/profile"
                onClick={() => setAnchorEl(null)}
                sx={{ py: 1.2, px: 2, gap: 1.5 }}
              >
                <AccountCircleRounded sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Profile</Typography>
              </MenuItem>

              <MenuItem
                component={Link}
                to="/settings"
                onClick={() => setAnchorEl(null)}
                sx={{ py: 1.2, px: 2, gap: 1.5 }}
              >
                <SettingsRounded sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Settings</Typography>
              </MenuItem>

              <Box sx={{ mx: 1.5, height: 1, bgcolor: 'rgba(26,46,74,0.06)' }} />

              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: 1.2, px: 2, gap: 1.5,
                  color: '#c62828',
                  '&:hover': { bgcolor: '#ffebee' },
                }}
              >
                <LogoutRounded sx={{ fontSize: 18, color: '#c62828' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#c62828' }}>Logout</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ── Page Content ── */}
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
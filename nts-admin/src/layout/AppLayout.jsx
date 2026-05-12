import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Avatar,
  Menu, MenuItem, InputBase, Divider,
} from '@mui/material';
import {
  DashboardRounded, PeopleRounded, GavelRounded, FolderRounded,
  PaymentsRounded, GroupsRounded, SearchRounded, MenuRounded,
  LogoutRounded, AccountCircleRounded, KeyboardArrowDownRounded,
  BalanceRounded, AssignmentRounded, SupportAgentRounded,
  SettingsRounded, CalendarMonthRounded, VerifiedRounded,
  ChevronRightRounded,
} from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';

const DRAWER_WIDTH = 256;

/* ─── nav items ───────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Dashboard',     icon: <DashboardRounded />,    path: '/' },
  { label: 'Clients',       icon: <PeopleRounded />,        path: '/clients' },
  { label: 'Firms',         icon: <BalanceRounded />,       path: '/firms' },
  { label: 'Cases',         icon: <GavelRounded />,         path: '/cases' },
  { label: 'Hearings',      icon: <CalendarMonthRounded />, path: '/hearings' },
  { label: 'Documents',     icon: <FolderRounded />,        path: '/documents' },
  { label: 'Payments',      icon: <PaymentsRounded />,      path: '/payments' },
  { label: 'Team',          icon: <GroupsRounded />,        path: '/team' },
  { label: 'Tasks',         icon: <AssignmentRounded />,    path: '/tasks' },
  { label: 'Plans',         icon: <VerifiedRounded />,      path: '/plans' },
  { label: 'Subscriptions', icon: <PaymentsRounded />,      path: '/subscriptions' },
  { label: 'Support',       icon: <SupportAgentRounded />,  path: '/support' },
  { label: 'Profile',       icon: <AccountCircleRounded />, path: '/profile' },
  { label: 'Settings',      icon: <SettingsRounded />,      path: '/settings' },
  { label: 'Brand Settings',icon: <SettingsRounded />,      path: '/brand_setting' },
];

const MENU_CONFIG = {
  super_admin: ['Dashboard', 'Firms', 'Plans', 'Subscriptions', 'Support', 'Settings'],
  admin:       ['Dashboard', 'Clients', 'Cases', 'Documents', 'Payments', 'Team', 'Tasks', 'Plans', 'Support', 'Settings', 'Brand Settings'],
  lawyer:      ['Dashboard', 'Cases', 'Hearings', 'Documents', 'Clients', 'Tasks', 'Support', 'Profile', 'Settings'],
  staff:       ['Dashboard', 'Clients', 'Cases', 'Documents', 'Payments', 'Tasks', 'Support', 'Profile', 'Settings'],
};

const NAV_SECTIONS = {
  super_admin: [
    { heading: 'Overview',   items: ['Dashboard'] },
    { heading: 'Management', items: ['Firms', 'Plans', 'Subscriptions'] },
    { heading: 'System',     items: ['Support', 'Settings'] },
  ],
  admin: [
    { heading: 'Overview',   items: ['Dashboard'] },
    { heading: 'Workspace',  items: ['Clients', 'Cases', 'Documents', 'Payments'] },
    { heading: 'Manage',     items: ['Team', 'Tasks', 'Plans'] },
    { heading: 'System',     items: ['Support', 'Settings', 'Brand Settings'] },
  ],
  lawyer: [
    { heading: 'Overview',   items: ['Dashboard'] },
    { heading: 'Legal',      items: ['Cases', 'Hearings', 'Documents', 'Clients'] },
    { heading: 'Tools',      items: ['Tasks', 'Support'] },
    { heading: 'Account',    items: ['Profile', 'Settings'] },
  ],
  staff: [
    { heading: 'Overview',   items: ['Dashboard'] },
    { heading: 'Work',       items: ['Clients', 'Cases', 'Documents', 'Payments', 'Tasks'] },
    { heading: 'Account',    items: ['Support', 'Profile', 'Settings'] },
  ],
};

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin:       'Administrator',
  lawyer:      'Lawyer',
  staff:       'Staff',
};

/* ─── helpers ─────────────────────────────────── */
function darken(hex, amt = 20) {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, (n >> 16) - amt);
    const g = Math.max(0, ((n >> 8) & 0xff) - amt);
    const b = Math.max(0, (n & 0xff) - amt);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  } catch { return hex; }
}

function isLight(hex) {
  try {
    const n = parseInt(hex.replace('#', ''), 16);
    const r = (n >> 16) & 0xff;
    const g = (n >> 8)  & 0xff;
    const b =  n        & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) > 128;
  } catch { return false; }
}

/* ══════════════════════════════════════════════════
   SIDEBAR CONTENT
══════════════════════════════════════════════════ */
function SidebarContent({ user, role, location, firmTheme, onNav }) {
  const primary  = firmTheme.primaryColor || '#0D1B2A';
  const accent   = firmTheme.accentColor  || '#C9A84C';
  const fontFam  = firmTheme.fontFamily   || 'DM Sans, sans-serif';
  const firmName = firmTheme.firmName     || 'NTS Legal Pro';

  const bgDark       = darken(primary, 15);
  const textColor    = isLight(primary) ? 'rgba(0,0,0,0.85)'  : '#ffffff';
  const mutedColor   = isLight(primary) ? 'rgba(0,0,0,0.45)'  : 'rgba(255,255,255,0.45)';
  const dividerColor = isLight(primary) ? 'rgba(0,0,0,0.10)'  : 'rgba(255,255,255,0.08)';
  const hoverBg      = isLight(primary) ? 'rgba(0,0,0,0.05)'  : 'rgba(255,255,255,0.06)';

  const sections = NAV_SECTIONS[role] || [{ heading: 'Menu', items: MENU_CONFIG[role] || [] }];
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: `linear-gradient(180deg, ${primary} 0%, ${bgDark} 100%)`,
      fontFamily: fontFam,
      overflowY: 'auto',
      '&::-webkit-scrollbar': { width: 4 },
      '&::-webkit-scrollbar-track': { background: 'transparent' },
      '&::-webkit-scrollbar-thumb': { background: `${accent}40`, borderRadius: 4 },
    }}>

      {/* ── Logo ── */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {firmTheme.logo ? (
            <Box component="img" src={firmTheme.logo} alt="Logo"
              sx={{ width: 40, height: 40, borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
              background: `linear-gradient(135deg, ${accent}, ${darken(accent, 20)})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${accent}44`,
            }}>
              <BalanceRounded sx={{ color: isLight(accent) ? '#111' : '#fff', fontSize: 21 }} />
            </Box>
          )}
          <Box>
            <Typography sx={{
              fontFamily: '"DM Serif Display", serif',
              fontWeight: 400, fontSize: '1rem', color: textColor, lineHeight: 1.2,
            }}>
              {firmName}
            </Typography>
            <Typography sx={{
              fontSize: '0.58rem', color: mutedColor,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
             HP Highcourt management system
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Role chip ── */}
      <Box sx={{ px: 2, mb: 1.5 }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.9, borderRadius: '10px',
          background: `${accent}18`, border: `1px solid ${accent}30`,
        }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: accent, boxShadow: `0 0 0 3px ${accent}30` }} />
          <Typography sx={{
            fontSize: '0.68rem', fontWeight: 700, color: accent,
            letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: fontFam,
          }}>
            {ROLE_LABELS[role] || role}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: dividerColor, mx: 2, mb: 1 }} />

      {/* ── Nav sections ── */}
      <Box sx={{ flex: 1, px: 1.5 }}>
        {sections.map((section) => {
          const items = NAV_ITEMS.filter(i => section.items.includes(i.label));
          if (!items.length) return null;
          return (
            <Box key={section.heading} sx={{ mb: 1 }}>
              <Typography sx={{
                fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: mutedColor,
                px: 1.5, py: 1, display: 'block', fontFamily: fontFam,
              }}>
                {section.heading}
              </Typography>
              <List disablePadding>
                {items.map(({ label, icon, path }) => {
                  const active = isActive(path);
                  return (
                    <ListItem key={label} disablePadding sx={{ mb: 0.3 }}>
                      <ListItemButton
                        component={Link} to={path} onClick={onNav}
                        sx={{
                          borderRadius: '10px', px: 1.5, py: 1, position: 'relative',
                          background: active ? `${accent}20` : 'transparent',
                          border: `1px solid ${active ? `${accent}35` : 'transparent'}`,
                          transition: 'all 0.15s',
                          '&:hover': { background: active ? `${accent}28` : hoverBg },
                        }}
                      >
                        {active && (
                          <Box sx={{
                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                            width: 3, borderRadius: '0 3px 3px 0', background: accent,
                          }} />
                        )}
                        <ListItemIcon sx={{
                          minWidth: 36, color: active ? accent : mutedColor,
                          '& .MuiSvgIcon-root': { fontSize: 18 }, transition: 'color 0.15s',
                        }}>
                          {icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={label}
                          primaryTypographyProps={{
                            fontSize: '0.83rem', fontFamily: fontFam,
                            fontWeight: active ? 700 : 400,
                            color: active ? textColor : mutedColor,
                          }}
                        />
                        {active && <ChevronRightRounded sx={{ fontSize: 14, color: accent, opacity: 0.7 }} />}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* ── User card ── */}
      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
        <Divider sx={{ borderColor: dividerColor, mb: 1.5 }} />
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
          borderRadius: '12px', background: hoverBg, border: `1px solid ${dividerColor}`,
        }}>
          <Avatar sx={{
            width: 34, height: 34,
            background: `linear-gradient(135deg, ${accent}88, ${accent})`,
            fontSize: '0.78rem', fontWeight: 800,
            color: isLight(accent) ? '#111' : '#fff',
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography sx={{
              fontSize: '0.78rem', fontWeight: 600, color: textColor,
              lineHeight: 1.2, fontFamily: fontFam,
            }} noWrap>
              {user?.username || 'User'}
            </Typography>
            <Typography sx={{ fontSize: '0.62rem', color: mutedColor, mt: 0.2, fontFamily: fontFam }}>
              {ROLE_LABELS[role] || role}
            </Typography>
          </Box>
          <Box sx={{
            width: 7, height: 7, borderRadius: '50%', background: '#22C55E',
            boxShadow: '0 0 0 3px rgba(34,197,94,0.2)', flexShrink: 0,
          }} />
        </Box>
      </Box>
    </Box>
  );
}

/* ══════════════════════════════════════════════════
   MAIN LAYOUT
══════════════════════════════════════════════════ */
export default function MainLayout() {
  const { user, logout }     = useAuth();
  const { theme: firmTheme } = useTheme();
  const navigate             = useNavigate();
  const location             = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl]     = useState(null);

  const role    = (user?.role || 'staff').toLowerCase();
  const accent  = firmTheme.accentColor  || '#C9A84C';
  const primary = firmTheme.primaryColor || '#0D1B2A';
  const fontFam = firmTheme.fontFamily   || 'DM Sans, sans-serif';

  const handleLogout = () => {
    window.dispatchEvent(new Event('auth:logout'));
    logout();
    navigate('/login');
  };

  const pageTitle = NAV_ITEMS.find(i => i.path === location.pathname)?.label
    || NAV_ITEMS.find(i => location.pathname.startsWith(i.path) && i.path !== '/')?.label
    || 'Dashboard';

  const sidebarProps = { user, role, location, firmTheme, onNav: () => setMobileOpen(false) };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#F2F4F7', fontFamily: fontFam }}>

      {/* Desktop sidebar */}
      <Drawer variant="permanent" sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', border: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.10)' },
      }}>
        <SidebarContent {...sidebarProps} />
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, border: 'none' } }}>
        <SidebarContent {...sidebarProps} />
      </Drawer>

      {/* Main */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Topbar ── */}
        <AppBar position="sticky" elevation={0}
          sx={{ background: '#fff', borderBottom: '1px solid #E8EDF2', color: '#0D1B2A' }}>
          <Toolbar sx={{ gap: 1.5, minHeight: '60px !important', px: { xs: 2, sm: 3 } }}>

            <IconButton onClick={() => setMobileOpen(true)}
              sx={{ display: { md: 'none' }, width: 36, height: 36, borderRadius: '10px', background: '#F2F4F7', border: '1px solid #E8EDF2' }}>
              <MenuRounded sx={{ fontSize: 19 }} />
            </IconButton>

            {/* Breadcrumb */}
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500, fontFamily: fontFam }}>
                {firmTheme.firmName || 'NTS Legal'}
              </Typography>
              <ChevronRightRounded sx={{ fontSize: 14, color: '#CBD5E1' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D1B2A', fontFamily: fontFam }}>
                {pageTitle}
              </Typography>
            </Box>

            {/* Search */}
            <Box sx={{
              display: 'flex', alignItems: 'center',
              background: '#F2F4F7', border: '1px solid #E8EDF2',
              borderRadius: '10px', px: 1.5, py: 0.6,
              ml: { xs: 0, sm: 2 }, flex: 1, maxWidth: 320,
              transition: 'all 0.2s',
              '&:focus-within': { background: '#fff', borderColor: accent, boxShadow: `0 0 0 3px ${accent}22` },
            }}>
              <SearchRounded sx={{ fontSize: 17, color: '#94A3B8', mr: 1, flexShrink: 0 }} />
              <InputBase
                placeholder="Search anything…"
                sx={{ fontSize: '0.82rem', flex: 1, color: '#0D1B2A', fontFamily: fontFam,
                  '& ::placeholder': { color: '#94A3B8', opacity: 1 } }}
              />
            </Box>

            <Box sx={{ flex: 1 }} />

            {/* Notifications */}
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: '#F2F4F7', border: '1px solid #E8EDF2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <NotificationBell />
            </Box>

            <Box sx={{ width: 1, height: 24, background: '#E8EDF2', mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

            {/* User button */}
            <Box onClick={(e) => setAnchorEl(e.currentTarget)} sx={{
              display: 'flex', alignItems: 'center', gap: 1.2,
              cursor: 'pointer', px: 1.5, py: 0.8,
              borderRadius: '12px', border: '1px solid transparent',
              transition: 'all 0.15s',
              '&:hover': { background: '#F2F4F7', borderColor: '#E8EDF2' },
            }}>
              <Avatar sx={{
                width: 32, height: 32,
                background: `linear-gradient(135deg, ${accent}88, ${accent})`,
                fontSize: '0.75rem', fontWeight: 800,
                color: isLight(accent) ? '#111' : '#fff',
                boxShadow: `0 2px 8px ${accent}44`,
              }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0D1B2A', lineHeight: 1.2, fontFamily: fontFam }}>
                  {user?.username || 'User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: accent }} />
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: fontFam }}>
                    {ROLE_LABELS[role] || role}
                  </Typography>
                </Box>
              </Box>
              <KeyboardArrowDownRounded sx={{ fontSize: 16, color: '#94A3B8', display: { xs: 'none', sm: 'block' } }} />
            </Box>

            {/* Dropdown */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{ sx: { mt: 1, minWidth: 210, borderRadius: '14px', border: '1px solid #E8EDF2', boxShadow: '0 12px 40px rgba(13,27,42,0.12)', overflow: 'hidden' } }}>

              {/* User header */}
              <Box sx={{ px: 2.5, py: 2, background: `linear-gradient(135deg, ${primary}14, ${primary}05)`, borderBottom: '1px solid #E8EDF2' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{
                    width: 38, height: 38,
                    background: `linear-gradient(135deg, ${accent}88, ${accent})`,
                    fontSize: '0.85rem', fontWeight: 800,
                    color: isLight(accent) ? '#111' : '#fff',
                  }}>
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0D1B2A', fontFamily: fontFam }}>
                      {user?.username}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: accent }} />
                      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {ROLE_LABELS[role] || role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {[
                { label: 'Profile',        icon: <AccountCircleRounded sx={{ fontSize: 17 }} />, to: '/profile' },
                { label: 'Settings',       icon: <SettingsRounded      sx={{ fontSize: 17 }} />, to: '/settings' },
                { label: 'Brand Settings', icon: <SettingsRounded      sx={{ fontSize: 17 }} />, to: '/brand_setting' },
              ].map(({ label, icon, to }) => (
                <MenuItem key={label} component={Link} to={to} onClick={() => setAnchorEl(null)}
                  sx={{ py: 1.2, px: 2, gap: 1.5, fontSize: '0.83rem', fontWeight: 500, color: '#0D1B2A', fontFamily: fontFam, '&:hover': { background: `${accent}12` } }}>
                  <Box sx={{ color: '#64748B' }}>{icon}</Box> {label}
                </MenuItem>
              ))}

              <Box sx={{ mx: 2, height: 1, background: '#E8EDF2', my: 0.5 }} />

              <MenuItem onClick={handleLogout}
                sx={{ py: 1.2, px: 2, gap: 1.5, fontSize: '0.83rem', fontWeight: 600, color: '#DC2626', fontFamily: fontFam, '&:hover': { background: '#FEF2F2' } }}>
                <LogoutRounded sx={{ fontSize: 17 }} /> Sign Out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* ── Page content ── */}
        <Box sx={{
          flex: 1, overflow: 'auto',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: '#F2F4F7' },
          '&::-webkit-scrollbar-thumb': { background: `${accent}55`, borderRadius: 6 },
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
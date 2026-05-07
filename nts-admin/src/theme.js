import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a2e4a',
      light: '#2d4a72',
      dark: '#0f1d2f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c9a84c',
      light: '#dfc070',
      dark: '#a08530',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f4f6f9',
      paper: '#ffffff',
    },
    success: { main: '#2e7d32' },
    error: { main: '#c62828' },
    warning: { main: '#e65100' },
    info: { main: '#1565c0' },
    text: {
      primary: '#1a2e4a',
      secondary: '#546e7a',
    },
    divider: '#e8edf2',
  },
  typography: {
    fontFamily: '"DM Sans", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h2: { fontFamily: '"Playfair Display", serif', fontWeight: 700 },
    h3: { fontFamily: '"Playfair Display", serif', fontWeight: 600 },
    h4: { fontFamily: '"Playfair Display", serif', fontWeight: 600 },
    h5: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"DM Sans", sans-serif', fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.025em' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0px 1px 3px rgba(26,46,74,0.06), 0px 1px 2px rgba(26,46,74,0.04)',
    '0px 2px 6px rgba(26,46,74,0.08), 0px 1px 3px rgba(26,46,74,0.04)',
    '0px 4px 12px rgba(26,46,74,0.10), 0px 2px 4px rgba(26,46,74,0.06)',
    '0px 6px 16px rgba(26,46,74,0.12)',
    '0px 8px 24px rgba(26,46,74,0.12)',
    '0px 10px 28px rgba(26,46,74,0.14)',
    '0px 12px 32px rgba(26,46,74,0.14)',
    '0px 14px 36px rgba(26,46,74,0.16)',
    '0px 16px 40px rgba(26,46,74,0.16)',
    '0px 18px 44px rgba(26,46,74,0.18)',
    '0px 20px 48px rgba(26,46,74,0.18)',
    '0px 22px 52px rgba(26,46,74,0.20)',
    '0px 24px 56px rgba(26,46,74,0.20)',
    '0px 26px 60px rgba(26,46,74,0.22)',
    '0px 28px 64px rgba(26,46,74,0.22)',
    '0px 30px 68px rgba(26,46,74,0.24)',
    '0px 32px 72px rgba(26,46,74,0.24)',
    '0px 34px 76px rgba(26,46,74,0.26)',
    '0px 36px 80px rgba(26,46,74,0.26)',
    '0px 38px 84px rgba(26,46,74,0.28)',
    '0px 40px 88px rgba(26,46,74,0.28)',
    '0px 42px 92px rgba(26,46,74,0.30)',
    '0px 44px 96px rgba(26,46,74,0.30)',
    '0px 46px 100px rgba(26,46,74,0.32)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 20px',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #1a2e4a 0%, #2d4a72 100%)',
          boxShadow: '0 4px 12px rgba(26,46,74,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0f1d2f 0%, #1a2e4a 100%)',
            boxShadow: '0 6px 16px rgba(26,46,74,0.4)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #c9a84c 0%, #dfc070 100%)',
          boxShadow: '0 4px 12px rgba(201,168,76,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #a08530 0%, #c9a84c 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          boxShadow: '0px 2px 8px rgba(26,46,74,0.08)',
          border: '1px solid rgba(26,46,74,0.06)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            backgroundColor: '#f4f6f9',
            fontWeight: 600,
            color: '#1a2e4a',
            fontSize: '0.78rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500, fontSize: '0.75rem' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
    },
  },
});

export default theme;

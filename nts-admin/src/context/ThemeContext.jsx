// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const defaultTheme = {
  primaryColor: '#0D1B2A',
  accentColor:  '#C9A84C',
  fontFamily:   'DM Sans, sans-serif',
  sidebarDark:  true,
  logo:         null,
  firmName:     'HP Highcourt management system',
};

const ThemeCtx = createContext({
  theme:      defaultTheme,
  applyTheme: () => {},
  resetTheme: () => {},
  defaultTheme,
});

export const useTheme = () => useContext(ThemeCtx);

function setCSSVars(t) {
  const root = document.documentElement;
  root.style.setProperty('--primary', t.primaryColor);
  root.style.setProperty('--accent',  t.accentColor);
  root.style.setProperty('--font',    t.fontFamily);
}

export function FirmThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  /* Merge + apply theme to state and CSS vars. NO localStorage write. */
  const applyTheme = useCallback((t) => {
    const merged = { ...defaultTheme, ...t };
    setCSSVars(merged);
    setTheme(merged);
  }, []);

  /* Reset to defaults */
  const resetTheme = useCallback(() => {
    setCSSVars(defaultTheme);
    setTheme(defaultTheme);
  }, []);

  /* Fetch from DB and apply */
  const loadFromDB = useCallback(async () => {
    try {
      const { data: firm } = await api.get('/profile/firm/');
      if (!firm) return;
      applyTheme({
        primaryColor: firm.theme_color  || defaultTheme.primaryColor,
        accentColor:  firm.accent_color || defaultTheme.accentColor,
        fontFamily:   firm.font_family  || defaultTheme.fontFamily,
        sidebarDark:  firm.sidebar_dark ?? defaultTheme.sidebarDark,
        logo:         firm.logo         || null,
        firmName:     firm.name         || defaultTheme.firmName,
      });
    } catch {
      // lawyer/staff roles won't have firm profile — stay on default
    }
  }, [applyTheme]);

  /*
   * On mount:
   *   - If token exists (page refresh while logged in) → load from DB
   *   - No token (fresh load / after logout)           → stay on default
   */
  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      loadFromDB();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← intentionally empty: only runs once on mount

  /*
   * Listen for custom events dispatched by AuthProvider:
   *   'auth:login'  → load fresh theme from DB
   *   'auth:logout' → reset to defaults
   *
   * This avoids circular imports (ThemeContext importing AuthProvider).
   */
  useEffect(() => {
    const onLogin  = () => loadFromDB();
    const onLogout = () => resetTheme();

    window.addEventListener('auth:login',  onLogin);
    window.addEventListener('auth:logout', onLogout);

    return () => {
      window.removeEventListener('auth:login',  onLogin);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, [loadFromDB, resetTheme]);

  return (
    <ThemeCtx.Provider value={{ theme, applyTheme, resetTheme, defaultTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}
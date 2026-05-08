// src/context/ThemeContext.jsx
// ✅ FIXED: useTheme() returns defaultTheme instead of null when used outside provider

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export const defaultTheme = {
  primaryColor: '#0D1B2A',
  accentColor:  '#C9A84C',
  fontFamily:   'DM Sans, sans-serif',
  sidebarDark:  true,
  logo:         null,
  firmName:     'HP HCMS',
};

const ThemeCtx = createContext({
  theme:       defaultTheme,
  applyTheme:  () => {},
  defaultTheme,
});

// ✅ Safe hook — never returns null
export const useTheme = () => useContext(ThemeCtx);

export function FirmThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('firm_theme');
      return saved ? { ...defaultTheme, ...JSON.parse(saved) } : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  const applyTheme = useCallback((t) => {
    const merged = { ...defaultTheme, ...t };
    const root = document.documentElement;
    root.style.setProperty('--primary', merged.primaryColor);
    root.style.setProperty('--accent',  merged.accentColor);
    root.style.setProperty('--font',    merged.fontFamily);
    setTheme(merged);
    localStorage.setItem('firm_theme', JSON.stringify(merged));
  }, []);

  // Load firm branding from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/profile/firm/');
        const firm = res.data;
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
        // Use cached/default theme — silent fail
      }
    };
    load();
  }, [applyTheme]);

  return (
    <ThemeCtx.Provider value={{ theme, applyTheme, defaultTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}
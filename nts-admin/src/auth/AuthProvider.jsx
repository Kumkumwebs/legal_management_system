import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const { data } = await authAPI.login({ username, password });

    // ✅ Write tokens FIRST so API client has them before subsequent calls
    localStorage.setItem('access_token',  data.access);
    localStorage.setItem('refresh_token', data.refresh);

    const userData = { username, ...(data.user || {}) };
    localStorage.setItem('user', JSON.stringify(userData));

    // ✅ Set user in state — triggers useEffect([user]) in Dashboard & other pages
    setUser(userData);

    // ✅ Dispatch event so any page using event listeners also refreshes
    window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));

    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('firm_theme');
    localStorage.removeItem('fcm_saved');
    window.dispatchEvent(new Event('auth:logout'));
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
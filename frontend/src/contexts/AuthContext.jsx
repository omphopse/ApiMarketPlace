import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const restore = async () => {
      const nextUser = await authService.restoreSession();
      if (active) {
        setUser(nextUser);
        setLoading(false);
      }
    };
    restore();
    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const nextUser = await authService.login(credentials);
    setUser(nextUser);
    return nextUser;
  };

  const register = async (data) => {
    const nextUser = await authService.register(data);
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: Boolean(user),
      hasRole: (role) => Boolean(user && authService.hasRole(role))
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

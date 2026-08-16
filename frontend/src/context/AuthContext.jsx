import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { offlineStore } from '../services/offlineStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const offline = import.meta.env.VITE_OFFLINE === 'true';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!offline && window.location.pathname === '/auth/callback') {
        return;
      }

      if (offline) {
        // insecure/offline mode: auto-login (no backend)
        const state = offlineStore.load();
        const data = { token: 'offline-token', user: state.user };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return;
      }
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token === 'offline-token') {
        authService.logout();
        return;
      }

      if (token && storedUser) {
        const data = await authService.verifyToken();
        const verifiedUser = data.user || JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        setUser(verifiedUser);
      }
    } catch (error) {
      console.error('[AuthContext] checkAuth failed:', error);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const startGoogleOAuth = async () => {
    await authService.startGoogleOAuth();
  };

  const completeSupabaseOAuth = React.useCallback(async () => {
    const data = await authService.completeSupabaseOAuth();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const biometricLogin = async (email) => {
    const data = await authService.biometricLogin(email);
    localStorage.setItem('token', data.token);
    // We may not have user payload for passkey login; keep existing if present
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const biometricRegister = async () => {
    const data = await authService.startBiometricRegistration();
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, startGoogleOAuth, completeSupabaseOAuth, biometricLogin, biometricRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

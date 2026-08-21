import api from './api';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { offlineApi } from './offlineApi';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

export const authService = {
  register: async (userData) => {
    if (OFFLINE) return offlineApi.auth.signup(userData);
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    if (OFFLINE) return offlineApi.auth.login(credentials);
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  startGoogleOAuth: async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured for Google login');
    }

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
  },

  completeSupabaseOAuth: async () => {
    if (OFFLINE) return offlineApi.auth.google();
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured for Google login');
    }

    const urlParams = new window.URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');

    if (errorParam) {
      throw new Error(urlParams.get('error_description') || 'Google authentication failed');
    }

    let accessToken;

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        throw error;
      }
      
      accessToken = data?.session?.access_token;
      
      // Clean up the URL to remove the single-use code
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      // Fallback for implicit grant or existing session
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      accessToken = data?.session?.access_token;
    }

    if (!accessToken) {
      throw new Error('Google authentication session was not created');
    }

    const response = await api.post('/auth/supabase', { access_token: accessToken }, { timeout: 120000 });
    return response.data;
  },

  startBiometricRegistration: async () => {
    if (OFFLINE) return { ok: true };
    const { data: options } = await api.post('/webauthn/register/options');
    const attResp = await startRegistration(options);
    const { data } = await api.post('/webauthn/register/verify', attResp);
    return data;
  },

  biometricLogin: async (email) => {
    if (OFFLINE) return offlineApi.auth.login({ email });
    const { data: options } = await api.post('/webauthn/login/options', { email });
    const authResp = await startAuthentication(options);
    const { data } = await api.post('/webauthn/login/verify', { email, userId: options.userId, response: authResp });
    return data;
  },

  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

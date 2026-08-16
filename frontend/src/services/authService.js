import api from './api';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { offlineApi } from './offlineApi';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

const getSafeErrorMessage = (error) => (
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'Unknown error'
);

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
    console.log('[OAuth] start requested');
    console.log('[OAuth] redirect origin:', window.location.origin);

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

    if (error) {
      console.error('[OAuth] start failed:', getSafeErrorMessage(error));
      throw error;
    }

    console.log('[OAuth] start succeeded: true');
  },

  completeSupabaseOAuth: async () => {
    if (OFFLINE) return offlineApi.auth.google();
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured for Google login');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');

    console.log('[OAuth] callback started');
    console.log('[OAuth] code present:', Boolean(code));

    if (errorParam) {
      const errorMessage = urlParams.get('error_description') || 'Google authentication failed';
      console.error('[OAuth] provider returned error:', errorMessage);
      throw new Error(errorMessage);
    }

    let accessToken;

    if (code) {
      console.log('[OAuth] exchange started');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('[OAuth] exchange failed:', getSafeErrorMessage(error));
        throw error;
      }
      
      accessToken = data?.session?.access_token;
      console.log('[OAuth] exchange succeeded:', Boolean(data?.session));
      console.log('[OAuth] session exists:', Boolean(accessToken));
      
      // Clean up the URL to remove the single-use code
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } else {
      // Fallback for implicit grant or existing session
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[OAuth] session lookup failed:', getSafeErrorMessage(error));
        throw error;
      }
      accessToken = data?.session?.access_token;
      console.log('[OAuth] session exists:', Boolean(accessToken));
    }

    if (!accessToken) {
      console.error('[OAuth] session missing access token');
      throw new Error('Google authentication session was not created');
    }

    console.log('[OAuth] backend authentication started');
    console.log('[OAuth] backend request URL:', `${api.defaults.baseURL}/auth/supabase`);
    console.log('[OAuth] backend request has access token:', Boolean(accessToken));

    try {
      const response = await api.post('/auth/supabase', { access_token: accessToken });
      console.log('[OAuth] backend authentication succeeded:', response.status >= 200 && response.status < 300);
      console.log('[OAuth] backend response status:', response.status);
      console.log('[OAuth] backend issued app token:', Boolean(response.data?.token));
      console.log('[OAuth] backend returned user:', Boolean(response.data?.user));
      return response.data;
    } catch (error) {
      console.error('[OAuth] backend authentication failed:', getSafeErrorMessage(error));
      console.error('[OAuth] backend response status:', error?.response?.status || 'no-response');
      throw error;
    }
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

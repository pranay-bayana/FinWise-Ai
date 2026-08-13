import api from './api';
import { offlineApi } from './offlineApi';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

export const settingsService = {
  getSettings: async () => {
    if (OFFLINE) return offlineApi.settings.getSettings();
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (data) => {
    if (OFFLINE) return offlineApi.settings.updateSettings(data);
    const response = await api.put('/settings', data);
    return response.data;
  },

  getProfile: async () => {
    if (OFFLINE) return offlineApi.settings.getProfile();
    const response = await api.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    if (OFFLINE) return offlineApi.settings.updateProfile(data);
    const response = await api.put('/settings/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    if (OFFLINE) return offlineApi.settings.changePassword(data);
    const response = await api.put('/settings/password', data);
    return response.data;
  },
};

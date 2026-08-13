import api from './api';
import { offlineApi } from './offlineApi';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

export const notificationService = {
  getAllNotifications: async (params) => {
    if (OFFLINE) return { notifications: offlineApi.notifications.list(params) };
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  createNotification: async (data) => {
    if (OFFLINE) return offlineApi.notifications.create(data);
    const response = await api.post('/notifications', data);
    return response.data;
  },

  markAsRead: async (id) => {
    if (OFFLINE) return offlineApi.notifications.markAsRead(id);
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    if (OFFLINE) return offlineApi.notifications.markAllAsRead();
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    if (OFFLINE) return offlineApi.notifications.remove(id);
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  getUnreadCount: async () => {
    if (OFFLINE) return { count: offlineApi.notifications.unreadCount() };
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
};

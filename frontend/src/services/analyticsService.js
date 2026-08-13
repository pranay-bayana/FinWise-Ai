import api from './api';
import { offlineApi } from './offlineApi';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

export const analyticsService = {
  getDashboardAnalytics: async (params) => {
    if (OFFLINE) return offlineApi.analytics.dashboard(params);
    const response = await api.get('/analytics/dashboard', { params });
    return response.data;
  },

  getMonthlyTrends: async (params) => {
    if (OFFLINE) return offlineApi.analytics.trends(params);
    const response = await api.get('/analytics/trends', { params });
    return response.data;
  },

  getAIInsights: async () => {
    if (OFFLINE) return offlineApi.analytics.insights();
    const response = await api.get('/analytics/insights');
    return response.data;
  },

  generateAIInsights: async () => {
    if (OFFLINE) return offlineApi.analytics.generateInsights();
    const response = await api.post('/analytics/insights/generate');
    return response.data;
  },

  getFinancialHealthScore: async () => {
    if (OFFLINE) return offlineApi.analytics.healthScore();
    const response = await api.get('/analytics/health-score');
    return response.data;
  },
};

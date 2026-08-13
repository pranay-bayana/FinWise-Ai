import api from './api';

export const aiService = {
  chat: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },
  getMonthlyReport: async () => {
    const response = await api.get('/ai/monthly-report');
    return response.data;
  },
};

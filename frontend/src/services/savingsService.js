import api from './api';

export const savingsService = {
  list: async () => {
    const response = await api.get('/savings-goals');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/savings-goals', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/savings-goals/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/savings-goals/${id}`);
    return response.data;
  },
};

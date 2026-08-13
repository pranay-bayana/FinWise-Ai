import api from './api';

export const billService = {
  list: async () => {
    const response = await api.get('/bills');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/bills', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/bills/${id}`, data);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },
};

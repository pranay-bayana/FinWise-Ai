import api from './api';

export const transactionService = {
  getAllTransactions: async (params) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  getSummary: async (params) => {
    const response = await api.get('/transactions/summary', { params });
    return response.data;
  },
};

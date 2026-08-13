import api from './api';
import { offlineApi } from './offlineApi';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

const categories = [
  { id: 'salary', name: 'Salary', icon: '💼' },
  { id: 'freelancing', name: 'Freelancing', icon: '💻' },
  { id: 'interest', name: 'Interest', icon: '🏦' },
  { id: 'dividend', name: 'Dividend', icon: '📈' },
  { id: 'business', name: 'Business', icon: '🏢' },
  { id: 'side-income', name: 'Side Income', icon: '💸' },
  { id: 'gifts', name: 'Gifts', icon: '🎁' },
  { id: 'other', name: 'Other', icon: '➕' },
];

export const incomeService = {
  getAllIncome: async (params) => {
    if (OFFLINE) {
      const tx = offlineApi.transactions.list().filter((t) => t.type === 'income');
      return { income: tx };
    }
    const response = await api.get('/income', { params });
    return response.data;
  },

  createIncome: async (data) => {
    if (OFFLINE) {
      const tx = offlineApi.transactions.create({
        type: 'income',
        amount: Number(data.amount),
        category: data.category,
        description: data.description ?? null,
        notes: data.notes ?? null,
        transaction_date: data.transactionDate,
      });
      return { income: tx };
    }
    const response = await api.post('/income', data);
    return response.data;
  },

  updateIncome: async (id, data) => {
    if (OFFLINE) {
      const tx = offlineApi.transactions.update(id, {
        amount: data.amount !== undefined ? Number(data.amount) : undefined,
        category: data.category,
        description: data.description,
        notes: data.notes,
        transaction_date: data.transactionDate,
      });
      return { income: tx };
    }
    const response = await api.put(`/income/${id}`, data);
    return response.data;
  },

  deleteIncome: async (id) => {
    if (OFFLINE) return offlineApi.transactions.remove(id);
    const response = await api.delete(`/income/${id}`);
    return response.data;
  },

  getIncomeCategories: async () => {
    if (OFFLINE) return { categories };
    const response = await api.get('/income/categories');
    return response.data;
  },

  createIncomeCategory: async (data) => {
    const response = await api.post('/income/categories', data);
    return response.data;
  },
};

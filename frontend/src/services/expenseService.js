import api from './api';
import { offlineApi } from './offlineApi';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

const categories = [
  { id: 'food', name: 'Food', icon: '🍽️' },
  { id: 'travel', name: 'Travel', icon: '🚕' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'emi', name: 'EMI', icon: '🏦' },
  { id: 'bills', name: 'Bills', icon: '🧾' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'fuel', name: 'Fuel', icon: '⛽' },
];

export const expenseService = {
  getAllExpenses: async (params) => {
    if (OFFLINE) {
      const tx = offlineApi.transactions.list().filter((t) => t.type === 'expense');
      return { expenses: tx };
    }
    const response = await api.get('/expenses', { params });
    return response.data;
  },

  createExpense: async (data) => {
    if (OFFLINE) {
      const tx = offlineApi.transactions.create({
        type: 'expense',
        amount: Number(data.amount),
        category: data.category,
        description: data.description ?? null,
        notes: data.notes ?? null,
        transaction_date: data.transactionDate,
        merchant_name: data.merchantName ?? null,
        payment_method: data.paymentMethod ?? null,
      });
      return { expense: tx };
    }
    const response = await api.post('/expenses', data);
    return response.data;
  },

  updateExpense: async (id, data) => {
    if (OFFLINE) {
      const tx = offlineApi.transactions.update(id, {
        amount: data.amount !== undefined ? Number(data.amount) : undefined,
        category: data.category,
        description: data.description,
        notes: data.notes,
        transaction_date: data.transactionDate,
        merchant_name: data.merchantName,
        payment_method: data.paymentMethod,
      });
      return { expense: tx };
    }
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id) => {
    if (OFFLINE) return offlineApi.transactions.remove(id);
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getExpensesByCategory: async (params) => {
    const response = await api.get('/expenses/by-category', { params });
    return response.data;
  },

  getExpenseCategories: async () => {
    if (OFFLINE) return { categories };
    const response = await api.get('/expenses/categories');
    return response.data;
  },

  createExpenseCategory: async (data) => {
    const response = await api.post('/expenses/categories', data);
    return response.data;
  },
};

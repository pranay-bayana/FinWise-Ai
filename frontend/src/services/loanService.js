import api from './api';
import { offlineApi } from './offlineApi';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

export const loanService = {
  getAllLoans: async (params) => {
    if (OFFLINE) return { loans: offlineApi.loans.list(params) };
    const response = await api.get('/loans', { params });
    return response.data;
  },

  createLoan: async (data) => {
    if (OFFLINE) return offlineApi.loans.create(data);
    const response = await api.post('/loans', data);
    return response.data;
  },

  updateLoan: async (id, data) => {
    if (OFFLINE) return offlineApi.loans.update(id, data);
    const response = await api.put(`/loans/${id}`, data);
    return response.data;
  },

  deleteLoan: async (id) => {
    if (OFFLINE) return offlineApi.loans.remove(id);
    const response = await api.delete(`/loans/${id}`);
    return response.data;
  },

  getLoanSummary: async () => {
    if (OFFLINE) return offlineApi.loans.summary();
    const response = await api.get('/loans/summary');
    return response.data;
  },

  getLoanPayments: async (loanId) => {
    if (OFFLINE) return { payments: offlineApi.loans.payments(loanId) };
    const response = await api.get(`/loans/${loanId}/payments`);
    return response.data;
  },

  createLoanPayment: async (loanId, data) => {
    if (OFFLINE) return offlineApi.loans.createPayment(loanId, data);
    const response = await api.post(`/loans/${loanId}/payments`, data);
    return response.data;
  },
};

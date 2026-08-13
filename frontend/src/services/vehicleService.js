import api from './api';
import { offlineApi } from './offlineApi';

const OFFLINE = import.meta.env.VITE_OFFLINE === 'true';

export const vehicleService = {
  getAllVehicles: async () => {
    if (OFFLINE) return { vehicles: offlineApi.vehicles.list() };
    const response = await api.get('/vehicles');
    return response.data;
  },

  createVehicle: async (data) => {
    if (OFFLINE) return offlineApi.vehicles.create(data);
    const response = await api.post('/vehicles', data);
    return response.data;
  },

  updateVehicle: async (id, data) => {
    if (OFFLINE) return offlineApi.vehicles.update(id, data);
    const response = await api.put(`/vehicles/${id}`, data);
    return response.data;
  },

  deleteVehicle: async (id) => {
    if (OFFLINE) return offlineApi.vehicles.remove(id);
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },

  getVehicleExpenses: async (vehicleId) => {
    if (OFFLINE) return { expenses: offlineApi.vehicles.expenses(vehicleId) };
    const response = await api.get(`/vehicles/${vehicleId}/expenses`);
    return response.data;
  },

  createVehicleExpense: async (vehicleId, data) => {
    if (OFFLINE) return offlineApi.vehicles.createExpense(vehicleId, data);
    const response = await api.post(`/vehicles/${vehicleId}/expenses`, data);
    return response.data;
  },

  getVehicleReminders: async (vehicleId) => {
    if (OFFLINE) return { reminders: offlineApi.vehicles.reminders(vehicleId) };
    const response = await api.get(`/vehicles/${vehicleId}/reminders`);
    return response.data;
  },

  createVehicleReminder: async (vehicleId, data) => {
    if (OFFLINE) return offlineApi.vehicles.createReminder(vehicleId, data);
    const response = await api.post(`/vehicles/${vehicleId}/reminders`, data);
    return response.data;
  },

  getVehicleAnalytics: async (vehicleId) => {
    if (OFFLINE) return offlineApi.vehicles.analytics(vehicleId);
    const response = await api.get(`/vehicles/${vehicleId}/analytics`);
    return response.data;
  },
};

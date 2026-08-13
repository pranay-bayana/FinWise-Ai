const KEY = 'finwise_offline_v2';

const defaultState = {
  user: { id: 'offline-user', email: 'offline@local', full_name: 'Offline User' },
  transactions: [],
  settings: {
    notificationsEnabled: true,
    budgetAlerts: true,
    theme: 'system',
  },
  notifications: [],
  loans: [],
  loan_payments: [],
  vehicles: [],
  vehicle_expenses: [],
  vehicle_reminders: [],
  ai_insights: [],
};

export const offlineStore = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(defaultState);
      return JSON.parse(raw);
    } catch {
      return structuredClone(defaultState);
    }
  },
  save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
  },
  reset() {
    localStorage.removeItem(KEY);
  },
};

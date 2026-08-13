import { offlineStore } from './offlineStore';

const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `id_${Date.now()}_${Math.random()}`);

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const monthLabel = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const ymd = (d) => d.toISOString().slice(0, 10);

const inRange = (dateStr, startStr, endStr) => dateStr >= startStr && dateStr <= endStr;

export const offlineApi = {
  auth: {
    login() {
      const state = offlineStore.load();
      return { token: 'offline-token', user: state.user };
    },
    signup() {
      const state = offlineStore.load();
      return { token: 'offline-token', user: state.user };
    },
    google() {
      const state = offlineStore.load();
      return { token: 'offline-token', user: state.user };
    },
  },
  settings: {
    getSettings() {
      const state = offlineStore.load();
      return { settings: state.settings || {} };
    },
    updateSettings(patch) {
      const state = offlineStore.load();
      state.settings = { ...(state.settings || {}), ...(patch || {}) };
      offlineStore.save(state);
      return { settings: state.settings };
    },
    getProfile() {
      const state = offlineStore.load();
      return { user: state.user };
    },
    updateProfile({ fullName, phone, avatarUrl } = {}) {
      const state = offlineStore.load();
      state.user = {
        ...state.user,
        full_name: fullName ?? state.user.full_name,
        phone: phone ?? state.user.phone,
        avatar_url: avatarUrl ?? state.user.avatar_url,
      };
      offlineStore.save(state);
      return { user: state.user };
    },
    changePassword() {
      return { ok: true };
    },
  },
  notifications: {
    list() {
      const state = offlineStore.load();
      return state.notifications
        .slice()
        .sort((a, b) => (a.notification_date < b.notification_date ? 1 : -1));
    },
    unreadCount() {
      const state = offlineStore.load();
      return state.notifications.filter((n) => !n.is_read).length;
    },
    create({ title, message, notificationDate } = {}) {
      const state = offlineStore.load();
      const notification = {
        id: uid(),
        title: title || 'Notification',
        message: message || '',
        notification_date: notificationDate || new Date().toISOString(),
        is_read: false,
      };
      state.notifications.push(notification);
      offlineStore.save(state);
      return notification;
    },
    markAsRead(id) {
      const state = offlineStore.load();
      const idx = state.notifications.findIndex((n) => n.id === id);
      if (idx === -1) throw new Error('Not found');
      state.notifications[idx] = { ...state.notifications[idx], is_read: true };
      offlineStore.save(state);
      return state.notifications[idx];
    },
    markAllAsRead() {
      const state = offlineStore.load();
      state.notifications = state.notifications.map((n) => ({ ...n, is_read: true }));
      offlineStore.save(state);
      return { ok: true };
    },
    remove(id) {
      const state = offlineStore.load();
      state.notifications = state.notifications.filter((n) => n.id !== id);
      offlineStore.save(state);
      return { ok: true };
    },
  },
  loans: {
    list() {
      const state = offlineStore.load();
      return state.loans.slice().sort((a, b) => (a.start_date < b.start_date ? 1 : -1));
    },
    create(payload) {
      const state = offlineStore.load();
      const loan = {
        id: uid(),
        loan_type: payload.loanType,
        lender_name: payload.lenderName || null,
        borrower_name: payload.borrowerName || null,
        principal_amount: Number(payload.principalAmount || 0),
        interest_rate: payload.interestRate === '' ? null : Number(payload.interestRate),
        interest_type: payload.interestType || 'reducing',
        tenure_months: payload.tenureMonths === '' ? null : Number(payload.tenureMonths),
        start_date: payload.startDate,
        end_date: payload.endDate || null,
        notes: payload.notes || null,
        emi_amount: payload.emiAmount ? Number(payload.emiAmount) : null,
        created_at: new Date().toISOString(),
      };
      state.loans.push(loan);
      offlineStore.save(state);
      return loan;
    },
    update(id, patch) {
      const state = offlineStore.load();
      const idx = state.loans.findIndex((l) => l.id === id);
      if (idx === -1) throw new Error('Not found');
      const existing = state.loans[idx];
      state.loans[idx] = {
        ...existing,
        loan_type: patch.loanType ?? existing.loan_type,
        lender_name: patch.lenderName ?? existing.lender_name,
        borrower_name: patch.borrowerName ?? existing.borrower_name,
        principal_amount: patch.principalAmount !== undefined ? Number(patch.principalAmount || 0) : existing.principal_amount,
        interest_rate: patch.interestRate !== undefined ? (patch.interestRate === '' ? null : Number(patch.interestRate)) : existing.interest_rate,
        interest_type: patch.interestType ?? existing.interest_type,
        tenure_months: patch.tenureMonths !== undefined ? (patch.tenureMonths === '' ? null : Number(patch.tenureMonths)) : existing.tenure_months,
        start_date: patch.startDate ?? existing.start_date,
        end_date: patch.endDate ?? existing.end_date,
        notes: patch.notes ?? existing.notes,
      };
      offlineStore.save(state);
      return state.loans[idx];
    },
    remove(id) {
      const state = offlineStore.load();
      state.loans = state.loans.filter((l) => l.id !== id);
      state.loan_payments = state.loan_payments.filter((p) => p.loan_id !== id);
      offlineStore.save(state);
      return { ok: true };
    },
    payments(loanId) {
      const state = offlineStore.load();
      return state.loan_payments
        .filter((p) => p.loan_id === loanId)
        .slice()
        .sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1));
    },
    createPayment(loanId, payload) {
      const state = offlineStore.load();
      const payment = {
        id: uid(),
        loan_id: loanId,
        amount: Number(payload.amount || 0),
        payment_date: payload.paymentDate,
        notes: payload.notes || null,
        created_at: new Date().toISOString(),
      };
      state.loan_payments.push(payment);
      offlineStore.save(state);
      return payment;
    },
    summary() {
      const state = offlineStore.load();
      const taken = state.loans.filter((l) => l.loan_type === 'taken');
      const given = state.loans.filter((l) => l.loan_type === 'given');
      const totalLoansTaken = sum(taken.map((l) => Number(l.principal_amount || 0)));
      const totalLoansGiven = sum(given.map((l) => Number(l.principal_amount || 0)));
      const totalEMIDue = sum(state.loans.map((l) => Number(l.emi_amount || 0)));
      return { summary: { totalLoansTaken, totalLoansGiven, totalEMIDue } };
    },
  },
  vehicles: {
    list() {
      const state = offlineStore.load();
      return state.vehicles.slice().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    },
    create(payload) {
      const state = offlineStore.load();
      const vehicle = {
        id: uid(),
        vehicle_name: payload.vehicleName,
        vehicle_type: payload.vehicleType || 'car',
        registration_number: payload.registrationNumber || null,
        purchase_date: payload.purchaseDate || null,
        purchase_price: payload.purchasePrice === '' ? null : Number(payload.purchasePrice),
        current_mileage: payload.currentMileage === '' ? null : Number(payload.currentMileage),
        fuel_type: payload.fuelType || 'petrol',
        created_at: new Date().toISOString(),
      };
      state.vehicles.push(vehicle);
      offlineStore.save(state);
      return vehicle;
    },
    update(id, patch) {
      const state = offlineStore.load();
      const idx = state.vehicles.findIndex((v) => v.id === id);
      if (idx === -1) throw new Error('Not found');
      const existing = state.vehicles[idx];
      state.vehicles[idx] = {
        ...existing,
        vehicle_name: patch.vehicleName ?? existing.vehicle_name,
        vehicle_type: patch.vehicleType ?? existing.vehicle_type,
        registration_number: patch.registrationNumber ?? existing.registration_number,
        purchase_date: patch.purchaseDate ?? existing.purchase_date,
        purchase_price: patch.purchasePrice !== undefined ? (patch.purchasePrice === '' ? null : Number(patch.purchasePrice)) : existing.purchase_price,
        current_mileage: patch.currentMileage !== undefined ? (patch.currentMileage === '' ? null : Number(patch.currentMileage)) : existing.current_mileage,
        fuel_type: patch.fuelType ?? existing.fuel_type,
      };
      offlineStore.save(state);
      return state.vehicles[idx];
    },
    remove(id) {
      const state = offlineStore.load();
      state.vehicles = state.vehicles.filter((v) => v.id !== id);
      state.vehicle_expenses = state.vehicle_expenses.filter((e) => e.vehicle_id !== id);
      state.vehicle_reminders = state.vehicle_reminders.filter((r) => r.vehicle_id !== id);
      offlineStore.save(state);
      return { ok: true };
    },
    expenses(vehicleId) {
      const state = offlineStore.load();
      return state.vehicle_expenses
        .filter((e) => e.vehicle_id === vehicleId)
        .slice()
        .sort((a, b) => (a.expense_date < b.expense_date ? 1 : -1));
    },
    createExpense(vehicleId, payload) {
      const state = offlineStore.load();
      const expense = {
        id: uid(),
        vehicle_id: vehicleId,
        expense_type: payload.expenseType,
        amount: Number(payload.amount || 0),
        mileage: payload.mileage === '' ? null : Number(payload.mileage),
        fuel_liters: payload.fuelLiters === '' ? null : Number(payload.fuelLiters),
        expense_date: payload.expenseDate,
        description: payload.description || null,
        receipt_url: payload.receiptUrl || null,
        created_at: new Date().toISOString(),
      };
      state.vehicle_expenses.push(expense);
      offlineStore.save(state);
      return expense;
    },
    reminders(vehicleId) {
      const state = offlineStore.load();
      return state.vehicle_reminders
        .filter((r) => r.vehicle_id === vehicleId)
        .slice()
        .sort((a, b) => (a.due_date < b.due_date ? 1 : -1));
    },
    createReminder(vehicleId, payload) {
      const state = offlineStore.load();
      const reminder = {
        id: uid(),
        vehicle_id: vehicleId,
        reminder_type: payload.reminderType,
        due_date: payload.dueDate,
        notes: payload.notes || null,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      state.vehicle_reminders.push(reminder);
      offlineStore.save(state);
      return reminder;
    },
    analytics(vehicleId) {
      const expenses = this.expenses(vehicleId);
      const totalFuelCost = sum(expenses.filter((e) => e.expense_type === 'fuel').map((e) => Number(e.amount || 0)));
      const totalServiceCost = sum(expenses.filter((e) => e.expense_type === 'service').map((e) => Number(e.amount || 0)));
      const totalInsuranceCost = sum(expenses.filter((e) => e.expense_type === 'insurance').map((e) => Number(e.amount || 0)));
      const fuelExpenses = expenses.filter((e) => e.expense_type === 'fuel' && Number(e.fuel_liters || 0) > 0 && Number(e.mileage || 0) > 0);
      const averageMileage =
        fuelExpenses.length > 0
          ? sum(fuelExpenses.map((e) => Number(e.mileage || 0))) / sum(fuelExpenses.map((e) => Number(e.fuel_liters || 0)))
          : 0;
      return { analytics: { totalFuelCost, totalServiceCost, totalInsuranceCost, averageMileage } };
    },
  },
  analytics: {
    dashboard() {
      const state = offlineStore.load();
      const now = new Date();
      const start = ymd(startOfMonth(now));
      const end = ymd(endOfMonth(now));
      const tx = state.transactions.filter((t) => inRange(t.transaction_date, start, end));
      const expenses = tx.filter((t) => t.type === 'expense');
      const income = tx.filter((t) => t.type === 'income');
      const totalExpenses = sum(expenses.map((t) => Number(t.amount || 0)));
      const totalIncome = sum(income.map((t) => Number(t.amount || 0)));
      const totalSavings = totalIncome - totalExpenses;
      const categoryBreakdown = {};
      for (const e of expenses) categoryBreakdown[e.category || 'Other'] = (categoryBreakdown[e.category || 'Other'] || 0) + Number(e.amount || 0);
      const healthScore = totalIncome > 0 ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100))) : 0;
      return {
        totalIncome,
        totalExpenses,
        totalSavings,
        savingsRate: totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0,
        categoryBreakdown,
        healthScore,
      };
    },
    trends({ months = 6 } = {}) {
      const state = offlineStore.load();
      const now = new Date();
      const ranges = Array.from({ length: months }, (_, i) => {
        const dt = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 15);
        const start = ymd(startOfMonth(dt));
        const end = ymd(endOfMonth(dt));
        return { start, end, label: monthLabel(dt) };
      });
      const trends = ranges.map((r) => {
        const tx = state.transactions.filter((t) => inRange(t.transaction_date, r.start, r.end));
        const income = sum(tx.filter((t) => t.type === 'income').map((t) => Number(t.amount || 0)));
        const expenses = sum(tx.filter((t) => t.type === 'expense').map((t) => Number(t.amount || 0)));
        return { month: r.label, income, expenses, savings: income - expenses };
      });
      return { trends };
    },
    insights() {
      const state = offlineStore.load();
      return { insights: state.ai_insights };
    },
    generateInsights() {
      const state = offlineStore.load();
      const dash = this.dashboard();
      const insights = [];
      if (dash.totalIncome > 0 && dash.savingsRate < 10) {
        insights.push({
          id: uid(),
          title: 'Low savings rate',
          description: `Your savings rate is ~${Math.max(0, Math.round(dash.savingsRate))}%. Try setting a monthly budget for top categories.`,
          priority: 'high',
          created_at: new Date().toISOString(),
        });
      }
      state.ai_insights = [...insights, ...state.ai_insights].slice(0, 20);
      offlineStore.save(state);
      return { ok: true, count: insights.length };
    },
    healthScore() {
      const dash = this.dashboard();
      return {
        score: {
          score: dash.healthScore,
          savings_rate: dash.savingsRate,
          debt_ratio: 18,
          budget_discipline: dash.savingsRate > 20 ? 92 : 74,
        },
      };
    },
  },
  transactions: {
    list() {
      const state = offlineStore.load();
      return state.transactions.slice().sort((a, b) => (a.transaction_date < b.transaction_date ? 1 : -1));
    },
    create(payload) {
      const state = offlineStore.load();
      const tx = { id: uid(), ...payload };
      state.transactions.push(tx);
      offlineStore.save(state);
      return tx;
    },
    update(id, patch) {
      const state = offlineStore.load();
      const idx = state.transactions.findIndex((t) => t.id === id);
      if (idx === -1) throw new Error('Not found');
      state.transactions[idx] = { ...state.transactions[idx], ...patch };
      offlineStore.save(state);
      return state.transactions[idx];
    },
    remove(id) {
      const state = offlineStore.load();
      state.transactions = state.transactions.filter((t) => t.id !== id);
      offlineStore.save(state);
      return { ok: true };
    },
  },
};

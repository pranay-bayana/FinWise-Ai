import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Plus, Trash2, WalletCards } from 'lucide-react';
import toast from 'react-hot-toast';
import { budgetService } from '../services/budgetService';
import { analyticsService } from '../services/analyticsService';
import { currency } from '../utils/currency';
import { sameCategory } from '../utils/category';
import { EmptyStateExpenses } from '../assets/images/empty-states/EmptyStateIllustrations.jsx';

const today = () => new Date().toISOString().slice(0, 10);

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'Food', amount: '', period: 'monthly', startDate: today() });

  const load = async () => {
    try {
      const [budgetData, analyticsData] = await Promise.all([
        budgetService.list(),
        analyticsService.getDashboardAnalytics(),
      ]);
      setBudgets(budgetData.budgets || []);
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const spentByCategory = useMemo(() => analytics?.categoryBreakdown || {}, [analytics]);
  const spentForCategory = (category) => {
    const match = Object.entries(spentByCategory).find(([name]) => sameCategory(name, category));
    return Number(match?.[1] || 0);
  };

  const saveBudget = async (event) => {
    event.preventDefault();
    try {
      await budgetService.create(form);
      toast.success('Budget saved');
      setForm({ category: 'Food', amount: '', period: 'monthly', startDate: today() });
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save budget');
    }
  };

  const deleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      try {
        await budgetService.remove(id);
        toast.success('Budget deleted');
        load();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Planner</h1>
        <p className="text-gray-600 dark:text-gray-400">Set monthly and category budgets with overspending alerts.</p>
      </div>

      <form onSubmit={saveBudget} className="card p-5 grid grid-cols-1 md:grid-cols-5 gap-3 md:items-end">
        <label className="block">
          <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
          <select className="input-field mt-1" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
            {['Food', 'Travel', 'Shopping', 'EMI', 'Bills', 'Entertainment', 'Education', 'Health'].map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
          <input className="input-field mt-1" type="number" min="1" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600 dark:text-gray-400">Period</span>
          <select className="input-field mt-1" value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })}>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-gray-600 dark:text-gray-400">Start</span>
          <input className="input-field mt-1" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
        </label>
        <button className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Save
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {budgets.length === 0 ? (
          <div className="card p-10 text-center text-gray-500 dark:text-gray-400 lg:col-span-2 transform scale-90">
            <EmptyStateExpenses message="No budgets yet. Add your first category budget above." />
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = spentForCategory(budget.category);
            const limit = Number(budget.amount || 0);
            const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const nearLimit = percent >= 85;
            return (
              <div key={budget.id} className="card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <WalletCards className="w-5 h-5 text-primary-600 dark:text-primary-300" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 dark:text-white">{budget.category}</h2>
                      <p className="text-sm text-gray-500">{currency(Math.max(0, limit - spent))} remaining</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {nearLimit && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    <button className="p-2 text-gray-400 hover:text-red-600" onClick={() => deleteBudget(budget.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-5 h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className={`h-full rounded-full ${nearLimit ? 'bg-amber-500' : 'bg-secondary-500'}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-3 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{currency(spent)} spent</span>
                  <span>{percent}% of {currency(limit)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Budgets;

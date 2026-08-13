import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2 } from 'lucide-react';
import { savingsService } from '../services/savingsService';
import toast from 'react-hot-toast';
import { EmptyStateSavings } from '../assets/images/empty-states/EmptyStateIllustrations.jsx';
const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '',
    monthlyContribution: '',
    targetDate: ''
  });

  const loadGoals = async () => {
    try {
      const data = await savingsService.list();
      setGoals(data.goals || []);
    } catch (error) {
      toast.error('Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGoal) {
        await savingsService.update(editingGoal.id, formData);
        toast.success('Goal updated successfully');
      } else {
        await savingsService.create(formData);
        toast.success('Goal created successfully');
      }
      setShowModal(false);
      setEditingGoal(null);
      resetForm();
      loadGoals();
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.target_amount,
      savedAmount: goal.saved_amount,
      monthlyContribution: goal.monthly_contribution || '',
      targetDate: goal.target_date || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal? This action cannot be undone.')) {
      try {
        await savingsService.remove(id);
        toast.success('Goal deleted successfully');
        loadGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      savedAmount: '',
      monthlyContribution: '',
      targetDate: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings Goals</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Track targets, saved amount, progress, and completion dates.</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingGoal(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="card p-12 text-center transform scale-90">
          <EmptyStateSavings message="No savings goals yet. Create your first goal to start tracking progress." />
          <div className="mt-4">
            <button
              onClick={() => { resetForm(); setEditingGoal(null); setShowModal(true); }}
              className="btn-primary"
            >
              Create Goal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const percent = goal.target_amount > 0 ? Math.round((goal.saved_amount / goal.target_amount) * 100) : 0;
            return (
              <div key={goal.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h2>
                    {goal.target_date && <p className="text-sm text-gray-500">Target: {new Date(goal.target_date).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(goal)} className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(goal.saved_amount)}</p>
                <p className="text-sm text-gray-500">of {formatCurrency(goal.target_amount)} target</p>
                <div className="mt-4 h-3 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                  <div className="h-full bg-accent-500 rounded-full transition-all" style={{ width: `${Math.min(percent, 100)}%` }} />
                </div>
                <div className="mt-3 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{percent}% complete</span>
                  {goal.monthly_contribution && <span>{formatCurrency(goal.monthly_contribution)}/month</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingGoal ? 'Edit Goal' : 'Add Savings Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="e.g., Emergency Fund"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Amount</label>
                <input
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                  className="input-field"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saved Amount</label>
                <input
                  type="number"
                  value={formData.savedAmount}
                  onChange={(e) => setFormData({ ...formData, savedAmount: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monthly Contribution</label>
                <input
                  type="number"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData({ ...formData, monthlyContribution: e.target.value })}
                  className="input-field"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingGoal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;

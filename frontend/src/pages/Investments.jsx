import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';
import { investmentService } from '../services/investmentService';
import toast from 'react-hot-toast';
import { EmptyStateInvestments } from '../assets/images/empty-states/EmptyStateIllustrations.jsx';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [formData, setFormData] = useState({
    investmentType: '',
    name: '',
    investedAmount: '',
    currentValue: '',
    notes: ''
  });

  const loadInvestments = async () => {
    try {
      const data = await investmentService.list();
      setInvestments(data.investments || []);
    } catch (error) {
      toast.error('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvestment) {
        await investmentService.update(editingInvestment.id, formData);
        toast.success('Investment updated successfully');
      } else {
        await investmentService.create(formData);
        toast.success('Investment added successfully');
      }
      setShowModal(false);
      setEditingInvestment(null);
      resetForm();
      loadInvestments();
    } catch (error) {
      toast.error('Failed to save investment');
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setFormData({
      investmentType: investment.investment_type,
      name: investment.name,
      investedAmount: investment.invested_amount,
      currentValue: investment.current_value,
      notes: investment.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment? This action cannot be undone.')) {
      try {
        await investmentService.remove(id);
        toast.success('Investment deleted successfully');
        loadInvestments();
      } catch (error) {
        toast.error('Failed to delete investment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      investmentType: '',
      name: '',
      investedAmount: '',
      currentValue: '',
      notes: ''
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investment Tracker</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Stocks, mutual funds, gold, crypto, and fixed deposits.</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingInvestment(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Investment
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="card p-12 text-center transform scale-90">
          <EmptyStateInvestments message="No investments yet. Start tracking your investments to monitor your portfolio." />
          <div className="mt-4">
            <button
              onClick={() => { resetForm(); setEditingInvestment(null); setShowModal(true); }}
              className="btn-primary"
            >
              Add Investment
            </button>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {investments.map((item) => {
              const pnl = item.current_value - item.invested_amount;
              const pnlPercent = item.invested_amount > 0 ? ((pnl / item.invested_amount) * 100).toFixed(2) : 0;
              return (
                <div key={item.id} className="p-5 grid grid-cols-1 md:grid-cols-5 gap-3 md:items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">{item.name}</span>
                      <span className="text-xs text-gray-500">{item.investment_type}</span>
                    </div>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">Invested {formatCurrency(item.invested_amount)}</span>
                  <span className="text-gray-900 dark:text-white">Current {formatCurrency(item.current_value)}</span>
                  <span className={pnl >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)} ({pnl >= 0 ? '+' : ''}{pnlPercent}%)
                  </span>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => handleEdit(item)} className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingInvestment ? 'Edit Investment' : 'Add Investment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Investment Type</label>
                <select
                  value={formData.investmentType}
                  onChange={(e) => setFormData({ ...formData, investmentType: e.target.value })}
                  required
                  className="input-field"
                >
                  <option value="">Select type</option>
                  <option value="Stocks">Stocks</option>
                  <option value="Mutual Funds">Mutual Funds</option>
                  <option value="Gold">Gold</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Fixed Deposit">Fixed Deposit</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                  placeholder="e.g., Index Fund"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invested Amount</label>
                <input
                  type="number"
                  value={formData.investedAmount}
                  onChange={(e) => setFormData({ ...formData, investedAmount: e.target.value })}
                  required
                  className="input-field"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Value</label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                  required
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="input-field"
                  rows="2"
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingInvestment ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;

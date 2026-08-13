import React, { useState, useEffect } from 'react';
import { BellRing, Plus, Edit2, Trash2 } from 'lucide-react';
import { billService } from '../services/billService';
import toast from 'react-hot-toast';
import { EmptyStateBills } from '../assets/images/empty-states/EmptyStateIllustrations.jsx';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState({
    billName: '',
    amount: '',
    dueDate: '',
    status: 'scheduled',
    notes: ''
  });

  const loadBills = async () => {
    try {
      const data = await billService.list();
      setBills(data.bills || []);
    } catch (error) {
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBill) {
        await billService.update(editingBill.id, formData);
        toast.success('Bill updated successfully');
      } else {
        await billService.create(formData);
        toast.success('Bill added successfully');
      }
      setShowModal(false);
      setEditingBill(null);
      resetForm();
      loadBills();
    } catch (error) {
      toast.error('Failed to save bill');
    }
  };

  const handleEdit = (bill) => {
    setEditingBill(bill);
    setFormData({
      billName: bill.bill_name,
      amount: bill.amount,
      dueDate: bill.due_date,
      status: bill.status,
      notes: bill.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      try {
        await billService.remove(id);
        toast.success('Bill deleted successfully');
        loadBills();
      } catch (error) {
        toast.error('Failed to delete bill');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      billName: '',
      amount: '',
      dueDate: '',
      status: 'scheduled',
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

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bills Reminder</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Electricity, water, internet, mobile, cards, and insurance reminders.</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingBill(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Bill
        </button>
      </div>

      {bills.length === 0 ? (
        <div className="card p-12 text-center transform scale-90">
          <EmptyStateBills message="No bills yet. Add your bills to track due dates and avoid late payments." />
          <div className="mt-4">
            <button
              onClick={() => { resetForm(); setEditingBill(null); setShowModal(true); }}
              className="btn-primary"
            >
              Add Bill
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {bills.map((bill) => (
            <div key={bill.id} className="card p-5">
              <div className="flex items-center justify-between">
                <BellRing className={`w-5 h-5 ${isOverdue(bill.due_date) && bill.status !== 'paid' ? 'text-red-600' : 'text-primary-600'}`} />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  bill.status === 'paid' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : isOverdue(bill.due_date)
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {bill.status}
                </span>
              </div>
              <h2 className="mt-4 font-semibold text-gray-900 dark:text-white">{bill.bill_name}</h2>
              <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(bill.amount)}</p>
              <p className={`mt-2 text-sm ${isOverdue(bill.due_date) && bill.status !== 'paid' ? 'text-red-600' : 'text-gray-500'}`}>
                Due on {new Date(bill.due_date).toLocaleDateString()}
              </p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => handleEdit(bill)} className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(bill.id)} className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {editingBill ? 'Edit Bill' : 'Add Bill'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill Name</label>
                <input
                  type="text"
                  value={formData.billName}
                  onChange={(e) => setFormData({ ...formData, billName: e.target.value })}
                  required
                  className="input-field"
                  placeholder="e.g., Electricity Bill"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="input-field"
                  placeholder="2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
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
                  {editingBill ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;

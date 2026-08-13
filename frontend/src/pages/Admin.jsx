import React, { useState, useEffect } from 'react';
import { Shield, Users, DollarSign, FileText, TrendingUp } from 'lucide-react';
import { adminService } from '../services/adminService';
import toast from 'react-hot-toast';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
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

  const metrics = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Total Transactions', value: stats?.totalTransactions || 0, icon: FileText, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Budgets', value: stats?.totalBudgets || 0, icon: DollarSign, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Total Loans', value: stats?.totalLoans || 0, icon: TrendingUp, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Manage users, analytics, categories, revenue, and notifications.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="card p-5">
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <p className="mt-4 text-sm text-gray-500">{metric.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value.toLocaleString()}</p>
          </div>
        ))}
      </div>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Platform Income</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.platformIncome)}</p>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Platform Expenses</h3>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.platformExpenses)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

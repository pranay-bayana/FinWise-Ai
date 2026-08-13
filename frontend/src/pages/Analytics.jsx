import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';
import { BarChart3, TrendingUp, TrendingDown, Sparkles, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AnalyticsHeader } from '../assets/images/analytics/AnalyticsHeader.jsx';
import { EmptyStateDefault } from '../assets/images/empty-states/EmptyStateIllustrations.jsx';

const COLORS = ['#0ea5e9', '#d946ef', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [healthScore, setHealthScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const [analyticsData, trendsData, insightsData, scoreData] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        analyticsService.getMonthlyTrends({ months: 6 }),
        analyticsService.getAIInsights(),
        analyticsService.getFinancialHealthScore()
      ]);

      setAnalytics(analyticsData);
      setTrends(trendsData.trends);
      setInsights(insightsData.insights || []);
      setHealthScore(scoreData.score);
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      await analyticsService.generateAIInsights();
      toast.success('Insights generated successfully');
      fetchAnalyticsData();
    } catch (error) {
      toast.error('Failed to generate insights');
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

  const hasFinancialData =
    Number(analytics?.totalIncome || 0) > 0 ||
    Number(analytics?.totalExpenses || 0) > 0 ||
    Number(analytics?.totalSavings || 0) > 0;
  const trendData = trends.filter((row) => Number(row.income || 0) > 0 || Number(row.expenses || 0) > 0 || Number(row.savings || 0) > 0);
  const pieChartData = Object.entries(analytics?.categoryBreakdown || {})
    .map(([name, value]) => ({ name, value }))
    .filter((item) => Number(item.value) > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <AnalyticsHeader className="w-full h-auto max-h-[160px] object-cover rounded-3xl" />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Deep insights into your finances</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateInsights}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate Insights
          </button>
        </div>
      </div>

      {/* Financial Health Score */}
      {hasFinancialData && healthScore && (
        <div className="card p-6 bg-gradient-to-r from-purple-500 to-pink-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Financial Health Score</p>
              <p className="text-4xl font-bold text-white mt-1">
                {healthScore.score || 0}
                <span className="text-lg text-purple-200">/100</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">Savings Rate</p>
              <p className="text-2xl font-bold text-white">
                {healthScore.savings_rate?.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {!hasFinancialData && (
        <div className="card p-8 text-center">
          <EmptyStateDefault message="No data available yet. Start adding transactions to see analytics." />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Income</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(analytics?.totalIncome || 0)}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(analytics?.totalExpenses || 0)}
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics?.savingsRate?.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Income vs Expenses
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyStateDefault message="No data available yet. Start adding transactions to see analytics." />
          )}
        </div>

        {/* Expense by Category */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expenses by Category
          </h3>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyStateDefault message="No data available yet. Start adding transactions to see analytics." />
          )}
        </div>
      </div>

      {/* Savings Trend */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Savings Trend
        </h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="savings" stroke="#0ea5e9" strokeWidth={2} name="Savings" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyStateDefault message="No data available yet. Start adding transactions to see analytics." />
        )}
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 rounded-lg border ${
                  insight.priority === 'high'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : insight.priority === 'medium'
                    ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                    : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                }`}
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {insight.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                  {new Date(insight.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

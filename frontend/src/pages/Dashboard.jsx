import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';
import {
  TrendingUp, TrendingDown, Wallet, Landmark, Plus,
  ArrowUpRight, ArrowDownRight, Bell, Sparkles, Target,
  BarChart3, Bot, LineChart
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { DashboardHero } from '../assets/images/dashboard/DashboardHero.jsx';
import { EmptyStateDefault } from '../assets/images/empty-states/EmptyStateIllustrations.jsx';

const COLORS = ['#14b8a6', '#a855f7', '#ec4899', '#f59e0b', '#ef4444', '#3b82f6', '#06b6d4', '#10b981'];

/* ─── Circular Health Score ─── */
const HealthRing = ({ score = 0 }) => {
  const r = 54, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="7" className="stroke-gray-100 dark:stroke-white/[0.06]" />
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="7" stroke={color} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="ring-animate" style={{ '--circumference': circ }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
        <span className="text-[10px] text-gray-400 font-medium">Health</span>
      </div>
    </div>
  );
};

/* ─── Stat Mini Card ─── */
const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="stat-card group">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-sm`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      {trend && (
        <span className={`ml-auto text-[11px] font-semibold flex items-center gap-0.5 ${trend === 'up' ? 'text-green-500' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        </span>
      )}
    </div>
    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
    <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

/* ─── Quick Action ─── */
const QuickAction = ({ icon: Icon, label, href, gradient }) => (
  <Link to={href} className="flex flex-col items-center gap-2 group">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${gradient} shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{label}</span>
  </Link>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const withTimeout = (promise, ms, label) => {
    let tid;
    const timeout = new Promise((_, rej) => { tid = setTimeout(() => rej(new Error(`${label} timed out`)), ms); });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(tid));
  };

  const fetchDashboardData = async () => {
    try {
      setLoadError(null);
      const [ad, td, id] = await Promise.all([
        withTimeout(analyticsService.getDashboardAnalytics(), 4000, 'Analytics'),
        withTimeout(analyticsService.getMonthlyTrends({ months: 6 }), 4000, 'Trends'),
        withTimeout(analyticsService.getAIInsights(), 4000, 'Insights'),
      ]);
      setAnalytics(ad);
      setTrends(td.trends);
      setInsights(id.insights || []);
    } catch (err) {
      toast.error('Failed to load dashboard');
      setLoadError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
    </div>
  );

  if (loadError) return (
    <div className="card p-6 text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{loadError}</p>
      <button onClick={fetchDashboardData} className="btn-primary">Retry</button>
    </div>
  );

  const pieData = Object.entries(analytics?.categoryBreakdown || {})
    .map(([name, value]) => ({ name, value }))
    .filter((item) => Number(item.value) > 0);
  const trendData = trends.filter((row) => Number(row.income || 0) > 0 || Number(row.expenses || 0) > 0 || Number(row.savings || 0) > 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <DashboardHero className="w-full h-auto max-h-[240px] md:max-h-[300px] object-cover rounded-3xl" />
      
      {/* Hero: Health Score + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Health Score */}
        <div className="card p-5 lg:col-span-1 flex flex-col items-center justify-center">
          <HealthRing score={analytics?.healthScore || 0} />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">Financial Health</p>
        </div>

        {/* Stat Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-5 gap-3 stagger-children">
          <StatCard icon={TrendingUp} label="Income" value={fmt(analytics?.totalIncome || 0)} color="from-emerald-400 to-emerald-600" trend="up" />
          <StatCard icon={TrendingDown} label="Expenses" value={fmt(analytics?.totalExpenses || 0)} color="from-rose-400 to-rose-600" trend="down" />
          <StatCard icon={Wallet} label="Savings" value={fmt(analytics?.totalSavings || 0)} color="from-primary-400 to-primary-600" />
          <StatCard icon={LineChart} label="Investments" value={fmt(analytics?.totalInvestments || 0)} color="from-accent-400 to-accent-600" />
          <StatCard icon={Landmark} label="Loans" value={fmt(analytics?.totalLoans || 0)} color="from-amber-400 to-orange-500" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="flex items-center justify-around">
          <QuickAction icon={TrendingDown} label="Expense" href="/expenses" gradient="from-rose-400 to-rose-600" />
          <QuickAction icon={TrendingUp} label="Income" href="/income" gradient="from-emerald-400 to-emerald-600" />
          <QuickAction icon={Landmark} label="Loans" href="/loans" gradient="from-accent-400 to-accent-600" />
          <QuickAction icon={BarChart3} label="Analytics" href="/analytics" gradient="from-primary-400 to-primary-600" />
          <QuickAction icon={Bot} label="AI" href="/ai-assistant" gradient="from-secondary-400 to-secondary-600" />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Donut */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Spending Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 w-full transform scale-75">
              <EmptyStateDefault message="No spending data yet" />
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Monthly Trends</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trendData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-60 w-full transform scale-75">
              <EmptyStateDefault message="No data available yet. Start adding transactions to see analytics." />
            </div>
          )}
        </div>
      </div>

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Insights</h3>
            <button onClick={() => analyticsService.generateAIInsights().then(fetchDashboardData)} className="ml-auto text-[11px] text-primary-500 hover:text-primary-400 font-medium transition-colors">
              Refresh
            </button>
          </div>
          <div className="space-y-2">
            {insights.slice(0, 4).map((ins) => (
              <div key={ins.id} className={`p-3 rounded-xl border text-sm ${
                ins.priority === 'high' ? 'border-red-500/20 bg-red-500/5' :
                ins.priority === 'medium' ? 'border-amber-500/20 bg-amber-500/5' :
                'border-green-500/20 bg-green-500/5'
              }`}>
                <p className="font-medium text-gray-900 dark:text-white text-[13px]">{ins.title}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{ins.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

// src/controllers/analyticsController.js
import { supabase } from '../services/supabaseClient.js';
import { computeHealthScore, computeMonthlySummary, generateInsights } from '../services/financeAnalytics.js';

const ymd = (d) => d.toISOString().slice(0, 10);

const monthRange = (offset = 0) => {
  const now = new Date();
  const dt = new Date(now.getFullYear(), now.getMonth() + offset, 15);
  const start = new Date(dt.getFullYear(), dt.getMonth(), 1);
  const end = new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
  return { start: ymd(start), end: ymd(end), label: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}` };
};

export const getDashboard = async (req, res) => {
  const userId = req.user.id;
  const current = monthRange(0);

  const [
    { data: tx, error },
    { data: investments, error: investmentsError },
    { data: loans, error: loansError },
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('type, amount, category, transaction_date')
      .eq('user_id', userId)
      .gte('transaction_date', current.start)
      .lte('transaction_date', current.end),
    supabase.from('investments').select('current_value').eq('user_id', userId),
    supabase.from('loans').select('loan_type, remaining_balance, principal_amount, status').eq('user_id', userId).eq('status', 'active'),
  ]);
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  if (investmentsError) return res.status(500).json({ message: 'Fetch failed', details: investmentsError.message });
  if (loansError) return res.status(500).json({ message: 'Fetch failed', details: loansError.message });

  const summary = computeMonthlySummary({ transactions: tx, monthStart: current.start, monthEnd: current.end });

  const breakdown = {};
  for (const c of summary.topCategories) breakdown[c.category] = c.amount;

  const hasFinancialData = summary.totalIncome > 0 || summary.totalExpense > 0;
  const health = hasFinancialData ? computeHealthScore({ totalIncome: summary.totalIncome, totalExpense: summary.totalExpense }) : { score: 0 };

  return res.json({
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpense,
    totalSavings: summary.savings,
    totalInvestments: (investments || []).reduce((sum, row) => sum + Number(row.current_value || 0), 0),
    totalLoans: (loans || [])
      .filter((l) => l.loan_type === 'taken')
      .reduce((sum, row) => sum + Number(row.remaining_balance ?? row.principal_amount ?? 0), 0),
    savingsRate: summary.totalIncome > 0 ? (summary.savings / summary.totalIncome) * 100 : 0,
    categoryBreakdown: breakdown,
    healthScore: health.score,
  });
};

export const getTrends = async (req, res) => {
  const userId = req.user.id;
  const months = Math.max(1, Math.min(12, Number(req.query.months || 6)));

  const ranges = Array.from({ length: months }, (_, i) => monthRange(-(months - 1 - i)));
  const start = ranges[0].start;
  const end = ranges[ranges.length - 1].end;

  const { data: tx, error } = await supabase
    .from('transactions')
    .select('type, amount, transaction_date')
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end);
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });

  const trends = ranges.map((r) => {
    const inRange = tx.filter((t) => t.transaction_date >= r.start && t.transaction_date <= r.end);
    const income = inRange.filter((t) => t.type === 'income').reduce((a, b) => a + Number(b.amount || 0), 0);
    const expenses = inRange.filter((t) => t.type === 'expense').reduce((a, b) => a + Number(b.amount || 0), 0);
    return { month: r.label, income, expenses, savings: income - expenses };
  });

  return res.json({ trends });
};

export const getInsights = async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase
    .from('ai_insights')
    .select('id,insight_type,title,description,priority,is_read,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ insights: data });
};

export const generateAndStoreInsights = async (req, res) => {
  const userId = req.user.id;
  const current = monthRange(0);
  const previous = monthRange(-1);

  const { data: tx, error } = await supabase
    .from('transactions')
    .select('type, amount, category, transaction_date')
    .eq('user_id', userId)
    .gte('transaction_date', previous.start)
    .lte('transaction_date', current.end);
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });

  const cur = computeMonthlySummary({ transactions: tx, monthStart: current.start, monthEnd: current.end });
  const prev = computeMonthlySummary({ transactions: tx, monthStart: previous.start, monthEnd: previous.end });
  const insights = generateInsights({ current: { ...cur, totalIncome: cur.totalIncome }, previous: prev });

  if (insights.length) {
    const payload = insights.map((i) => ({
      user_id: userId,
      insight_type: i.type,
      title: i.title,
      description: i.description,
      priority: i.priority,
    }));
    await supabase.from('ai_insights').insert(payload);
  }

  return res.json({ ok: true, count: insights.length });
};

export const getHealthScore = async (req, res) => {
  const userId = req.user.id;
  const current = monthRange(0);

  const { data: tx, error } = await supabase
    .from('transactions')
    .select('type, amount, transaction_date')
    .eq('user_id', userId)
    .gte('transaction_date', current.start)
    .lte('transaction_date', current.end);
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });

  const income = tx.filter((t) => t.type === 'income').reduce((a, b) => a + Number(b.amount || 0), 0);
  const expense = tx.filter((t) => t.type === 'expense').reduce((a, b) => a + Number(b.amount || 0), 0);
  const health = income > 0 || expense > 0 ? computeHealthScore({ totalIncome: income, totalExpense: expense }) : {
    score: 0,
    savingsRate: 0,
    spendingControl: 0,
    emiRatio: 0,
    loanBurden: 0,
  };
  return res.json({ score: health });
};

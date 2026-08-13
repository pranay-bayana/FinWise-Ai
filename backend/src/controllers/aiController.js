// src/controllers/aiController.js
import { supabase } from '../services/supabaseClient.js';
import { computeHealthScore, computeMonthlySummary, generateInsights } from '../services/financeAnalytics.js';

const ymd = (d) => d.toISOString().slice(0, 10);

const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: ymd(start), end: ymd(end) };
};

export const getMonthlyAIReport = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const currentRange = getMonthRange(now);
  const prevRange = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 15));

  const { data: tx, error } = await supabase
    .from('transactions')
    .select('type, amount, category, transaction_date')
    .eq('user_id', userId)
    .gte('transaction_date', prevRange.start)
    .lte('transaction_date', currentRange.end);
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });

  const current = computeMonthlySummary({
    transactions: tx,
    monthStart: currentRange.start,
    monthEnd: currentRange.end,
  });
  const previous = computeMonthlySummary({
    transactions: tx,
    monthStart: prevRange.start,
    monthEnd: prevRange.end,
  });

  const hasFinancialData = current.totalIncome > 0 || current.totalExpense > 0;
  const health = hasFinancialData ? computeHealthScore({ totalIncome: current.totalIncome, totalExpense: current.totalExpense }) : {
    score: 0,
    savingsRate: 0,
    spendingControl: 0,
    emiRatio: 0,
    loanBurden: 0,
  };
  const insights = generateInsights({ current: { ...current, totalIncome: current.totalIncome }, previous });

  return res.json({
    period: { start: currentRange.start, end: currentRange.end },
    summary: current,
    health,
    insights,
    note: hasFinancialData
      ? 'This report uses an on-device rules engine by default. You can optionally wire an LLM later to rewrite insights in natural language.'
      : 'No data available yet. Start adding transactions to see analytics.',
  });
};

export const chatWithAI = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    // Get recent transactions for context
    const { data: tx, error } = await supabase
      .from('transactions')
      .select('type, amount, category, transaction_date')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(50);

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch transaction data', details: error.message });
    }

    // Compute current financial summary
    const now = new Date();
    const currentRange = getMonthRange(now);
    const current = computeMonthlySummary({
      transactions: tx || [],
      monthStart: currentRange.start,
      monthEnd: currentRange.end,
    });

    const hasFinancialData = current.totalIncome > 0 || current.totalExpense > 0;
    const health = hasFinancialData ? computeHealthScore({ totalIncome: current.totalIncome, totalExpense: current.totalExpense }) : {
      score: 0,
      savingsRate: 0,
      spendingControl: 0,
      emiRatio: 0,
      loanBurden: 0,
    };

    // Simple rule-based AI responses
    let reply = '';
    const lowerMessage = message.toLowerCase();

    if (!hasFinancialData) {
      reply = 'No data available yet. Start adding transactions to see analytics.';
    } else if (lowerMessage.includes('spend') || lowerMessage.includes('expense')) {
      const topCategory = current.topCategories?.[0]?.category || 'None';
      reply = `Your total expenses this month are ${current.totalExpense}. Your highest spending category is ${topCategory}.`;
    } else if (lowerMessage.includes('income') || lowerMessage.includes('earn')) {
      reply = `Your total income this month is ${current.totalIncome}. Your savings rate is ${health.savingsRate}%.`;
    } else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      reply = `You've saved ${current.savings} this month. Your financial health score is ${health.score}/100.`;
    } else if (lowerMessage.includes('health') || lowerMessage.includes('score')) {
      reply = `Your financial health score is ${health.score}/100. ${health.score >= 70 ? 'Great job!' : health.score >= 50 ? 'You\'re doing okay, but there\'s room for improvement.' : 'Consider reducing expenses and increasing savings.'}`;
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('suggest')) {
      reply = `Based on your income of ${current.totalIncome}, consider the 50/30/20 rule: 50% for essentials (${current.totalIncome * 0.5}), 30% for lifestyle (${current.totalIncome * 0.3}), and 20% for savings (${current.totalIncome * 0.2}).`;
    } else {
      reply = `Your financial health score is ${health.score}/100. Income is ${current.totalIncome}, expenses are ${current.totalExpense}, and savings are ${current.savings}. How can I help you with your finances?`;
    }

    return res.json({ reply, answer: reply });
  } catch (error) {
    return res.status(500).json({ message: 'AI chat failed', details: error.message });
  }
};

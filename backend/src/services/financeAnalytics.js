// src/services/financeAnalytics.js

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

export const computeMonthlySummary = ({ transactions, monthStart, monthEnd }) => {
  const inRange = transactions.filter((t) => t.transaction_date >= monthStart && t.transaction_date <= monthEnd);
  const expenses = inRange.filter((t) => t.type === 'expense');
  const income = inRange.filter((t) => t.type === 'income');

  const totalExpense = sum(expenses.map((t) => Number(t.amount || 0)));
  const totalIncome = sum(income.map((t) => Number(t.amount || 0)));
  const savings = Math.max(0, totalIncome - totalExpense);

  const byCategory = new Map();
  for (const e of expenses) {
    const key = e.category || 'Other';
    byCategory.set(key, (byCategory.get(key) || 0) + Number(e.amount || 0));
  }
  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  return { totalExpense, totalIncome, savings, topCategories };
};

export const computeHealthScore = ({ totalIncome, totalExpense, emiDue = 0, loanBalance = 0 }) => {
  const income = Math.max(0, Number(totalIncome || 0));
  const expense = Math.max(0, Number(totalExpense || 0));
  const savingsRate = income > 0 ? (income - expense) / income : 0;
  const emiRatio = income > 0 ? Number(emiDue || 0) / income : 0;
  const loanBurden = income > 0 ? Number(loanBalance || 0) / (income * 12) : 0;

  const clamp = (n) => Math.max(0, Math.min(1, n));
  const s = clamp(savingsRate);
  const e = clamp(1 - emiRatio);
  const l = clamp(1 - loanBurden);
  const spendingControl = clamp(1 - expense / Math.max(1, income));

  const score = Math.round(100 * (0.4 * s + 0.2 * spendingControl + 0.2 * e + 0.2 * l));
  return { score, savingsRate: s, spendingControl, emiRatio: 1 - e, loanBurden: 1 - l };
};

export const generateInsights = ({ current, previous }) => {
  const insights = [];
  const pct = (a, b) => (b > 0 ? ((a - b) / b) * 100 : null);
  const expenseChange = pct(current.totalExpense, previous.totalExpense);
  const food = current.topCategories.find((c) => c.category.toLowerCase() === 'food');

  if (expenseChange !== null && Math.abs(expenseChange) >= 15) {
    insights.push({
      type: 'trend',
      title: 'Monthly spending shift',
      description: `Your overall expenses ${expenseChange > 0 ? 'increased' : 'decreased'} by ${Math.round(
        Math.abs(expenseChange),
      )}% compared to last month.`,
      priority: expenseChange > 0 ? 'high' : 'medium',
    });
  }

  if (food && current.totalIncome > 0) {
    const ratio = (food.amount / current.totalIncome) * 100;
    if (ratio >= 15) {
      insights.push({
        type: 'category',
        title: 'Food spend is significant',
        description: `Food accounts for ~${Math.round(ratio)}% of your income this month.`,
        priority: ratio >= 25 ? 'high' : 'medium',
      });
    }
  }

  if (current.totalIncome > 0) {
    const savingsRatio = ((current.totalIncome - current.totalExpense) / current.totalIncome) * 100;
    if (savingsRatio < 10) {
      insights.push({
        type: 'savings',
        title: 'Low savings rate',
        description: `Your savings rate is ~${Math.max(0, Math.round(savingsRatio))}%. Consider setting a category budget and automating transfers.`,
        priority: 'high',
      });
    }
  }

  return insights;
};


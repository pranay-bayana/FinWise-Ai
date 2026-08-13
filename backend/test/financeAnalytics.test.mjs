import test from 'node:test';
import assert from 'node:assert/strict';
import { computeHealthScore, computeMonthlySummary, generateInsights } from '../src/services/financeAnalytics.js';

test('computeMonthlySummary totals income, expenses, savings, and top categories', () => {
  const summary = computeMonthlySummary({
    monthStart: '2026-07-01',
    monthEnd: '2026-07-31',
    transactions: [
      { type: 'income', amount: 100000, category: 'Salary', transaction_date: '2026-07-04' },
      { type: 'expense', amount: 2500, category: 'Food', transaction_date: '2026-07-04' },
      { type: 'expense', amount: 1500, category: 'Travel', transaction_date: '2026-07-05' },
      { type: 'expense', amount: 9999, category: 'Ignored', transaction_date: '2026-06-30' },
    ],
  });

  assert.equal(summary.totalIncome, 100000);
  assert.equal(summary.totalExpense, 4000);
  assert.equal(summary.savings, 96000);
  assert.deepEqual(summary.topCategories[0], { category: 'Food', amount: 2500 });
});

test('computeHealthScore returns bounded score values', () => {
  const health = computeHealthScore({ totalIncome: 100000, totalExpense: 60000, emiDue: 10000, loanBalance: 200000 });

  assert.equal(typeof health.score, 'number');
  assert.ok(health.score >= 0);
  assert.ok(health.score <= 100);
});

test('generateInsights flags major spending changes', () => {
  const insights = generateInsights({
    current: { totalIncome: 100000, totalExpense: 70000, topCategories: [{ category: 'Food', amount: 30000 }] },
    previous: { totalIncome: 100000, totalExpense: 40000, topCategories: [] },
  });

  assert.ok(insights.some((insight) => insight.type === 'trend'));
  assert.ok(insights.some((insight) => insight.type === 'category'));
});

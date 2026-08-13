import express from 'express';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/authMiddleware.js';
import { supabase } from '../services/supabaseClient.js';
import { computeHealthScore, computeMonthlySummary } from '../services/financeAnalytics.js';

const router = express.Router();
router.use(protect);

const expenseCategories = [
  { id: 'food', name: 'Food', icon: '🍽️' },
  { id: 'travel', name: 'Travel', icon: '🚕' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'emi', name: 'EMI', icon: '🏦' },
  { id: 'bills', name: 'Bills', icon: '🧾' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'fuel', name: 'Fuel', icon: '⛽' },
];

const incomeCategories = [
  { id: 'salary', name: 'Salary', icon: '💼' },
  { id: 'freelancing', name: 'Freelancing', icon: '💻' },
  { id: 'interest', name: 'Interest', icon: '🏦' },
  { id: 'dividend', name: 'Dividend', icon: '📈' },
  { id: 'business', name: 'Business', icon: '🏢' },
  { id: 'side-income', name: 'Side Income', icon: '💸' },
  { id: 'gifts', name: 'Gifts', icon: '🎁' },
  { id: 'other', name: 'Other', icon: '➕' },
];

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

const categoryAliases = {
  income: new Map([
    ['salary', 'Salary'],
    ['freelance', 'Freelancing'],
    ['freelancing', 'Freelancing'],
    ['interest', 'Interest'],
    ['dividend', 'Dividend'],
    ['business', 'Business'],
    ['side income', 'Side Income'],
    ['side-income', 'Side Income'],
    ['gifts', 'Gifts'],
    ['gift', 'Gifts'],
    ['other', 'Other'],
  ]),
  expense: new Map([
    ['food', 'Food'],
    ['travel', 'Travel'],
    ['shopping', 'Shopping'],
    ['emi', 'EMI'],
    ['bills', 'Bills'],
    ['bill', 'Bills'],
    ['entertainment', 'Entertainment'],
    ['education', 'Education'],
    ['health', 'Health'],
    ['healthcare', 'Health'],
    ['medical', 'Health'],
    ['fuel', 'Fuel'],
    ['petrol', 'Fuel'],
  ]),
};

const normalizeCategory = (category, type) => {
  if (category === undefined) return undefined;
  const trimmed = String(category || '').trim();
  if (!trimmed) return null;
  return categoryAliases[type]?.get(normalizeKey(trimmed)) || trimmed;
};

const ensureDefaultCategories = async ({ table, userId, defaults, fallbackIcon }) => {
  const { data, error } = await supabase.from(table).select('*').eq('user_id', userId).order('name');
  if (error) return { data: null, error };

  const existing = data || [];
  const existingNames = new Set(existing.map((category) => normalizeKey(category.name)));
  const missing = defaults.filter((category) => !existingNames.has(normalizeKey(category.name)));

  if (missing.length) {
    const { data: inserted, error: insertError } = await supabase
      .from(table)
      .insert(missing.map((category) => ({ user_id: userId, name: category.name, icon: category.icon })))
      .select('*');
    if (insertError) return { data: null, error: insertError };
    existing.push(...(inserted || []));
  }

  return {
    data: existing
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      .map((category) => ({ id: category.id, name: category.name, icon: category.icon || fallbackIcon })),
    error: null,
  };
};

const mapTransactionPayload = (body, type, { partial = false } = {}) => {
  const payload = { type };
  const set = (key, value) => {
    if (!partial || value !== undefined) payload[key] = value;
  };

  set('amount', body.amount !== undefined ? Number(body.amount) : undefined);
  set('category', normalizeCategory(body.category, type));
  set('subcategory', body.subcategory !== undefined ? body.subcategory || null : undefined);
  set('description', body.description !== undefined ? body.description || null : undefined);
  set('notes', body.notes !== undefined ? body.notes || null : undefined);
  set('transaction_date', body.transactionDate || body.transaction_date);
  set('is_recurring', body.isRecurring !== undefined || body.is_recurring !== undefined ? Boolean(body.isRecurring ?? body.is_recurring) : undefined);
  set('merchant_name', body.merchantName !== undefined || body.merchant_name !== undefined ? body.merchantName || body.merchant_name || null : undefined);
  set('payment_method', body.paymentMethod !== undefined || body.payment_method !== undefined ? body.paymentMethod || body.payment_method || null : undefined);
  return payload;
};

const listTransactions = async (req, res, type, key) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('type', type)
    .order('transaction_date', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ [key]: data });
};

const createTransaction = async (req, res, type, key) => {
  const payload = mapTransactionPayload(req.body, type);
  if (!Number.isFinite(payload.amount) || payload.amount <= 0 || !payload.category || !payload.transaction_date) {
    return res.status(400).json({ message: 'positive amount, category, and transactionDate are required' });
  }
  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...payload, user_id: req.user.id })
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ [key]: data });
};

const updateTransaction = async (req, res, type, key) => {
  const payload = mapTransactionPayload(req.body, type, { partial: true });
  if (payload.amount !== undefined && (!Number.isFinite(payload.amount) || payload.amount <= 0)) {
    return res.status(400).json({ message: 'amount must be positive' });
  }
  if (payload.category === null) {
    return res.status(400).json({ message: 'category is required' });
  }
  const { data, error } = await supabase
    .from('transactions')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .eq('type', type)
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ [key]: data });
};

const deleteTransaction = async (req, res, type) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .eq('type', type);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
};

router.get('/expenses', (req, res) => listTransactions(req, res, 'expense', 'expenses'));
router.post('/expenses', (req, res) => createTransaction(req, res, 'expense', 'expense'));
router.put('/expenses/:id', (req, res) => updateTransaction(req, res, 'expense', 'expense'));
router.delete('/expenses/:id', (req, res) => deleteTransaction(req, res, 'expense'));
router.get('/expenses/categories', async (req, res) => {
  const { data, error } = await ensureDefaultCategories({
    table: 'expense_categories',
    userId: req.user.id,
    defaults: expenseCategories,
    fallbackIcon: '📦',
  });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ categories: data });
});
router.post('/expenses/categories', async (req, res) => {
  const { name, icon, color, budgetLimit } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const { data, error } = await supabase
    .from('expense_categories')
    .insert({ user_id: req.user.id, name, icon: icon || '📦', color: color || null, budget_limit: budgetLimit || null })
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ category: { id: data.id, name: data.name, icon: data.icon } });
});
router.get('/expenses/by-category', async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('user_id', req.user.id)
    .eq('type', 'expense');
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  const categories = {};
  for (const row of data) categories[row.category || 'Other'] = (categories[row.category || 'Other'] || 0) + Number(row.amount || 0);
  return res.json({ categories });
});

router.get('/income', (req, res) => listTransactions(req, res, 'income', 'income'));
router.post('/income', (req, res) => createTransaction(req, res, 'income', 'income'));
router.put('/income/:id', (req, res) => updateTransaction(req, res, 'income', 'income'));
router.delete('/income/:id', (req, res) => deleteTransaction(req, res, 'income'));
router.get('/income/categories', async (req, res) => {
  const { data, error } = await ensureDefaultCategories({
    table: 'income_categories',
    userId: req.user.id,
    defaults: incomeCategories,
    fallbackIcon: '💼',
  });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ categories: data });
});
router.post('/income/categories', async (req, res) => {
  const { name, icon, color } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const { data, error } = await supabase
    .from('income_categories')
    .insert({ user_id: req.user.id, name, icon: icon || '💼', color: color || null })
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ category: { id: data.id, name: data.name, icon: data.icon } });
});

router.get('/settings/profile', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id,email,full_name,phone,avatar_url,created_at')
    .eq('id', req.user.id)
    .single();
  if (error) return res.status(500).json({ message: 'Profile fetch failed', details: error.message });
  return res.json({ user: data });
});

router.put('/settings/profile', async (req, res) => {
  const { fullName, phone, avatarUrl } = req.body;
  const { data, error } = await supabase
    .from('users')
    .update({ full_name: fullName || null, phone: phone || null, avatar_url: avatarUrl || null, updated_at: new Date().toISOString() })
    .eq('id', req.user.id)
    .select('id,email,full_name,phone,avatar_url,created_at')
    .single();
  if (error) return res.status(500).json({ message: 'Profile update failed', details: error.message });
  return res.json({ user: data });
});

router.get('/settings', async (req, res) => {
  const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', req.user.id).maybeSingle();
  if (error) return res.status(500).json({ message: 'Settings fetch failed', details: error.message });
  if (data) return res.json({ settings: data });
  const { data: created, error: createError } = await supabase
    .from('user_settings')
    .insert({ user_id: req.user.id })
    .select('*')
    .single();
  if (createError) return res.status(500).json({ message: 'Settings create failed', details: createError.message });
  return res.json({ settings: created });
});

router.put('/settings', async (req, res) => {
  const allowed = ['fingerprint_unlock', 'face_unlock', 'dark_mode', 'auto_lock_minutes', 'hide_balance', 'notification_enabled', 'email_notifications'];
  const patch = {};
  for (const key of allowed) if (key in req.body) patch[key] = req.body[key];
  if ('notificationsEnabled' in req.body) patch.notification_enabled = req.body.notificationsEnabled;
  if ('darkMode' in req.body) patch.dark_mode = req.body.darkMode;
  patch.updated_at = new Date().toISOString();
  const { data: existing } = await supabase.from('user_settings').select('id').eq('user_id', req.user.id).maybeSingle();
  const query = existing?.id
    ? supabase.from('user_settings').update(patch).eq('id', existing.id)
    : supabase.from('user_settings').insert({ user_id: req.user.id, ...patch });
  const { data, error } = await query.select('*').single();
  if (error) return res.status(500).json({ message: 'Settings update failed', details: error.message });
  return res.json({ settings: data });
});

router.put('/settings/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new password are required' });
  const { data: user, error } = await supabase.from('users').select('password_hash').eq('id', req.user.id).single();
  if (error || !user?.password_hash) return res.status(400).json({ message: 'Password change is unavailable for this account' });
  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
  const password_hash = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabase.from('users').update({ password_hash }).eq('id', req.user.id);
  if (updateError) return res.status(500).json({ message: 'Password update failed', details: updateError.message });
  return res.json({ ok: true });
});

router.get('/notifications', async (req, res) => {
  const { data, error } = await supabase.from('notifications').select('*').eq('user_id', req.user.id).order('notification_date', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ notifications: data });
});
router.post('/notifications', async (req, res) => {
  const { title, message, notificationDate, type = 'general' } = req.body;
  const { data, error } = await supabase
    .from('notifications')
    .insert({ user_id: req.user.id, title, message, type, notification_date: notificationDate || new Date().toISOString() })
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ notification: data });
});
router.get('/notifications/unread-count', async (req, res) => {
  const { count, error } = await supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', req.user.id).eq('is_read', false);
  if (error) return res.status(500).json({ message: 'Count failed', details: error.message });
  return res.json({ count: count || 0 });
});
router.put('/notifications/read-all', async (req, res) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ ok: true });
});
router.put('/notifications/:id/read', async (req, res) => {
  const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', req.params.id).eq('user_id', req.user.id).select('*').single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ notification: data });
});
router.delete('/notifications/:id', async (req, res) => {
  const { error } = await supabase.from('notifications').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
});

router.get('/ai/chat', async (req, res) => res.json({ messages: [] }));
router.post('/ai/chat', async (req, res) => {
  const question = String(req.body.message || req.body.question || '').toLowerCase();
  const { data: tx } = await supabase.from('transactions').select('type,amount,category,transaction_date').eq('user_id', req.user.id);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const summary = computeMonthlySummary({ transactions: tx || [], monthStart, monthEnd });
  const hasFinancialData = summary.totalIncome > 0 || summary.totalExpense > 0;
  const health = hasFinancialData ? computeHealthScore({ totalIncome: summary.totalIncome, totalExpense: summary.totalExpense }) : { score: 0 };
  let reply = `Your financial health score is ${health.score}/100. Income is ${summary.totalIncome}, expenses are ${summary.totalExpense}, and savings are ${summary.savings}.`;
  if (!hasFinancialData) reply = 'No data available yet. Start adding transactions to see analytics.';
  if (question.includes('budget')) reply = 'Suggested budget: keep essentials near 50%, lifestyle near 30%, and savings/investments near 20% of income.';
  if (question.includes('spend') || question.includes('most')) reply = summary.topCategories[0] ? `You spent the most on ${summary.topCategories[0].category}: ${summary.topCategories[0].amount}.` : 'No spending data yet.';
  return res.json({ reply, answer: reply });
});

router.get('/budgets', async (req, res) => {
  const { data, error } = await supabase.from('budgets').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ budgets: data });
});

router.post('/budgets', async (req, res) => {
  const { category, amount, period = 'monthly', startDate, start_date, endDate, end_date } = req.body;
  const normalizedCategory = normalizeCategory(category, 'expense');
  const normalizedAmount = Number(amount);
  if (!normalizedCategory || !Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    return res.status(400).json({ message: 'category and positive amount are required' });
  }
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: req.user.id,
      category: normalizedCategory,
      amount: normalizedAmount,
      period,
      start_date: startDate || start_date || new Date().toISOString().slice(0, 10),
      end_date: endDate || end_date || null,
    })
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ budget: data });
});

router.put('/budgets/:id', async (req, res) => {
  const { category, amount, period, startDate, start_date, endDate, end_date } = req.body;
  const normalizedAmount = amount !== undefined ? Number(amount) : undefined;
  if (normalizedAmount !== undefined && (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0)) {
    return res.status(400).json({ message: 'amount must be positive' });
  }
  const patch = {
    category: category !== undefined ? normalizeCategory(category, 'expense') : undefined,
    amount: normalizedAmount,
    period,
    start_date: startDate || start_date,
    end_date: endDate || end_date,
    updated_at: new Date().toISOString(),
  };
  Object.keys(patch).forEach((key) => patch[key] === undefined && delete patch[key]);
  const { data, error } = await supabase
    .from('budgets')
    .update(patch)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ budget: data });
});

router.delete('/budgets/:id', async (req, res) => {
  const { error } = await supabase.from('budgets').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
});

router.get('/reports/monthly', async (req, res) => {
  const { data: tx, error } = await supabase.from('transactions').select('*').eq('user_id', req.user.id);
  if (error) return res.status(500).json({ message: 'Report failed', details: error.message });
  const format = String(req.query.format || 'json').toLowerCase();
  if (format === 'csv' || format === 'excel') {
    const headers = ['date', 'type', 'category', 'description', 'amount'];
    const lines = [
      headers.join(','),
      ...tx.map((row) =>
        [
          row.transaction_date,
          row.type,
          row.category || '',
          `"${String(row.description || row.notes || '').replaceAll('"', '""')}"`,
          row.amount,
        ].join(',')
      ),
    ];
    res.setHeader('Content-Type', format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="finwise-monthly-report.${format === 'excel' ? 'xls' : 'csv'}"`);
    return res.send(lines.join('\n'));
  }
  if (format === 'pdf') {
    const text = `FinWise AI Monthly Report\nGenerated: ${new Date().toISOString()}\nTransactions: ${tx.length}\n`;
    const pdf = `%PDF-1.1\n1 0 obj<<>>endobj\n2 0 obj<< /Length ${text.length + 44} >>stream\nBT /F1 12 Tf 72 720 Td (${text.replace(/[()]/g, '')}) Tj ET\nendstream\nendobj\n3 0 obj<< /Type /Page /Parent 4 0 R /Contents 2 0 R >>endobj\n4 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n5 0 obj<< /Type /Catalog /Pages 4 0 R >>endobj\ntrailer<< /Root 5 0 R >>\n%%EOF`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="finwise-monthly-report.pdf"');
    return res.send(Buffer.from(pdf));
  }
  return res.json({ report: { generatedAt: new Date().toISOString(), transactions: tx } });
});

export default router;

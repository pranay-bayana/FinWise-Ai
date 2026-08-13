// src/controllers/transactionController.js
import { supabase } from '../services/supabaseClient.js';
import { computeMonthlySummary } from '../services/financeAnalytics.js';

const assertOwner = async ({ table, id, userId }) => {
  const { data, error } = await supabase.from(table).select('user_id').eq('id', id).single();
  if (error) return { ok: false, status: 404, message: 'Not found' };
  if (data.user_id !== userId) return { ok: false, status: 403, message: 'Forbidden' };
  return { ok: true };
};

const normalizeTransactionPayload = (body) => ({
  type: body.type,
  amount: body.amount !== undefined ? Number(body.amount) : undefined,
  category: body.category ?? null,
  description: body.description ?? null,
  notes: body.notes ?? null,
  transaction_date: body.transaction_date || body.transactionDate,
  is_manual: body.is_manual ?? body.isManual ?? true,
  merchant_name: body.merchant_name || body.merchantName || null,
  payment_method: body.payment_method || body.paymentMethod || null,
});

export const createTransaction = async (req, res) => {
  const userId = req.user.id;
  const payload = normalizeTransactionPayload(req.body);

  if (!payload.type || !Number.isFinite(payload.amount) || payload.amount <= 0 || !payload.transaction_date) {
    return res.status(400).json({ message: 'type, positive amount, and transactionDate are required' });
  }

  const { data, error } = await supabase.from('transactions').insert({ ...payload, user_id: userId }).select('*').single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ transaction: data });
};

export const getTransactions = async (req, res) => {
  const userId = req.user.id;
  const { type, startDate, endDate } = req.query;

  let query = supabase.from('transactions').select('*').eq('user_id', userId);
  if (type) query = query.eq('type', type);
  if (startDate) query = query.gte('transaction_date', startDate);
  if (endDate) query = query.lte('transaction_date', endDate);

  const { data, error } = await query.order('transaction_date', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ transactions: data });
};

export const updateTransaction = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const owner = await assertOwner({ table: 'transactions', id, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const updates = { ...normalizeTransactionPayload(req.body), updated_at: new Date().toISOString() };
  delete updates.user_id;
  delete updates.id;
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ transaction: data });
};

export const getTransactionSummary = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;
  const now = new Date();
  const monthStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data, error } = await supabase.from('transactions').select('*').eq('user_id', userId);
  if (error) return res.status(500).json({ message: 'Summary failed', details: error.message });

  const summary = computeMonthlySummary({ transactions: data || [], monthStart, monthEnd });
  const allTime = computeMonthlySummary({
    transactions: data || [],
    monthStart: '1900-01-01',
    monthEnd: '2999-12-31',
  });

  return res.json({
    summary: {
      ...summary,
      monthStart,
      monthEnd,
      totalTransactions: (data || []).length,
      allTimeIncome: allTime.totalIncome,
      allTimeExpenses: allTime.totalExpense,
    },
  });
};

export const deleteTransaction = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const owner = await assertOwner({ table: 'transactions', id, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
};

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { supabase } from '../services/supabaseClient.js';

const router = express.Router();
router.use(protect);

const mapSavings = (body) => ({
  name: body.name,
  target_amount: Number(body.targetAmount ?? body.target_amount),
  saved_amount: body.savedAmount !== undefined ? Number(body.savedAmount) : body.saved_amount !== undefined ? Number(body.saved_amount) : undefined,
  monthly_contribution: body.monthlyContribution !== undefined ? Number(body.monthlyContribution) : body.monthly_contribution !== undefined ? Number(body.monthly_contribution) : null,
  target_date: body.targetDate || body.target_date || null,
});

const mapInvestment = (body) => ({
  investment_type: body.investmentType || body.investment_type,
  name: body.name,
  invested_amount: Number(body.investedAmount ?? body.invested_amount),
  current_value: Number(body.currentValue ?? body.current_value),
  notes: body.notes || null,
});

const mapBill = (body) => ({
  bill_name: body.billName || body.bill_name,
  amount: Number(body.amount),
  due_date: body.dueDate || body.due_date,
  status: body.status || 'scheduled',
  notes: body.notes || null,
});

router.get('/savings-goals', async (req, res) => {
  const { data, error } = await supabase.from('savings_goals').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ goals: data });
});

router.post('/savings-goals', async (req, res) => {
  const payload = mapSavings(req.body);
  if (!payload.name || !payload.target_amount) return res.status(400).json({ message: 'name and targetAmount are required' });
  const { data, error } = await supabase.from('savings_goals').insert({ ...payload, user_id: req.user.id }).select('*').single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ goal: data });
});

router.put('/savings-goals/:id', async (req, res) => {
  const patch = { ...mapSavings(req.body), updated_at: new Date().toISOString() };
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);
  const { data, error } = await supabase.from('savings_goals').update(patch).eq('id', req.params.id).eq('user_id', req.user.id).select('*').single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ goal: data });
});

router.delete('/savings-goals/:id', async (req, res) => {
  const { error } = await supabase.from('savings_goals').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
});

router.get('/investments', async (req, res) => {
  const { data, error } = await supabase.from('investments').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ investments: data });
});

router.post('/investments', async (req, res) => {
  const payload = mapInvestment(req.body);
  if (!payload.investment_type || !payload.name || !payload.invested_amount || !payload.current_value) {
    return res.status(400).json({ message: 'investmentType, name, investedAmount, and currentValue are required' });
  }
  const { data, error } = await supabase.from('investments').insert({ ...payload, user_id: req.user.id }).select('*').single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ investment: data });
});

router.put('/investments/:id', async (req, res) => {
  const patch = { ...mapInvestment(req.body), updated_at: new Date().toISOString() };
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);
  const { data, error } = await supabase.from('investments').update(patch).eq('id', req.params.id).eq('user_id', req.user.id).select('*').single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ investment: data });
});

router.delete('/investments/:id', async (req, res) => {
  const { error } = await supabase.from('investments').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
});

router.get('/bills', async (req, res) => {
  const { data, error } = await supabase.from('bill_reminders').select('*').eq('user_id', req.user.id).order('due_date', { ascending: true });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ bills: data });
});

router.post('/bills', async (req, res) => {
  const payload = mapBill(req.body);
  if (!payload.bill_name || !payload.amount || !payload.due_date) {
    return res.status(400).json({ message: 'billName, amount, and dueDate are required' });
  }
  const { data, error } = await supabase.from('bill_reminders').insert({ ...payload, user_id: req.user.id }).select('*').single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ bill: data });
});

router.put('/bills/:id', async (req, res) => {
  const patch = { ...mapBill(req.body), updated_at: new Date().toISOString() };
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);
  const { data, error } = await supabase.from('bill_reminders').update(patch).eq('id', req.params.id).eq('user_id', req.user.id).select('*').single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ bill: data });
});

router.delete('/bills/:id', async (req, res) => {
  const { error } = await supabase.from('bill_reminders').delete().eq('id', req.params.id).eq('user_id', req.user.id);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
});

export default router;

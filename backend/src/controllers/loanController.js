// src/controllers/loanController.js
import { supabase } from '../services/supabaseClient.js';

const assertOwner = async ({ table, id, userId }) => {
  const { data, error } = await supabase.from(table).select('user_id').eq('id', id).single();
  if (error) return { ok: false, status: 404, message: 'Not found' };
  if (data.user_id !== userId) return { ok: false, status: 403, message: 'Forbidden' };
  return { ok: true };
};

export const createLoan = async (req, res) => {
  const userId = req.user.id;
  const {
    loanType,
    lenderName,
    borrowerName,
    principalAmount,
    interestRate,
    interestType,
    tenureMonths,
    startDate,
    endDate,
    emiAmount,
    direction, // alias for loan_type
    loan_type,
    lender_name,
    borrower_name,
    principal_amount,
    interest_rate,
    interest_type,
    start_date,
    tenure_months,
    end_date,
    emi_amount,
    notes,
    status = 'active',
  } = req.body;

  const effectiveType = loan_type || loanType || direction;
  const effectivePrincipal = principal_amount ?? principalAmount;
  const effectiveStart = start_date ?? startDate;
  if (!effectiveType || !effectivePrincipal || !effectiveStart) {
    return res.status(400).json({ message: 'loan_type (or direction), principal_amount, start_date are required' });
  }

  const payload = {
    user_id: userId,
    loan_type: effectiveType,
    lender_name: lender_name ?? lenderName ?? null,
    borrower_name: borrower_name ?? borrowerName ?? null,
    principal_amount: Number(effectivePrincipal),
    interest_rate: interest_rate ?? interestRate ?? null,
    interest_type: interest_type ?? interestType ?? 'reducing',
    start_date: effectiveStart,
    end_date: end_date ?? endDate ?? null,
    tenure_months: tenure_months ?? tenureMonths ?? null,
    emi_amount: emi_amount ?? emiAmount ?? null,
    remaining_balance: Number(effectivePrincipal),
    notes: notes ?? null,
    status,
  };

  const { data, error } = await supabase.from('loans').insert(payload).select('*').single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ loan: data });
};

export const getLoans = async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;

  let query = supabase.from('loans').select('*').eq('user_id', userId);
  if (status) query = query.eq('status', status);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ loans: data });
};

export const updateLoan = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const owner = await assertOwner({ table: 'loans', id, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const updates = {
    updated_at: new Date().toISOString(),
    loan_type: req.body.loan_type ?? req.body.loanType,
    lender_name: req.body.lender_name ?? req.body.lenderName,
    borrower_name: req.body.borrower_name ?? req.body.borrowerName,
    principal_amount: req.body.principal_amount ?? req.body.principalAmount,
    interest_rate: req.body.interest_rate ?? req.body.interestRate,
    interest_type: req.body.interest_type ?? req.body.interestType,
    tenure_months: req.body.tenure_months ?? req.body.tenureMonths,
    start_date: req.body.start_date ?? req.body.startDate,
    end_date: req.body.end_date ?? req.body.endDate,
    emi_amount: req.body.emi_amount ?? req.body.emiAmount,
    notes: req.body.notes,
    status: req.body.status,
  };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);
  delete updates.user_id;
  delete updates.id;

  const { data, error } = await supabase.from('loans').update(updates).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ loan: data });
};

export const deleteLoan = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const owner = await assertOwner({ table: 'loans', id, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const { error } = await supabase.from('loans').delete().eq('id', id);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
};

export const getLoanSummary = async (req, res) => {
  const { data, error } = await supabase.from('loans').select('loan_type, remaining_balance, principal_amount, emi_amount, status').eq('user_id', req.user.id);
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  
  const activeLoans = data.filter(l => l.status === 'active');
  
  const totalLoansTaken = activeLoans.filter((l) => l.loan_type === 'taken').reduce((sum, l) => sum + Number(l.remaining_balance ?? l.principal_amount ?? 0), 0);
  const totalLoansGiven = activeLoans.filter((l) => l.loan_type === 'given').reduce((sum, l) => sum + Number(l.remaining_balance ?? l.principal_amount ?? 0), 0);
  const totalEMIDue = activeLoans.reduce((sum, l) => sum + Number(l.emi_amount || 0), 0);
  
  return res.json({ summary: { totalLoansTaken, totalLoansGiven, totalEMIDue } });
};

export const getLoanPayments = async (req, res) => {
  const owner = await assertOwner({ table: 'loans', id: req.params.id, userId: req.user.id });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });
  const { data, error } = await supabase.from('loan_payments').select('*').eq('loan_id', req.params.id).order('payment_date', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ payments: data });
};

export const createLoanPayment = async (req, res) => {
  const owner = await assertOwner({ table: 'loans', id: req.params.id, userId: req.user.id });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });
  const { amount, paymentDate, payment_date, notes } = req.body;
  if (!amount || !(paymentDate || payment_date)) return res.status(400).json({ message: 'amount and paymentDate are required' });
  const { data, error } = await supabase
    .from('loan_payments')
    .insert({ loan_id: req.params.id, amount: Number(amount), payment_date: paymentDate || payment_date, notes: notes || null })
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ payment: data });
};

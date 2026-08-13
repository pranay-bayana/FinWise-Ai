import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { supabase } from '../services/supabaseClient.js';

const router = express.Router();
router.use(protect);
router.use(requireAdmin);

router.get('/stats', async (req, res) => {
  const [
    { count: userCount },
    { count: transactionCount },
    { count: budgetCount },
    { count: loanCount },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('transactions').select('id', { count: 'exact', head: true }),
    supabase.from('budgets').select('id', { count: 'exact', head: true }),
    supabase.from('loans').select('id', { count: 'exact', head: true }),
  ]);

  const { data: tx } = await supabase.from('transactions').select('type, amount');
  let totalIncome = 0;
  let totalExpenses = 0;
  for (const row of tx || []) {
    if (row.type === 'income') totalIncome += Number(row.amount || 0);
    else totalExpenses += Number(row.amount || 0);
  }

  return res.json({
    stats: {
      totalUsers: userCount || 0,
      totalTransactions: transactionCount || 0,
      totalBudgets: budgetCount || 0,
      totalLoans: loanCount || 0,
      platformIncome: totalIncome,
      platformExpenses: totalExpenses,
    },
  });
});

export default router;

const supabase = require('../config/database');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, category, limit = 50 } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);
    if (category) query = query.eq('category', category);

    const { data: expenses, error } = await query;

    if (error) throw error;

    res.json({ expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      amount,
      category,
      subcategory,
      description,
      notes,
      transactionDate,
      isRecurring,
      receiptUrl,
      merchantName,
      paymentMethod
    } = req.body;

    const { data: expense, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'expense',
        amount,
        category,
        subcategory,
        description,
        notes,
        transaction_date: transactionDate,
        is_recurring: isRecurring,
        receipt_url: receiptUrl,
        is_manual: true,
        merchant_name: merchantName,
        payment_method: paymentMethod
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Expense created', expense });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: expense, error } = await supabase
      .from('transactions')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Expense updated', expense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

// Get expense by category
exports.getExpensesByCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('transactions')
      .select('category, amount')
      .eq('user_id', userId)
      .eq('type', 'expense');

    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);

    const { data: expenses, error } = await query;

    if (error) throw error;

    const categoryTotals = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += parseFloat(expense.amount);
    });

    res.json({ categoryTotals });
  } catch (error) {
    console.error('Get expenses by category error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses by category' });
  }
};

// Get expense categories
exports.getExpenseCategories = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: categories, error } = await supabase
      .from('expense_categories')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ categories });
  } catch (error) {
    console.error('Get expense categories error:', error);
    res.status(500).json({ error: 'Failed to fetch expense categories' });
  }
};

// Create expense category
exports.createExpenseCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, icon, color, budgetLimit } = req.body;

    const { data: category, error } = await supabase
      .from('expense_categories')
      .insert({
        user_id: userId,
        name,
        icon,
        color,
        budget_limit: budgetLimit
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    console.error('Create expense category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

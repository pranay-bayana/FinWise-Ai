const supabase = require('../config/database');

// Get all income
exports.getAllIncome = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate, category, limit = 50 } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'income')
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);
    if (category) query = query.eq('category', category);

    const { data: income, error } = await query;

    if (error) throw error;

    res.json({ income });
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ error: 'Failed to fetch income' });
  }
};

// Create income
exports.createIncome = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      amount,
      category,
      subcategory,
      description,
      notes,
      transactionDate,
      isRecurring
    } = req.body;

    const { data: income, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'income',
        amount,
        category,
        subcategory,
        description,
        notes,
        transaction_date: transactionDate,
        is_recurring: isRecurring,
        is_manual: true
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Income created', income });
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ error: 'Failed to create income' });
  }
};

// Update income
exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: income, error } = await supabase
      .from('transactions')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Income updated', income });
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ error: 'Failed to update income' });
  }
};

// Delete income
exports.deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Income deleted' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ error: 'Failed to delete income' });
  }
};

// Get income categories
exports.getIncomeCategories = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: categories, error } = await supabase
      .from('income_categories')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ categories });
  } catch (error) {
    console.error('Get income categories error:', error);
    res.status(500).json({ error: 'Failed to fetch income categories' });
  }
};

// Create income category
exports.createIncomeCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, icon, color } = req.body;

    const { data: category, error } = await supabase
      .from('income_categories')
      .insert({
        user_id: userId,
        name,
        icon,
        color
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    console.error('Create income category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

const supabase = require('../config/database');

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, type, category, limit = 50 } = req.query;
    const userId = req.user.userId;

    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })
      .limit(limit);

    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);
    if (type) query = query.eq('type', type);
    if (category) query = query.eq('category', category);

    const { data: transactions, error } = await query;

    if (error) throw error;

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      type,
      amount,
      category,
      subcategory,
      description,
      notes,
      transactionDate,
      isRecurring,
      receiptUrl,
      isManual,
      merchantName,
      paymentMethod
    } = req.body;

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        category,
        subcategory,
        description,
        notes,
        transaction_date: transactionDate,
        is_recurring: isRecurring,
        receipt_url: receiptUrl,
        is_manual: isManual !== false,
        merchant_name: merchantName,
        payment_method: paymentMethod
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Transaction created', transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Transaction updated', transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// Get transaction summary
exports.getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    let query = supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId);

    if (startDate) query = query.gte('transaction_date', startDate);
    if (endDate) query = query.lte('transaction_date', endDate);

    const { data: transactions, error } = await query;

    if (error) throw error;

    const summary = {
      totalIncome: 0,
      totalExpenses: 0,
      totalSavings: 0
    };

    transactions.forEach(t => {
      if (t.type === 'income') {
        summary.totalIncome += parseFloat(t.amount);
      } else {
        summary.totalExpenses += parseFloat(t.amount);
      }
    });

    summary.totalSavings = summary.totalIncome - summary.totalExpenses;

    res.json({ summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

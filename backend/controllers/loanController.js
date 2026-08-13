const supabase = require('../config/database');

// Get all loans
exports.getAllLoans = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, status } = req.query;

    let query = supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('loan_type', type);
    if (status) query = query.eq('status', status);

    const { data: loans, error } = await query;

    if (error) throw error;

    res.json({ loans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
};

// Create loan
exports.createLoan = async (req, res) => {
  try {
    const userId = req.user.userId;
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
      notes
    } = req.body;

    // Calculate EMI
    let emiAmount = 0;
    if (interestRate && tenureMonths) {
      const r = interestRate / 12 / 100;
      const n = tenureMonths;
      if (interestType === 'flat') {
        emiAmount = (principalAmount + (principalAmount * interestRate * tenureMonths / 12 / 100)) / tenureMonths;
      } else {
        emiAmount = principalAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      }
    }

    const { data: loan, error } = await supabase
      .from('loans')
      .insert({
        user_id: userId,
        loan_type: loanType,
        lender_name: lenderName,
        borrower_name: borrowerName,
        principal_amount: principalAmount,
        interest_rate: interestRate,
        interest_type: interestType,
        tenure_months: tenureMonths,
        start_date: startDate,
        end_date: endDate,
        emi_amount: emiAmount,
        remaining_balance: principalAmount,
        status: 'active',
        notes
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Loan created', loan });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ error: 'Failed to create loan' });
  }
};

// Update loan
exports.updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: loan, error } = await supabase
      .from('loans')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Loan updated', loan });
  } catch (error) {
    console.error('Update loan error:', error);
    res.status(500).json({ error: 'Failed to update loan' });
  }
};

// Delete loan
exports.deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Loan deleted' });
  } catch (error) {
    console.error('Delete loan error:', error);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
};

// Get loan payments
exports.getLoanPayments = async (req, res) => {
  try {
    const { loanId } = req.params;
    const userId = req.user.userId;

    // Verify loan belongs to user
    const { data: loan } = await supabase
      .from('loans')
      .select('id')
      .eq('id', loanId)
      .eq('user_id', userId)
      .single();

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const { data: payments, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    res.json({ payments });
  } catch (error) {
    console.error('Get loan payments error:', error);
    res.status(500).json({ error: 'Failed to fetch loan payments' });
  }
};

// Create loan payment
exports.createLoanPayment = async (req, res) => {
  try {
    const { loanId } = req.params;
    const userId = req.user.userId;
    const { amount, paymentDate, notes } = req.body;

    // Verify loan belongs to user
    const { data: loan } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .eq('user_id', userId)
      .single();

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Calculate principal and interest components
    let principalComponent = amount;
    let interestComponent = 0;
    if (loan.interest_rate) {
      interestComponent = amount * loan.interest_rate / 12 / 100;
      principalComponent = amount - interestComponent;
    }

    // Create payment
    const { data: payment, error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount,
        payment_date: paymentDate,
        principal_component: principalComponent,
        interest_component: interestComponent,
        payment_status: 'paid',
        notes
      })
      .select()
      .single();

    if (error) throw error;

    // Update remaining balance
    const newBalance = parseFloat(loan.remaining_balance) - principalComponent;
    await supabase
      .from('loans')
      .update({
        remaining_balance: Math.max(0, newBalance),
        status: newBalance <= 0 ? 'completed' : 'active'
      })
      .eq('id', loanId);

    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (error) {
    console.error('Create loan payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

// Get loan summary
exports.getLoanSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: loans, error } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;

    const summary = {
      totalLoansTaken: 0,
      totalLoansGiven: 0,
      totalEMIDue: 0,
      totalRemainingBalance: 0
    };

    loans.forEach(loan => {
      if (loan.loan_type === 'taken') {
        summary.totalLoansTaken += parseFloat(loan.principal_amount);
        summary.totalEMIDue += parseFloat(loan.emi_amount || 0);
        summary.totalRemainingBalance += parseFloat(loan.remaining_balance || 0);
      } else {
        summary.totalLoansGiven += parseFloat(loan.principal_amount);
      }
    });

    res.json({ summary });
  } catch (error) {
    console.error('Get loan summary error:', error);
    res.status(500).json({ error: 'Failed to fetch loan summary' });
  }
};

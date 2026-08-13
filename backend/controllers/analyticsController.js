const supabase = require('../config/database');

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const start = startDate || defaultStart;
    const end = endDate || defaultEnd;

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', start)
      .lte('transaction_date', end);

    // Get loans
    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    // Calculate metrics
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryBreakdown = {};

    transactions?.forEach(t => {
      if (t.type === 'income') {
        totalIncome += parseFloat(t.amount);
      } else {
        totalExpenses += parseFloat(t.amount);
        const category = t.category || 'Uncategorized';
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = 0;
        }
        categoryBreakdown[category] += parseFloat(t.amount);
      }
    });

    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    // Calculate EMI due
    let totalEMIDue = 0;
    loans?.forEach(loan => {
      if (loan.loan_type === 'taken') {
        totalEMIDue += parseFloat(loan.emi_amount || 0);
      }
    });

    // Calculate loan balance
    let totalLoanBalance = 0;
    loans?.forEach(loan => {
      if (loan.loan_type === 'taken') {
        totalLoanBalance += parseFloat(loan.remaining_balance || 0);
      }
    });

    // Calculate financial health score
    const healthScore = calculateFinancialHealthScore({
      savingsRate,
      totalExpenses,
      totalIncome,
      totalLoanBalance,
      totalEMIDue
    });

    res.json({
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate,
      totalEMIDue,
      totalLoanBalance,
      categoryBreakdown,
      healthScore
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Calculate financial health score
function calculateFinancialHealthScore({ savingsRate, totalExpenses, totalIncome, totalLoanBalance, totalEMIDue }) {
  let score = 100;

  // Savings rate impact (20 points)
  if (savingsRate < 10) score -= 20;
  else if (savingsRate < 20) score -= 10;
  else if (savingsRate < 30) score -= 5;

  // Expense to income ratio (20 points)
  const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 100;
  if (expenseRatio > 90) score -= 20;
  else if (expenseRatio > 80) score -= 15;
  else if (expenseRatio > 70) score -= 10;
  else if (expenseRatio > 60) score -= 5;

  // Loan burden (30 points)
  const loanRatio = totalIncome > 0 ? (totalEMIDue / totalIncome) * 100 : 0;
  if (loanRatio > 50) score -= 30;
  else if (loanRatio > 40) score -= 25;
  else if (loanRatio > 30) score -= 20;
  else if (loanRatio > 20) score -= 15;
  else if (loanRatio > 10) score -= 10;

  // Remaining loan balance (30 points)
  if (totalLoanBalance > totalIncome * 12) score -= 30;
  else if (totalLoanBalance > totalIncome * 10) score -= 25;
  else if (totalLoanBalance > totalIncome * 8) score -= 20;
  else if (totalLoanBalance > totalIncome * 5) score -= 15;
  else if (totalLoanBalance > totalIncome * 3) score -= 10;

  return Math.max(0, Math.min(100, score));
}

// Get monthly trends
exports.getMonthlyTrends = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { months = 6 } = req.query;

    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      let income = 0;
      let expenses = 0;

      transactions?.forEach(t => {
        if (t.type === 'income') {
          income += parseFloat(t.amount);
        } else {
          expenses += parseFloat(t.amount);
        }
      });

      trends.push({
        month: date.toLocaleString('default', { month: 'short', year: '2-digit' }),
        income,
        expenses,
        savings: income - expenses
      });
    }

    res.json({ trends });
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

// Get AI insights
exports.getAIInsights = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: insights, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ insights });
  } catch (error) {
    console.error('Get AI insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
};

// Generate AI insights
exports.generateAIInsights = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get recent transactions
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    const { data: currentMonthTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', currentMonthStart);

    const { data: lastMonthTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', lastMonthStart)
      .lte('transaction_date', lastMonthEnd);

    const insights = [];

    // Analyze spending by category
    const currentCategorySpending = {};
    const lastCategorySpending = {};

    currentMonthTransactions?.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Uncategorized';
        currentCategorySpending[cat] = (currentCategorySpending[cat] || 0) + parseFloat(t.amount);
      }
    });

    lastMonthTransactions?.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Uncategorized';
        lastCategorySpending[cat] = (lastCategorySpending[cat] || 0) + parseFloat(t.amount);
      }
    });

    // Generate insights for category changes
    Object.keys(currentCategorySpending).forEach(category => {
      const current = currentCategorySpending[category];
      const last = lastCategorySpending[category] || 0;

      if (last > 0) {
        const change = ((current - last) / last) * 100;
        if (change > 20) {
          insights.push({
            user_id: userId,
            insight_type: 'spending_increase',
            title: `${category} spending increased`,
            description: `Your ${category.toLowerCase()} spending increased by ${change.toFixed(0)}% this month compared to last month.`,
            insight_data: { category, change, current, last },
            priority: 'high'
          });
        } else if (change < -20) {
          insights.push({
            user_id: userId,
            insight_type: 'spending_decrease',
            title: `${category} spending decreased`,
            description: `Great job! Your ${category.toLowerCase()} spending decreased by ${Math.abs(change).toFixed(0)}% this month.`,
            insight_data: { category, change, current, last },
            priority: 'low'
          });
        }
      }
    });

    // Weekend spending analysis
    const weekendSpending = currentMonthTransactions?.filter(t => {
      if (t.type !== 'expense') return false;
      const date = new Date(t.transaction_date);
      const day = date.getDay();
      return day === 0 || day === 6;
    }).reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const totalSpending = currentMonthTransactions?.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    if (totalSpending > 0 && weekendSpending / totalSpending > 0.4) {
      insights.push({
        user_id: userId,
        insight_type: 'weekend_spending',
        title: 'High weekend spending',
        description: `Your weekend expenses account for ${((weekendSpending / totalSpending) * 100).toFixed(0)}% of your total spending this month.`,
        insight_data: { weekendSpending, totalSpending },
        priority: 'medium'
      });
    }

    // Savings rate insight
    const totalIncome = currentMonthTransactions?.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpending) / totalIncome) * 100 : 0;

    if (savingsRate < 10) {
      insights.push({
        user_id: userId,
        insight_type: 'low_savings',
        title: 'Low savings rate',
        description: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim to save at least 20% of your income.`,
        insight_data: { savingsRate, totalIncome, totalSpending },
        priority: 'high'
      });
    } else if (savingsRate > 30) {
      insights.push({
        user_id: userId,
        insight_type: 'good_savings',
        title: 'Excellent savings rate',
        description: `Great job! Your savings rate is ${savingsRate.toFixed(1)}%, which is above the recommended 20%.`,
        insight_data: { savingsRate, totalIncome, totalSpending },
        priority: 'low'
      });
    }

    // Insert insights
    if (insights.length > 0) {
      await supabase.from('ai_insights').insert(insights);
    }

    res.json({ message: 'Insights generated', insights });
  } catch (error) {
    console.error('Generate AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
};

// Get financial health score
exports.getFinancialHealthScore = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: scores, error } = await supabase
      .from('financial_health_scores')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_date', { ascending: false })
      .limit(1);

    if (error) throw error;

    if (scores && scores.length > 0) {
      res.json({ score: scores[0] });
    } else {
      // Generate initial score
      const { data: analytics } = await getDashboardAnalytics({ user: { userId }, query: {} });
      const score = calculateFinancialHealthScore(analytics);

      const { data: newScore } = await supabase
        .from('financial_health_scores')
        .insert({
          user_id: userId,
          score,
          calculated_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      res.json({ score: newScore });
    }
  } catch (error) {
    console.error('Get financial health score error:', error);
    res.status(500).json({ error: 'Failed to fetch score' });
  }
};

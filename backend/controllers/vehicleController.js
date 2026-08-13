const supabase = require('../config/database');

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ vehicles });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

// Create vehicle
exports.createVehicle = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      vehicleName,
      vehicleType,
      registrationNumber,
      purchaseDate,
      purchasePrice,
      currentMileage,
      fuelType
    } = req.body;

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({
        user_id: userId,
        vehicle_name: vehicleName,
        vehicle_type: vehicleType,
        registration_number: registrationNumber,
        purchase_date: purchaseDate,
        purchase_price: purchasePrice,
        current_mileage: currentMileage,
        fuel_type: fuelType
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Vehicle created', vehicle });
  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update(req.body)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Vehicle updated', vehicle });
  } catch (error) {
    console.error('Update vehicle error:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
};

// Get vehicle expenses
exports.getVehicleExpenses = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;

    // Verify vehicle belongs to user
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .eq('user_id', userId)
      .single();

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { data: expenses, error } = await supabase
      .from('vehicle_expenses')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('expense_date', { ascending: false });

    if (error) throw error;

    res.json({ expenses });
  } catch (error) {
    console.error('Get vehicle expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle expenses' });
  }
};

// Create vehicle expense
exports.createVehicleExpense = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    const {
      expenseType,
      amount,
      mileage,
      fuelLiters,
      expenseDate,
      description,
      receiptUrl
    } = req.body;

    // Verify vehicle belongs to user
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .eq('user_id', userId)
      .single();

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { data: expense, error } = await supabase
      .from('vehicle_expenses')
      .insert({
        vehicle_id: vehicleId,
        expense_type: expenseType,
        amount,
        mileage,
        fuel_liters: fuelLiters,
        expense_date: expenseDate,
        description,
        receipt_url: receiptUrl
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Expense recorded', expense });
  } catch (error) {
    console.error('Create vehicle expense error:', error);
    res.status(500).json({ error: 'Failed to record expense' });
  }
};

// Get vehicle reminders
exports.getVehicleReminders = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;

    // Verify vehicle belongs to user
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .eq('user_id', userId)
      .single();

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { data: reminders, error } = await supabase
      .from('vehicle_reminders')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('due_date', { ascending: true });

    if (error) throw error;

    res.json({ reminders });
  } catch (error) {
    console.error('Get vehicle reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
};

// Create vehicle reminder
exports.createVehicleReminder = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;
    const { reminderType, dueDate, notes } = req.body;

    // Verify vehicle belongs to user
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', vehicleId)
      .eq('user_id', userId)
      .single();

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { data: reminder, error } = await supabase
      .from('vehicle_reminders')
      .insert({
        vehicle_id: vehicleId,
        reminder_type: reminderType,
        due_date: dueDate,
        notes
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Reminder created', reminder });
  } catch (error) {
    console.error('Create vehicle reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
};

// Get vehicle analytics
exports.getVehicleAnalytics = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.userId;

    // Verify vehicle belongs to user
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .eq('user_id', userId)
      .single();

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const { data: expenses } = await supabase
      .from('vehicle_expenses')
      .select('*')
      .eq('vehicle_id', vehicleId);

    const analytics = {
      totalFuelCost: 0,
      totalServiceCost: 0,
      totalInsuranceCost: 0,
      totalOtherCost: 0,
      averageMileage: 0,
      fuelExpenses: []
    };

    let totalFuelLiters = 0;
    let totalFuelAmount = 0;
    let mileageSum = 0;
    let mileageCount = 0;

    expenses.forEach(expense => {
      if (expense.expense_type === 'fuel') {
        analytics.totalFuelCost += parseFloat(expense.amount);
        totalFuelLiters += parseFloat(expense.fuel_liters || 0);
        totalFuelAmount += parseFloat(expense.amount);
        analytics.fuelExpenses.push({
          date: expense.expense_date,
          amount: expense.amount,
          liters: expense.fuel_liters,
          mileage: expense.mileage
        });
      } else if (expense.expense_type === 'service') {
        analytics.totalServiceCost += parseFloat(expense.amount);
      } else if (expense.expense_type === 'insurance') {
        analytics.totalInsuranceCost += parseFloat(expense.amount);
      } else {
        analytics.totalOtherCost += parseFloat(expense.amount);
      }

      if (expense.mileage) {
        mileageSum += parseFloat(expense.mileage);
        mileageCount++;
      }
    });

    if (mileageCount > 0) {
      analytics.averageMileage = mileageSum / mileageCount;
    }

    res.json({ analytics });
  } catch (error) {
    console.error('Get vehicle analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// src/controllers/vehicleController.js
import { supabase } from '../services/supabaseClient.js';

const assertOwner = async ({ table, id, userId }) => {
  const { data, error } = await supabase.from(table).select('user_id').eq('id', id).single();
  if (error) return { ok: false, status: 404, message: 'Not found' };
  if (data.user_id !== userId) return { ok: false, status: 403, message: 'Forbidden' };
  return { ok: true };
};

export const getVehicles = async (req, res) => {
  const userId = req.user.id;
  const { data, error } = await supabase.from('vehicles').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ vehicles: data });
};

export const addVehicle = async (req, res) => {
  const userId = req.user.id;
  const { name, vehicleName, vehicle_name, vehicleType, vehicle_type, registrationNumber, registration_number, purchaseDate, purchasePrice, currentMileage, fuelType } = req.body;
  const effectiveName = vehicle_name || name;
  const effectiveVehicleName = effectiveName || vehicleName;
  if (!effectiveVehicleName) return res.status(400).json({ message: 'vehicle_name (or name) is required' });

  const payload = {
    user_id: userId,
    vehicle_name: effectiveVehicleName,
    vehicle_type: vehicle_type ?? vehicleType ?? 'car',
    registration_number: registration_number ?? registrationNumber ?? null,
    purchase_date: purchaseDate || null,
    purchase_price: purchasePrice === '' ? null : purchasePrice ?? null,
    current_mileage: currentMileage === '' ? null : currentMileage ?? null,
    fuel_type: fuelType ?? 'petrol',
  };

  const { data, error } = await supabase.from('vehicles').insert(payload).select('*').single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ vehicle: data });
};

export const updateVehicle = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const owner = await assertOwner({ table: 'vehicles', id, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const updates = {
    updated_at: new Date().toISOString(),
    vehicle_name: req.body.vehicle_name ?? req.body.vehicleName,
    vehicle_type: req.body.vehicle_type ?? req.body.vehicleType,
    registration_number: req.body.registration_number ?? req.body.registrationNumber,
    purchase_date: req.body.purchase_date ?? req.body.purchaseDate,
    purchase_price: req.body.purchase_price ?? req.body.purchasePrice,
    current_mileage: req.body.current_mileage ?? req.body.currentMileage,
    fuel_type: req.body.fuel_type ?? req.body.fuelType,
  };
  Object.keys(updates).forEach((key) => updates[key] === undefined && delete updates[key]);
  delete updates.user_id;
  delete updates.id;

  const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ message: 'Update failed', details: error.message });
  return res.json({ vehicle: data });
};

export const deleteVehicle = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const owner = await assertOwner({ table: 'vehicles', id, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
};

export const getVehicleExpenses = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const owner = await assertOwner({ table: 'vehicles', id, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const { data, error } = await supabase
    .from('vehicle_expenses')
    .select('*')
    .eq('vehicle_id', id)
    .order('expense_date', { ascending: false });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ expenses: data });
};

export const addVehicleExpense = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const owner = await assertOwner({ table: 'vehicles', id, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const { expenseType, expense_type, amount, mileage, fuelLiters, fuel_liters, expenseDate, expense_date, description, receiptUrl, receipt_url } = req.body;
  const effectiveType = expense_type || expenseType;
  const effectiveDate = expense_date || expenseDate;
  if (!effectiveType || !amount || !effectiveDate) {
    return res.status(400).json({ message: 'expense_type, amount, expense_date are required' });
  }

  const payload = {
    vehicle_id: id,
    expense_type: effectiveType,
    amount,
    mileage: mileage ?? null,
    fuel_liters: fuel_liters ?? fuelLiters ?? null,
    expense_date: effectiveDate,
    description: description ?? null,
    receipt_url: receipt_url ?? receiptUrl ?? null,
  };

  const { data, error } = await supabase.from('vehicle_expenses').insert(payload).select('*').single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ expense: data });
};

export const deleteVehicleExpense = async (req, res) => {
  const userId = req.user.id;
  const { vehicleId, expenseId } = req.params;

  const owner = await assertOwner({ table: 'vehicles', id: vehicleId, userId });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });

  const { error } = await supabase.from('vehicle_expenses').delete().eq('id', expenseId).eq('vehicle_id', vehicleId);
  if (error) return res.status(500).json({ message: 'Delete failed', details: error.message });
  return res.json({ ok: true });
};

export const getVehicleReminders = async (req, res) => {
  const owner = await assertOwner({ table: 'vehicles', id: req.params.id, userId: req.user.id });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });
  const { data, error } = await supabase.from('vehicle_reminders').select('*').eq('vehicle_id', req.params.id).order('due_date', { ascending: true });
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  return res.json({ reminders: data });
};

export const addVehicleReminder = async (req, res) => {
  const owner = await assertOwner({ table: 'vehicles', id: req.params.id, userId: req.user.id });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });
  const reminderType = req.body.reminder_type || req.body.reminderType;
  const dueDate = req.body.due_date || req.body.dueDate;
  if (!reminderType || !dueDate) return res.status(400).json({ message: 'reminderType and dueDate are required' });
  const { data, error } = await supabase
    .from('vehicle_reminders')
    .insert({ vehicle_id: req.params.id, reminder_type: reminderType, due_date: dueDate, notes: req.body.notes || null })
    .select('*')
    .single();
  if (error) return res.status(500).json({ message: 'Create failed', details: error.message });
  return res.status(201).json({ reminder: data });
};

export const getVehicleAnalytics = async (req, res) => {
  const owner = await assertOwner({ table: 'vehicles', id: req.params.id, userId: req.user.id });
  if (!owner.ok) return res.status(owner.status).json({ message: owner.message });
  const { data, error } = await supabase.from('vehicle_expenses').select('*').eq('vehicle_id', req.params.id);
  if (error) return res.status(500).json({ message: 'Fetch failed', details: error.message });
  const totalFuelCost = data.filter((e) => e.expense_type === 'fuel').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalServiceCost = data.filter((e) => e.expense_type === 'service').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalInsuranceCost = data.filter((e) => e.expense_type === 'insurance').reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const liters = data.reduce((sum, e) => sum + Number(e.fuel_liters || 0), 0);
  const mileage = data.reduce((sum, e) => sum + Number(e.mileage || 0), 0);
  return res.json({ analytics: { totalFuelCost, totalServiceCost, totalInsuranceCost, averageMileage: liters > 0 ? mileage / liters : 0 } });
};

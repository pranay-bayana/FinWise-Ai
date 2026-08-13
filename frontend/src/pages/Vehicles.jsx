import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Car, Fuel, Wrench, Shield, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleExpenses, setVehicleExpenses] = useState([]);
  const [vehicleReminders, setVehicleReminders] = useState([]);
  const [vehicleAnalytics, setVehicleAnalytics] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vehicles');

  const [vehicleFormData, setVehicleFormData] = useState({
    vehicleName: '',
    vehicleType: 'car',
    registrationNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    currentMileage: '',
    fuelType: 'petrol'
  });

  const [expenseFormData, setExpenseFormData] = useState({
    expenseType: 'fuel',
    amount: '',
    mileage: '',
    fuelLiters: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    receiptUrl: ''
  });

  const [reminderFormData, setReminderFormData] = useState({
    reminderType: 'service',
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      fetchVehicleData(selectedVehicle.id);
    }
  }, [selectedVehicle]);

  const fetchVehicles = async () => {
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data.vehicles || []);
    } catch (error) {
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleData = async (vehicleId) => {
    try {
      const [expenses, reminders, analytics] = await Promise.all([
        vehicleService.getVehicleExpenses(vehicleId),
        vehicleService.getVehicleReminders(vehicleId),
        vehicleService.getVehicleAnalytics(vehicleId)
      ]);
      setVehicleExpenses(expenses.expenses || []);
      setVehicleReminders(reminders.reminders || []);
      setVehicleAnalytics(analytics.analytics);
    } catch (error) {
      console.error('Failed to fetch vehicle data');
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, vehicleFormData);
        toast.success('Vehicle updated successfully');
      } else {
        await vehicleService.createVehicle(vehicleFormData);
        toast.success('Vehicle added successfully');
      }
      setShowVehicleModal(false);
      setEditingVehicle(null);
      resetVehicleForm();
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save vehicle');
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleService.createVehicleExpense(selectedVehicle.id, expenseFormData);
      toast.success('Expense recorded successfully');
      setShowExpenseModal(false);
      resetExpenseForm();
      fetchVehicleData(selectedVehicle.id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to record expense');
    }
  };

  const handleReminderSubmit = async (e) => {
    e.preventDefault();
    try {
      await vehicleService.createVehicleReminder(selectedVehicle.id, reminderFormData);
      toast.success('Reminder created successfully');
      setShowReminderModal(false);
      resetReminderForm();
      fetchVehicleData(selectedVehicle.id);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create reminder');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await vehicleService.deleteVehicle(id);
        toast.success('Vehicle deleted successfully');
        if (selectedVehicle?.id === id) {
          setSelectedVehicle(null);
        }
        fetchVehicles();
      } catch (error) {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const resetVehicleForm = () => {
    setVehicleFormData({
      vehicleName: '',
      vehicleType: 'car',
      registrationNumber: '',
      purchaseDate: '',
      purchasePrice: '',
      currentMileage: '',
      fuelType: 'petrol'
    });
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      expenseType: 'fuel',
      amount: '',
      mileage: '',
      fuelLiters: '',
      expenseDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      receiptUrl: ''
    });
  };

  const resetReminderForm = () => {
    setReminderFormData({
      reminderType: 'service',
      dueDate: '',
      notes: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicles</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your vehicle expenses and maintenance</p>
        </div>
        <button
          onClick={() => {
            resetVehicleForm();
            setEditingVehicle(null);
            setShowVehicleModal(true);
          }}
          className="flex items-center gap-2 btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Vehicle List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No vehicles found. Add your first vehicle to get started.</p>
          </div>
        ) : (
          vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle)}
              className={`card p-6 cursor-pointer transition-all hover:shadow-lg ${
                selectedVehicle?.id === vehicle.id ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Car className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteVehicle(vehicle.id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {vehicle.vehicle_name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {vehicle.registration_number || 'No registration'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{vehicle.vehicle_type}</span>
                <span>•</span>
                <span>{vehicle.fuel_type}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vehicle Details */}
      {selectedVehicle && (
        <div className="space-y-6 animate-slide-up">
          {/* Vehicle Header */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedVehicle.vehicle_name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedVehicle.registration_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'expenses'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'reminders'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Reminders
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Analytics
            </button>
          </div>

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expenses</h3>
                <button
                  onClick={() => {
                    resetExpenseForm();
                    setShowExpenseModal(true);
                  }}
                  className="flex items-center gap-2 btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>
              </div>

              {vehicleExpenses.length === 0 ? (
                <div className="card p-12 text-center">
                  <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet.</p>
                </div>
              ) : (
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {vehicleExpenses.map((expense) => (
                        <tr key={expense.id}>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white capitalize">
                            {expense.expense_type}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(expense.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reminders</h3>
                <button
                  onClick={() => {
                    resetReminderForm();
                    setShowReminderModal(true);
                  }}
                  className="flex items-center gap-2 btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Reminder
                </button>
              </div>

              {vehicleReminders.length === 0 ? (
                <div className="card p-12 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No reminders set yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicleReminders.map((reminder) => (
                    <div key={reminder.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {reminder.reminder_type}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Due: {format(new Date(reminder.due_date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reminder.is_completed
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {reminder.is_completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && vehicleAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Fuel className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Fuel Cost</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(vehicleAnalytics.totalFuelCost)}
                </p>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Wrench className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Service Cost</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(vehicleAnalytics.totalServiceCost)}
                </p>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Insurance Cost</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(vehicleAnalytics.totalInsuranceCost)}
                </p>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Car className="w-5 h-5 text-primary-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Mileage</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicleAnalytics.averageMileage.toFixed(1)} km/l
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
              </h2>

              <form onSubmit={handleVehicleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleFormData.vehicleName}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleName: e.target.value })}
                    className="input-field"
                    placeholder="My Car"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    required
                    value={vehicleFormData.vehicleType}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, vehicleType: e.target.value })}
                    className="input-field"
                  >
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="truck">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    value={vehicleFormData.registrationNumber}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, registrationNumber: e.target.value })}
                    className="input-field"
                    placeholder="MH 01 AB 1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={vehicleFormData.purchaseDate}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, purchaseDate: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={vehicleFormData.purchasePrice}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, purchasePrice: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Mileage (km/l)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vehicleFormData.currentMileage}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, currentMileage: e.target.value })}
                    className="input-field"
                    placeholder="15.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fuel Type *
                  </label>
                  <select
                    required
                    value={vehicleFormData.fuelType}
                    onChange={(e) => setVehicleFormData({ ...vehicleFormData, fuelType: e.target.value })}
                    className="input-field"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVehicleModal(false);
                      setEditingVehicle(null);
                      resetVehicleForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingVehicle ? 'Update' : 'Add'} Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add Expense</h2>

              <form onSubmit={handleExpenseSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expense Type *
                  </label>
                  <select
                    required
                    value={expenseFormData.expenseType}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, expenseType: e.target.value })}
                    className="input-field"
                  >
                    <option value="fuel">Fuel</option>
                    <option value="service">Service</option>
                    <option value="insurance">Insurance</option>
                    <option value="pollution">Pollution</option>
                    <option value="repair">Repair</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseFormData.expenseDate}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, expenseDate: e.target.value })}
                    className="input-field"
                  />
                </div>

                {expenseFormData.expenseType === 'fuel' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Fuel Liters
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={expenseFormData.fuelLiters}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, fuelLiters: e.target.value })}
                        className="input-field"
                        placeholder="0.0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Mileage
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={expenseFormData.mileage}
                        onChange={(e) => setExpenseFormData({ ...expenseFormData, mileage: e.target.value })}
                        className="input-field"
                        placeholder="0.0"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                    className="input-field"
                    placeholder="Add description..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExpenseModal(false);
                      resetExpenseForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add Reminder</h2>

              <form onSubmit={handleReminderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reminder Type *
                  </label>
                  <select
                    required
                    value={reminderFormData.reminderType}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, reminderType: e.target.value })}
                    className="input-field"
                  >
                    <option value="service">Service</option>
                    <option value="insurance">Insurance Renewal</option>
                    <option value="pollution">Pollution Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={reminderFormData.dueDate}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, dueDate: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={reminderFormData.notes}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, notes: e.target.value })}
                    className="input-field"
                    rows="2"
                    placeholder="Add notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReminderModal(false);
                      resetReminderForm();
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Add Reminder
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;

// src/routes/vehicleRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addVehicle,
  addVehicleExpense,
  deleteVehicle,
  deleteVehicleExpense,
  getVehicleExpenses,
  getVehicleAnalytics,
  getVehicleReminders,
  getVehicles,
  addVehicleReminder,
  updateVehicle,
} from '../controllers/vehicleController.js';

const router = express.Router();
router.use(protect);

router.get('/', getVehicles);
router.post('/', addVehicle);
router.patch('/:id', updateVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

router.get('/:id/expenses', getVehicleExpenses);
router.post('/:id/expenses', addVehicleExpense);
router.delete('/:vehicleId/expenses/:expenseId', deleteVehicleExpense);
router.get('/:id/reminders', getVehicleReminders);
router.post('/:id/reminders', addVehicleReminder);
router.get('/:id/analytics', getVehicleAnalytics);

export default router;

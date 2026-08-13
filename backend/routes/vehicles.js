const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/auth');

router.get('/', auth, vehicleController.getAllVehicles);
router.post('/', auth, vehicleController.createVehicle);
router.put('/:id', auth, vehicleController.updateVehicle);
router.delete('/:id', auth, vehicleController.deleteVehicle);
router.get('/:vehicleId/expenses', auth, vehicleController.getVehicleExpenses);
router.post('/:vehicleId/expenses', auth, vehicleController.createVehicleExpense);
router.get('/:vehicleId/reminders', auth, vehicleController.getVehicleReminders);
router.post('/:vehicleId/reminders', auth, vehicleController.createVehicleReminder);
router.get('/:vehicleId/analytics', auth, vehicleController.getVehicleAnalytics);

module.exports = router;

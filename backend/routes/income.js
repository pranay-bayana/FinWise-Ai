const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const auth = require('../middleware/auth');

router.get('/', auth, incomeController.getAllIncome);
router.post('/', auth, incomeController.createIncome);
router.put('/:id', auth, incomeController.updateIncome);
router.delete('/:id', auth, incomeController.deleteIncome);
router.get('/categories', auth, incomeController.getIncomeCategories);
router.post('/categories', auth, incomeController.createIncomeCategory);

module.exports = router;

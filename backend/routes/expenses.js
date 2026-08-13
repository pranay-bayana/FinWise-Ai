const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.get('/', auth, expenseController.getAllExpenses);
router.post('/', auth, expenseController.createExpense);
router.put('/:id', auth, expenseController.updateExpense);
router.delete('/:id', auth, expenseController.deleteExpense);
router.get('/by-category', auth, expenseController.getExpensesByCategory);
router.get('/categories', auth, expenseController.getExpenseCategories);
router.post('/categories', auth, expenseController.createExpenseCategory);

module.exports = router;

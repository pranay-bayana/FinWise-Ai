const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

router.get('/', auth, transactionController.getAllTransactions);
router.post('/', auth, transactionController.createTransaction);
router.put('/:id', auth, transactionController.updateTransaction);
router.delete('/:id', auth, transactionController.deleteTransaction);
router.get('/summary', auth, transactionController.getTransactionSummary);

module.exports = router;

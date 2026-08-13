const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const auth = require('../middleware/auth');

router.get('/', auth, loanController.getAllLoans);
router.get('/summary', auth, loanController.getLoanSummary);
router.post('/', auth, loanController.createLoan);
router.put('/:id', auth, loanController.updateLoan);
router.delete('/:id', auth, loanController.deleteLoan);
router.get('/:loanId/payments', auth, loanController.getLoanPayments);
router.post('/:loanId/payments', auth, loanController.createLoanPayment);

module.exports = router;

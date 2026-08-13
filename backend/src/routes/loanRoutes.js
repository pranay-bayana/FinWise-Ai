// src/routes/loanRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createLoan, createLoanPayment, deleteLoan, getLoanPayments, getLoanSummary, getLoans, updateLoan } from '../controllers/loanController.js';

const router = express.Router();
router.use(protect);

router.post('/', createLoan);
router.get('/summary', getLoanSummary);
router.get('/', getLoans);
router.patch('/:id', updateLoan);
router.put('/:id', updateLoan);
router.delete('/:id', deleteLoan);
router.get('/:id/payments', getLoanPayments);
router.post('/:id/payments', createLoanPayment);

export default router;

// src/routes/transactionRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  getTransactionSummary,
  updateTransaction,
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);
router.get('/summary', getTransactionSummary);
router.get('/', getTransactions);
router.patch('/:id', updateTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;

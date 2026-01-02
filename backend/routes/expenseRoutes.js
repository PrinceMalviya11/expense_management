import express from 'express';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getExpenses).post(createExpense);
router.route('/stats/summary').get(getExpenseStats);
router.route('/:id').get(getExpense).put(updateExpense).delete(deleteExpense);

export default router;


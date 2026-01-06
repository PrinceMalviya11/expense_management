import express from 'express';
import {
  getIncomes,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeStats,
  getMonthlyIncomeStats,
} from '../controllers/incomeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getIncomes).post(createIncome);
router.route('/stats/summary').get(getIncomeStats);
router.route('/stats/monthly').get(getMonthlyIncomeStats);
router.route('/:id').get(getIncome).put(updateIncome).delete(deleteIncome);

export default router;


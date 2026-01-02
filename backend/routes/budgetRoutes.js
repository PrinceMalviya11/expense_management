import express from 'express';
import {
  getBudget,
  createOrUpdateBudget,
  updateBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getBudget).post(createOrUpdateBudget).put(updateBudget);

export default router;


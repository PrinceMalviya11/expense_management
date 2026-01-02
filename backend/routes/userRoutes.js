import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getAllUsers,
  updateUserStatus,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.put('/password', updatePassword);

// Admin routes
router.get('/all', admin, getAllUsers);
router.put('/:id/status', admin, updateUserStatus);

export default router;


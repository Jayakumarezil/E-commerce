import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
} from '../middleware/validation';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

// Public routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/forgot-password', forgotPasswordValidation, handleValidationErrors, forgotPassword);
router.post('/reset-password', resetPasswordValidation, handleValidationErrors, resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/update-profile', authenticateToken, updateProfileValidation, handleValidationErrors, updateProfile);
router.put('/change-password', authenticateToken, handleValidationErrors, changePassword);
router.post('/logout', authenticateToken, logout);

export default router;

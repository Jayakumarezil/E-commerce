import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createRazorpayOrder,
  verifyPayment,
  handlePaymentFailure,
  generatePaymentQR,
  getPaymentMethods,
} from '../controllers/paymentController';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

// All payment routes require authentication
router.use(authenticateToken);

// Validation schemas
const createRazorpayOrderValidation = [
  body('order_id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
];

const verifyPaymentValidation = [
  body('order_id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
  body('payment_id')
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('signature')
    .notEmpty()
    .withMessage('Payment signature is required'),
];

const paymentFailureValidation = [
  body('order_id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
  body('error_code')
    .optional()
    .notEmpty()
    .withMessage('Error code is required'),
  body('error_description')
    .optional()
    .notEmpty()
    .withMessage('Error description is required'),
];

const generateQRValidation = [
  body('order_id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
];

// Payment routes
router.post('/razorpay/create-order', createRazorpayOrderValidation, handleValidationErrors, createRazorpayOrder);
router.post('/verify', verifyPaymentValidation, handleValidationErrors, verifyPayment);
router.post('/failure', paymentFailureValidation, handleValidationErrors, handlePaymentFailure);
router.post('/qr', generateQRValidation, handleValidationErrors, generatePaymentQR);
router.get('/methods', getPaymentMethods);

export default router;

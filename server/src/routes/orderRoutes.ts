import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  createManualOrderAdmin,
  confirmPaymentByUser,
} from '../controllers/orderController';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

// Validation schemas
const createOrderValidation = [
  body('shipping_address.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('shipping_address.address')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  body('shipping_address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('shipping_address.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('shipping_address.phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone must be between 10 and 15 characters'),
  body('payment_method')
    .optional()
    .isIn(['razorpay', 'upi', 'netbanking'])
    .withMessage('Payment method must be one of: razorpay, upi, netbanking'),
];

const orderIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
];

const updateOrderStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Order ID must be a valid UUID'),
  body('order_status')
    .optional()
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Order status must be one of: pending, confirmed, shipped, delivered, cancelled'),
  body('payment_status')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Payment status must be one of: pending, paid, failed, refunded'),
];

const getUserOrdersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'all'])
    .withMessage('Status must be one of: pending, confirmed, shipped, delivered, cancelled, all'),
];

// Order routes
router.post('/create', authenticateToken, createOrderValidation, handleValidationErrors, createOrder);
router.get('/', authenticateToken, getUserOrdersValidation, handleValidationErrors, getUserOrders);
router.get('/:id', authenticateToken, orderIdValidation, handleValidationErrors, getOrderById);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatusValidation, handleValidationErrors, updateOrderStatus);
router.put('/:id/cancel', authenticateToken, orderIdValidation, handleValidationErrors, cancelOrder);

// User confirms payment (for QR/manual payments)
router.post('/:id/confirm-payment', authenticateToken, orderIdValidation, handleValidationErrors, confirmPaymentByUser);

// Admin manual order creation
router.post(
  '/admin/manual',
  authenticateToken,
  requireAdmin,
  [
    body('user_id').isUUID().withMessage('user_id must be UUID'),
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.product_id').isUUID().withMessage('product_id must be UUID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity must be >= 1'),
  ],
  handleValidationErrors,
  createManualOrderAdmin
);

export default router;

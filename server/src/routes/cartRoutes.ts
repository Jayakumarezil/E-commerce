import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

// Validation schemas
const addToCartValidation = [
  body('product_id')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

const updateCartValidation = [
  param('id')
    .isUUID()
    .withMessage('Cart item ID must be a valid UUID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

const cartItemIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Cart item ID must be a valid UUID'),
];

// Cart routes
router.post('/add', addToCartValidation, handleValidationErrors, addToCart);
router.get('/', getCart);
router.put('/:id', updateCartValidation, handleValidationErrors, updateCartItem);
router.delete('/:id', cartItemIdValidation, handleValidationErrors, removeFromCart);
router.delete('/', clearCart);

export default router;

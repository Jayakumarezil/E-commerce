import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getFeaturedProducts,
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  createProductValidation,
  updateProductValidation,
  productIdValidation,
  getProductsValidation,
} from '../middleware/validation';
import { handleValidationErrors } from '../middleware/validationHandler';

const router = Router();

// Public routes
router.get('/', getProductsValidation, handleValidationErrors, getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/:id', productIdValidation, handleValidationErrors, getProductById);

// Admin routes
router.post('/', authenticateToken, requireAdmin, createProductValidation, handleValidationErrors, createProduct);
router.put('/:id', authenticateToken, requireAdmin, productIdValidation, updateProductValidation, handleValidationErrors, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, productIdValidation, handleValidationErrors, deleteProduct);

export default router;

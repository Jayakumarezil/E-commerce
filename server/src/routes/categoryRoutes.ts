import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from '../controllers/categoryController';

const router = Router();

// Public route - get active categories (for product filters, etc.)
router.get('/', getCategories);

// Get category by ID (public)
router.get('/:id', getCategoryById);

// Admin-only routes
router.use(authenticateToken);
router.use(requireAdmin);

// Create category
router.post('/', createCategory);

// Update category
router.put('/:id', updateCategory);

// Delete category
router.delete('/:id', deleteCategory);

// Toggle category status
router.patch('/:id/toggle-status', toggleCategoryStatus);

export default router;


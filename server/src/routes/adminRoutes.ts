import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getDashboardStats,
  getMonthlySales,
  getTopSellingProducts,
  getAllOrders,
  updateOrderStatus,
  exportReports,
  getAllUsers
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard analytics
router.get('/dashboard/stats', getDashboardStats);
router.get('/sales/monthly', getMonthlySales);
router.get('/products/top-selling', getTopSellingProducts);

// Order management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Reports
router.get('/reports/export', exportReports);

// Users
router.get('/users', getAllUsers);

export default router;

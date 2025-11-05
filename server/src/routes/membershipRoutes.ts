import { Router } from 'express';
import {
  searchMembership,
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
  exportMemberships,
} from '../controllers/membershipController';
import { authenticateToken, requireAdmin, optionalAuth } from '../middleware/auth';

const router = Router();

// Public route - search membership (no auth required)
router.get('/search', searchMembership);

// Admin routes - require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/', getAllMemberships);
router.get('/export', exportMemberships);
router.get('/:id', getMembershipById);
router.post('/', createMembership);
router.put('/:id', updateMembership);
router.delete('/:id', deleteMembership);

export default router;


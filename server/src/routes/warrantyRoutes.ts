import { Router } from 'express';
import {
  registerWarranty,
  autoRegisterWarranty,
  getUserWarranties,
  getWarrantyById,
  getAllWarranties,
  createClaim,
  getUserClaims,
  updateClaimStatus,
  getAllClaims,
} from '../controllers/warrantyController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Warranty routes
router.get('/', authenticateToken, requireAdmin, getAllWarranties);
router.post('/register', authenticateToken, registerWarranty);
router.post('/auto-register', authenticateToken, autoRegisterWarranty);
router.get('/user/:userId', authenticateToken, getUserWarranties);
router.get('/:id', authenticateToken, getWarrantyById);

// Claim routes
router.post('/claims/create', authenticateToken, createClaim);
router.get('/claims/user/:userId', authenticateToken, getUserClaims);
router.put('/claims/:id/update-status', authenticateToken, requireAdmin, updateClaimStatus);
router.get('/claims/all', authenticateToken, requireAdmin, getAllClaims);

export default router;

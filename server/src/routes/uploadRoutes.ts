import { Router } from 'express';
import { upload, uploadFile } from '../controllers/uploadController';
import { uploadClaimDocument, uploadClaimFile } from '../controllers/claimUploadController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// File upload route (requires authentication)
router.post('/', authenticateToken, upload.single('file'), uploadFile);

// Claim document upload route (requires authentication)
router.post('/claim', authenticateToken, uploadClaimDocument.single('file'), uploadClaimFile);

export default router;


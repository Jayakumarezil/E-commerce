import { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// Extend Request to include file
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Define claim upload directory
const claimUploadDir = path.join(__dirname, '../../uploads/claims');

// Create claims upload directory if it doesn't exist
if (!fs.existsSync(claimUploadDir)) {
  fs.mkdirSync(claimUploadDir, { recursive: true });
}

// Configure multer for claim document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, claimUploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_');
    cb(null, `claim-${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter - images and PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const isImage = file.mimetype.startsWith('image/');
  const isPDF = file.mimetype === 'application/pdf';
  
  if (isImage || isPDF) {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'));
  }
};

// Create upload middleware
export const uploadClaimDocument = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for claims
  }
});

// Upload claim document controller
export const uploadClaimFile = async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/claims/${req.file.filename}`;
    
    return res.json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl
    });
  } catch (error) {
    console.error('Claim upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file'
    });
  }
};


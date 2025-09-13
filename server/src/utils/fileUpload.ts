import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    let uploadPath = 'uploads/';
    
    // Organize uploads by type
    if (file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'communityImage') {
      uploadPath += 'community/';
    } else if (file.fieldname === 'kycDocument') {
      uploadPath += 'kyc/documents/';
    } else if (file.fieldname === 'selfieImage') {
      uploadPath += 'kyc/selfies/';
    } else {
      uploadPath += 'misc/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter for images only
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Document filter for KYC documents
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files and PDFs are allowed'));
  }
};

// Configure multer instances
export const uploadProfileImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
}).single('profileImage');

export const uploadCommunityImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
}).single('communityImage');

export const uploadKycDocuments = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 2 // Document + selfie
  }
}).fields([
  { name: 'kycDocument', maxCount: 1 },
  { name: 'selfieImage', maxCount: 1 }
]);

// Utility function to get file URL
export const getFileUrl = (filename: string, type: 'profile' | 'community' | 'kyc-document' | 'kyc-selfie' | 'misc' = 'misc'): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  let folder = '';
  
  switch (type) {
    case 'profile':
      folder = 'profiles';
      break;
    case 'community':
      folder = 'community';
      break;
    case 'kyc-document':
      folder = 'kyc/documents';
      break;
    case 'kyc-selfie':
      folder = 'kyc/selfies';
      break;
    default:
      folder = 'misc';
  }
  
  return `${baseUrl}/uploads/${folder}/${filename}`;
};

// Error handler for multer errors
export const handleMulterError = (error: any): string => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return 'File size too large';
      case 'LIMIT_FILE_COUNT':
        return 'Too many files uploaded';
      case 'LIMIT_UNEXPECTED_FILE':
        return 'Unexpected file field';
      default:
        return 'File upload error';
    }
  }
  return error.message || 'Unknown upload error';
};
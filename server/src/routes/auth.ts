import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { blockchainService } from '../services/blockchain';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        firstName,
        lastName,
        phone
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedNewPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit KYC Application
router.post('/kyc/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      aadhaarNumber,
      fullName,
      dateOfBirth,
      address,
      phoneNumber,
      email,
      documentType,
      documentNumber,
      documentImage,
      selfieImage
    } = req.body;

    // Validate required fields
    if (!aadhaarNumber || !fullName || !dateOfBirth || !address || !phoneNumber || !email || !documentImage || !selfieImage) {
      return res.status(400).json({ message: 'All KYC fields are required' });
    }

    // Check if KYC already exists
    const existingKyc = await prisma.kycApplication.findUnique({
      where: { userId: req.user!.id }
    });

    if (existingKyc) {
      return res.status(400).json({ message: 'KYC application already submitted' });
    }

    // Check if Aadhaar number is already used
    const existingAadhaar = await prisma.kycApplication.findUnique({
      where: { aadhaarNumber }
    });

    if (existingAadhaar) {
      return res.status(400).json({ message: 'Aadhaar number already registered' });
    }

    // Generate digital ID from blockchain
    let digitalId = null;
    let digitalIdNumber = null;
    
    try {
      console.log('Generating digital ID from blockchain...');
      
      // Convert date of birth to timestamp
      const dobTimestamp = Math.floor(new Date(dateOfBirth).getTime() / 1000);
      
      // Generate digital ID using blockchain service
      const digitalIDResult = await blockchainService.generateDigitalID(aadhaarNumber, dobTimestamp);
      
      digitalId = digitalIDResult.publicKey;
      digitalIdNumber = digitalIDResult.digitalIdNumber;
      
      console.log('Digital ID generated successfully:', {
        digitalIdNumber,
        publicKey: digitalId,
        status: digitalIDResult.status
      });
    } catch (blockchainError) {
      console.error('Blockchain digital ID generation failed:', blockchainError);
      // Continue with KYC submission even if blockchain fails
      // The digital ID can be generated later by admin
    }

    // Update user with KYC details and digital ID
    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        aadhaarNumber,
        dateOfBirth: new Date(dateOfBirth),
        firstName: fullName?.split(' ')[0],
        lastName: fullName?.split(' ').slice(1).join(' '),
        phone: phoneNumber,
        email: email,
        digitalId: digitalId,
        safetyScore: digitalId ? 75.0 : 0.0 // Set initial safety score if digital ID is generated
      }
    });

    res.status(201).json({
      message: 'KYC details submitted successfully',
      user: {
        id: updatedUser.id,
        aadhaarNumber: updatedUser.aadhaarNumber,
        dateOfBirth: updatedUser.dateOfBirth,
        digitalId: updatedUser.digitalId,
        safetyScore: updatedUser.safetyScore,
        updatedAt: updatedUser.updatedAt
      },
      blockchain: {
        digitalIdGenerated: !!digitalId,
        digitalIdNumber: digitalIdNumber,
        publicKey: digitalId
      }
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get KYC Status
router.get('/kyc/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const kycApplication = await prisma.kycApplication.findUnique({
      where: { userId: req.user!.id },
      select: {
        id: true,
        status: true,
        adminComments: true,
        verifiedAt: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!kycApplication) {
      return res.status(404).json({ message: 'No KYC application found' });
    }

    res.json({ kycApplication });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Emergency Contacts
router.put('/emergency-contacts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { emergencyContacts } = req.body;

    if (!Array.isArray(emergencyContacts)) {
      return res.status(400).json({ message: 'Emergency contacts must be an array' });
    }

    // Validate emergency contacts format
    for (const contact of emergencyContacts) {
      if (!contact.name || !contact.phone || !contact.relation) {
        return res.status(400).json({ message: 'Each contact must have name, phone, and relation' });
      }
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { emergencyContacts }
    });

    res.json({ message: 'Emergency contacts updated successfully' });
  } catch (error) {
    console.error('Emergency contacts update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticateAdminToken, AdminAuthRequest } from '../middleware/adminAuth';
import { blockchainService } from '../services/blockchain';

const router = Router();

// Admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { adminId: admin.id, role: admin.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Admin login successful',
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard overview statistics
router.get('/dashboard/overview', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    // Get current statistics
    const [
      totalUsers,
      activeTrips,
      pendingKyc,
      activeSos,
      recentCommunityReports,
      todayStats
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.trip.count({ where: { status: 'ACTIVE' } }),
      prisma.kycApplication.count({ where: { status: 'SUBMITTED' } }),
      prisma.sosRequest.count({ where: { status: { in: ['NEW', 'IN_PROGRESS'] } } }),
      prisma.communityPost.count({ where: { status: 'OPEN' } }),
      prisma.trip.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    // Get recent activities
    const recentSos = await prisma.sosRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, phone: true }
        }
      }
    });

    const recentReports = await prisma.communityPost.findMany({
      take: 5,
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    res.json({
      overview: {
        totalUsers,
        activeTrips,
        pendingKyc,
        activeSos,
        recentCommunityReports,
        todayStats
      },
      recentActivity: {
        sosRequests: recentSos,
        communityReports: recentReports
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get trips by location
router.get('/trips/location/:location', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { location } = req.params;
    const { status = 'ACTIVE', limit = '20', offset = '0' } = req.query;

    let whereClause: any = {
      OR: [
        { startLocation: { contains: location, mode: 'insensitive' } },
        { endLocation: { contains: location, mode: 'insensitive' } }
      ]
    };

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            currentLatitude: true,
            currentLongitude: true,
            lastLocationUpdate: true
          }
        },
        _count: {
          select: {
            sosRequests: true,
            communityPosts: true,
            locationUpdates: true
          }
        },
        sosRequests: {
          where: { status: { in: ['NEW', 'IN_PROGRESS'] } },
          orderBy: { createdAt: 'desc' }
        },
        communityPosts: {
          where: { status: 'OPEN' },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({
      trips,
      location,
      total: trips.length
    });
  } catch (error) {
    console.error('Get trips by location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get detailed trip information for admin
router.get('/trips/:tripId', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { tripId } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            emergencyContacts: true,
            currentLatitude: true,
            currentLongitude: true,
            lastLocationUpdate: true,
            digitalId: true,
            kycStatus: true
          }
        },
        itineraryItems: {
          orderBy: { order: 'asc' }
        },
        sosRequests: {
          orderBy: { createdAt: 'desc' }
        },
        communityPosts: {
          orderBy: { createdAt: 'desc' }
        },
        locationUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 50 // Latest 50 location updates
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Calculate additional trip metrics
    const totalDistance = trip.locationUpdates.length > 1 
      ? trip.locationUpdates.reduce((total, curr, index) => {
          if (index === 0) return 0;
          const prev = trip.locationUpdates[index - 1];
          const latDiff = curr.latitude - prev.latitude;
          const lonDiff = curr.longitude - prev.longitude;
          return total + Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111;
        }, 0)
      : 0;

    const tripMetrics = {
      totalDistance: Math.round(totalDistance * 100) / 100,
      locationUpdates: trip.locationUpdates.length,
      sosAlerts: trip.sosRequests.length,
      communityReports: trip.communityPosts.length,
      lastLocationUpdate: trip.locationUpdates[0]?.timestamp || null
    };

    res.json({
      trip,
      metrics: tripMetrics
    });
  } catch (error) {
    console.error('Get trip details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all SOS requests for admin dashboard
router.get('/sos-requests', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { status, location, sosType, limit = '50', offset = '0' } = req.query;

    let whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (location) {
      whereClause.location = { contains: location as string, mode: 'insensitive' };
    }
    if (sosType) {
      whereClause.sosType = sosType;
    }

    const sosRequests = await prisma.sosRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            emergencyContacts: true
          }
        },
        trip: {
          select: {
            id: true,
            title: true,
            startLocation: true,
            endLocation: true,
            status: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // NEW first
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({ sosRequests });
  } catch (error) {
    console.error('Get SOS requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update SOS request status (admin action)
router.put('/sos-requests/:id/status', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminComments, responseTime } = req.body;

    if (!['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'FALSE_ALARM'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData: any = {
      status,
      resolvedBy: req.admin!.id
    };

    if (adminComments) {
      updateData.adminComments = adminComments;
    }

    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    if (responseTime) {
      updateData.responseTime = new Date(responseTime);
    }

    const updatedSos = await prisma.sosRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.json({
      message: 'SOS request status updated successfully',
      sosRequest: updatedSos
    });
  } catch (error) {
    console.error('Update SOS status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get community reports for admin review
router.get('/community-reports', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { status, priority, incidentType, location, limit = '50', offset = '0' } = req.query;

    let whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (priority) {
      whereClause.priority = priority;
    }
    if (incidentType) {
      whereClause.incidentType = incidentType;
    }
    if (location) {
      whereClause.location = { contains: location as string, mode: 'insensitive' };
    }

    const reports = await prisma.communityPost.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true
          }
        },
        trip: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({ reports });
  } catch (error) {
    console.error('Get community reports error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update community report status (admin action)
router.put('/community-reports/:id/status', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminComments } = req.body;

    if (!['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData: any = {
      status,
      resolvedBy: req.admin!.id
    };

    if (adminComments) {
      updateData.adminComments = adminComments;
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const updatedReport = await prisma.communityPost.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true
          }
        }
      }
    });

    res.json({
      message: 'Community report status updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Update community report status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get pending KYC applications
router.get('/kyc/pending', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { limit = '20', offset = '0' } = req.query;

    const applications = await prisma.kycApplication.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get pending KYC error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify/Reject KYC application
router.put('/kyc/:id/verify', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, adminComments, digitalId } = req.body; // action: 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ message: 'Action must be APPROVE or REJECT' });
    }

    const application = await prisma.kycApplication.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!application) {
      return res.status(404).json({ message: 'KYC application not found' });
    }

    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    
    // Update KYC application
    const updatedApplication = await prisma.kycApplication.update({
      where: { id },
      data: {
        status,
        adminComments,
        verifiedAt: new Date(),
        verifiedBy: req.admin!.id,
        blockchainTxHash: action === 'APPROVE' ? digitalId : null
      }
    });

    // Update user record
    await prisma.user.update({
      where: { id: application.userId },
      data: {
        kycStatus: status,
        digitalId: action === 'APPROVE' ? digitalId : null
      }
    });

    res.json({
      message: `KYC application ${action.toLowerCase()}d successfully`,
      application: updatedApplication
    });
  } catch (error) {
    console.error('KYC verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get location-based analytics
router.get('/analytics/locations', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { location, startDate, endDate } = req.query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      };
    }

    let locationFilter: any = {};
    if (location) {
      locationFilter = {
        OR: [
          { startLocation: { contains: location as string, mode: 'insensitive' } },
          { endLocation: { contains: location as string, mode: 'insensitive' } }
        ]
      };
    }

    const whereClause = { ...dateFilter, ...locationFilter };

    const [
      tripStats,
      sosStats,
      communityStats,
      topLocations
    ] = await Promise.all([
      prisma.trip.groupBy({
        by: ['status'],
        where: whereClause,
        _count: { id: true }
      }),
      prisma.sosRequest.count({
        where: location ? {
          ...dateFilter,
          location: { contains: location as string, mode: 'insensitive' }
        } : dateFilter
      }),
      prisma.communityPost.count({
        where: location ? {
          ...dateFilter,
          location: { contains: location as string, mode: 'insensitive' }
        } : dateFilter
      }),
      prisma.trip.groupBy({
        by: ['startLocation'],
        where: dateFilter,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      })
    ]);

    res.json({
      analytics: {
        tripsByStatus: tripStats.reduce((acc: any, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        }, {}),
        totalSos: sosStats,
        totalCommunityReports: communityStats,
        topLocations: topLocations.map(loc => ({
          location: loc.startLocation,
          tripCount: loc._count.id
        }))
      },
      filters: { location, startDate, endDate }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Blockchain Management Endpoints

// Get blockchain service status
router.get('/blockchain/status', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const walletAddress = blockchainService.getWalletAddress();
    const balance = await blockchainService.getWalletBalance();
    const totalIds = await blockchainService.getTotalDigitalIDs();

    res.json({
      status: 'Connected',
      walletAddress,
      balance: `${balance} ETH`,
      totalDigitalIds: totalIds,
      contractAddress: process.env.CONTRACT_ADDRESS,
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL
    });
  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({ 
      status: 'Error',
      message: 'Failed to connect to blockchain',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get wallet balance
router.get('/blockchain/balance', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const balance = await blockchainService.getWalletBalance();
    const walletAddress = blockchainService.getWalletAddress();

    res.json({
      walletAddress,
      balance: `${balance} ETH`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Balance check error:', error);
    res.status(500).json({ message: 'Failed to get wallet balance' });
  }
});

// Get total digital IDs on blockchain
router.get('/blockchain/total-ids', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const totalIds = await blockchainService.getTotalDigitalIDs();

    res.json({
      totalDigitalIds: totalIds,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Total IDs check error:', error);
    res.status(500).json({ message: 'Failed to get total digital IDs' });
  }
});

// Generate digital ID for user (admin override)
router.post('/blockchain/generate-digital-id', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { userId, aadhaarNumber, dateOfBirth } = req.body;

    if (!userId || !aadhaarNumber || !dateOfBirth) {
      return res.status(400).json({ message: 'User ID, Aadhaar number, and date of birth are required' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Convert date of birth to timestamp
    const dobTimestamp = Math.floor(new Date(dateOfBirth).getTime() / 1000);

    // Generate digital ID
    const digitalIDResult = await blockchainService.generateDigitalID(aadhaarNumber, dobTimestamp);

    // Update user with digital ID
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        digitalId: digitalIDResult.publicKey,
        safetyScore: 75.0
      }
    });

    res.json({
      message: 'Digital ID generated successfully',
      digitalId: {
        digitalIdNumber: digitalIDResult.digitalIdNumber,
        publicKey: digitalIDResult.publicKey,
        status: digitalIDResult.status,
        issuedTime: digitalIDResult.issuedTime
      },
      user: {
        id: updatedUser.id,
        digitalId: updatedUser.digitalId,
        safetyScore: updatedUser.safetyScore
      }
    });
  } catch (error) {
    console.error('Digital ID generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate digital ID',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Verify digital ID
router.get('/blockchain/verify/:digitalIdNumber', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { digitalIdNumber } = req.params;

    const isValid = await blockchainService.verifyDigitalID(digitalIdNumber);
    const digitalID = await blockchainService.getDigitalID(digitalIdNumber);

    res.json({
      digitalIdNumber,
      isValid,
      digitalId: digitalID,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Digital ID verification error:', error);
    res.status(500).json({ 
      message: 'Failed to verify digital ID',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get digital ID by user address
router.get('/blockchain/user/:address', authenticateAdminToken, async (req: AdminAuthRequest, res: Response) => {
  try {
    const { address } = req.params;

    const digitalID = await blockchainService.getDigitalIDByUser(address);

    res.json({
      userAddress: address,
      digitalId: digitalID,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get digital ID by user error:', error);
    res.status(500).json({ 
      message: 'Failed to get digital ID by user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
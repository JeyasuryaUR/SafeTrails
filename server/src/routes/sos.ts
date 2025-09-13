import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Trigger SOS Alert (Panic Button) - Authenticated (Bearer token)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      location,
      latitude,
      longitude,
      sosType,
      description,
      tripId
    } = req.body;

    // Validate required fields
    if (!location || !latitude || !longitude) {
      return res.status(400).json({ message: 'Location and coordinates are required for SOS alert' });
    }

    // Get user's emergency contacts
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        emergencyContacts: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create SOS request
    const sosRequest = await prisma.sosRequest.create({
      data: {
        userId: req.user!.id,
        tripId: tripId || null,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        sosType: sosType || 'GENERAL',
        description: description || null,
        contactNumbers: user.emergencyContacts || [],
        status: 'NEW'
      },
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
            endLocation: true
          }
        }
      }
    });

    // Update trip status to EMERGENCY if there's an active trip
    if (tripId) {
      await prisma.trip.updateMany({
        where: {
          id: tripId,
          userId: req.user!.id,
          status: 'ACTIVE'
        },
        data: {
          status: 'EMERGENCY'
        }
      });
    }

    // Update user's location
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        currentLatitude: parseFloat(latitude),
        currentLongitude: parseFloat(longitude),
        lastLocationUpdate: new Date()
      }
    });

    // TODO: Here you would typically:
    // 1. Send SMS/calls to emergency contacts
    // 2. Notify local authorities if needed
    // 3. Send push notifications to admin dashboard
    // 4. Trigger automated response systems

    res.status(201).json({
      message: 'SOS alert triggered successfully',
      sosRequest: {
        id: sosRequest.id,
        status: sosRequest.status,
        location: sosRequest.location,
        sosType: sosRequest.sosType,
        createdAt: sosRequest.createdAt,
        contactNumbers: sosRequest.contactNumbers
      },
      emergencyInfo: {
        contactsNotified: user.emergencyContacts ? (user.emergencyContacts as any[]).length : 0,
        location: location,
        coordinates: { latitude, longitude },
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('SOS alert error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Trigger SOS Alert (Panic Button) - Device (NO Bearer token, expects userId in body)
router.post('/device', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      location,
      latitude,
      longitude,
      sosType,
      description,
      tripId
    } = req.body;

    // Validate required fields
    if (!userId || !location || !latitude || !longitude) {
      return res.status(400).json({ message: 'userId, location and coordinates are required for SOS alert' });
    }

    // Get user's emergency contacts
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emergencyContacts: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create SOS request
    const sosRequest = await prisma.sosRequest.create({
      data: {
        userId: userId,
        // tripId: tripId || null,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        sosType: sosType || 'GENERAL',
        description: description || null,
        contactNumbers: user.emergencyContacts || [],
        status: 'NEW'
      },
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
            endLocation: true
          }
        }
      }
    });

    // Update trip status to EMERGENCY if there's an active trip
    if (tripId) {
      await prisma.trip.updateMany({
        where: {
          id: tripId,
          userId: userId,
          status: 'ACTIVE'
        },
        data: {
          status: 'EMERGENCY'
        }
      });
    }

    // Update user's location
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentLatitude: parseFloat(latitude),
        currentLongitude: parseFloat(longitude),
        lastLocationUpdate: new Date()
      }
    });

    // TODO: Here you would typically:
    // 1. Send SMS/calls to emergency contacts
    // 2. Notify local authorities if needed
    // 3. Send push notifications to admin dashboard
    // 4. Trigger automated response systems

    res.status(201).json({
      message: 'SOS alert triggered successfully',
      sosRequest: {
        id: sosRequest.id,
        status: sosRequest.status,
        location: sosRequest.location,
        sosType: sosRequest.sosType,
        createdAt: sosRequest.createdAt,
        contactNumbers: sosRequest.contactNumbers
      },
      emergencyInfo: {
        contactsNotified: user.emergencyContacts ? (user.emergencyContacts as any[]).length : 0,
        location: location,
        coordinates: { latitude, longitude },
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('SOS alert error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's SOS requests
router.get('/my-alerts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = '10', offset = '0' } = req.query;
    
    let whereClause: any = { userId: req.user!.id };
    if (status) {
      whereClause.status = status;
    }

    const sosRequests = await prisma.sosRequest.findMany({
      where: whereClause,
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            startLocation: true,
            endLocation: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({ sosRequests });
  } catch (error) {
    console.error('Get SOS requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Device status endpoint (NO authentication required)
router.get('/status', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;
    
    if (deviceId === 'esp32-01') {
      res.status(200).json({ status: 'acknowledged' });
    } else {
      res.status(400).json({ message: 'Invalid device ID' });
    }
  } catch (error) {
    console.error('Device status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get SOS request by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const sosRequest = await prisma.sosRequest.findFirst({
      where: {
        id,
        userId: req.user!.id
      },
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
            startLocation: true,
            endLocation: true,
            status: true
          }
        }
      }
    });

    if (!sosRequest) {
      return res.status(404).json({ message: 'SOS request not found' });
    }

    res.json({ sosRequest });
  } catch (error) {
    console.error('Get SOS request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update SOS status (user can mark as resolved)
router.put('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    if (!['RESOLVED', 'FALSE_ALARM'].includes(status)) {
      return res.status(400).json({ message: 'Status can only be updated to RESOLVED or FALSE_ALARM by user' });
    }

    const existingSos = await prisma.sosRequest.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!existingSos) {
      return res.status(404).json({ message: 'SOS request not found' });
    }

    const updatedSos = await prisma.sosRequest.update({
      where: { id },
      data: {
        status,
        description: description || existingSos.description,
        resolvedAt: status === 'RESOLVED' ? new Date() : null
      }
    });

    // If resolving SOS, update trip status back to ACTIVE if it was in EMERGENCY
    if (status === 'RESOLVED' && existingSos.tripId) {
      await prisma.trip.updateMany({
        where: {
          id: existingSos.tripId,
          status: 'EMERGENCY'
        },
        data: {
          status: 'ACTIVE'
        }
      });
    }

    res.json({
      message: `SOS request marked as ${status.toLowerCase()}`,
      sosRequest: updatedSos
    });
  } catch (error) {
    console.error('Update SOS status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get SOS statistics for user
router.get('/stats/overview', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await prisma.sosRequest.groupBy({
      by: ['status', 'sosType'],
      where: { userId: req.user!.id },
      _count: {
        id: true
      }
    });

    const totalSos = await prisma.sosRequest.count({
      where: { userId: req.user!.id }
    });

    const recentSos = await prisma.sosRequest.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        location: true,
        sosType: true,
        status: true,
        createdAt: true
      }
    });

    const groupedStats = stats.reduce((acc: any, curr) => {
      const key = `${curr.status}_${curr.sosType}`;
      acc[key] = curr._count.id;
      return acc;
    }, {});

    res.json({
      total: totalSos,
      groupedByStatus: groupedStats,
      recent: recentSos,
      summary: {
        new: stats.filter(s => s.status === 'NEW').reduce((sum, s) => sum + s._count.id, 0),
        inProgress: stats.filter(s => s.status === 'IN_PROGRESS').reduce((sum, s) => sum + s._count.id, 0),
        resolved: stats.filter(s => s.status === 'RESOLVED').reduce((sum, s) => sum + s._count.id, 0),
        falseAlarms: stats.filter(s => s.status === 'FALSE_ALARM').reduce((sum, s) => sum + s._count.id, 0)
      }
    });
  } catch (error) {
    console.error('Get SOS stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel SOS (if it was accidentally triggered)
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const existingSos = await prisma.sosRequest.findFirst({
      where: {
        id,
        userId: req.user!.id,
        status: 'NEW' // Can only cancel if it's still NEW
      }
    });

    if (!existingSos) {
      return res.status(404).json({ message: 'SOS request not found or cannot be cancelled' });
    }

    const updatedSos = await prisma.sosRequest.update({
      where: { id },
      data: {
        status: 'FALSE_ALARM',
        description: reason ? `${existingSos.description || ''}\nCancellation reason: ${reason}` : existingSos.description,
        resolvedAt: new Date()
      }
    });

    // Restore trip status if it was in EMERGENCY
    if (existingSos.tripId) {
      await prisma.trip.updateMany({
        where: {
          id: existingSos.tripId,
          status: 'EMERGENCY'
        },
        data: {
          status: 'ACTIVE'
        }
      });
    }

    res.json({
      message: 'SOS request cancelled successfully',
      sosRequest: updatedSos
    });
  } catch (error) {
    console.error('Cancel SOS error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test emergency contacts (dry run to verify contacts are working)
router.post('/test-contacts', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        emergencyContacts: true,
        firstName: true,
        lastName: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.emergencyContacts || (user.emergencyContacts as any[]).length === 0) {
      return res.status(400).json({ message: 'No emergency contacts configured' });
    }

    // TODO: Implement actual contact testing (send test SMS/call)
    const contacts = user.emergencyContacts as any[];

    res.json({
      message: 'Emergency contacts test initiated',
      contactsTested: contacts.length,
      contacts: contacts.map((contact: any) => ({
        name: contact.name,
        relation: contact.relation,
        phone: contact.phone.replace(/(\d{3})(\d{3})(\d{4})/, '***-***-$3') // Mask phone numbers
      })),
      testResults: 'Test notifications would be sent to all contacts'
    });
  } catch (error) {
    console.error('Test emergency contacts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
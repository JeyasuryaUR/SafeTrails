import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Create a new trip
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      startLocation,
      endLocation,
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
      itineraryItems
    } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate || !startLocation || !endLocation || !startLatitude || !startLongitude || !endLatitude || !endLongitude) {
      return res.status(400).json({ message: 'All trip details are required' });
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        userId: req.user!.id,
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startLocation,
        endLocation,
        startLatitude,
        startLongitude,
        endLatitude,
        endLongitude,
        status: 'PLANNED'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Create itinerary items if provided
    if (itineraryItems && Array.isArray(itineraryItems)) {
      const itineraryData = itineraryItems.map((item: any, index: number) => ({
        tripId: trip.id,
        location: item.location,
        landmark: item.landmark,
        latitude: item.latitude,
        longitude: item.longitude,
        plannedTime: item.plannedTime ? new Date(item.plannedTime) : null,
        order: index + 1
      }));

      await prisma.itineraryItem.createMany({
        data: itineraryData
      });
    }

    res.status(201).json({
      message: 'Trip created successfully',
      trip
    });
  } catch (error) {
    console.error('Trip creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's trips
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = '10', offset = '0' } = req.query;
    
    const whereClause: any = { userId: req.user!.id };
    if (status) {
      whereClause.status = status;
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        itineraryItems: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            communityPosts: true,
            sosRequests: true,
            locationUpdates: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({ trips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get trip by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: req.user!.id
      },
      include: {
        itineraryItems: {
          orderBy: { order: 'asc' }
        },
        communityPosts: {
          orderBy: { createdAt: 'desc' }
        },
        sosRequests: {
          orderBy: { createdAt: 'desc' }
        },
        locationUpdates: {
          orderBy: { timestamp: 'desc' },
          take: 100 // Latest 100 location updates
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({ trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start a trip
router.post('/:id/start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startLatitude, startLongitude } = req.body;

    if (!startLatitude || !startLongitude) {
      return res.status(400).json({ message: 'Starting coordinates are required' });
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: req.user!.id,
        status: 'PLANNED'
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or already started' });
    }

    // Update trip status and start time
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        actualStartTime: new Date()
      }
    });

    // Create initial location update
    await prisma.locationUpdate.create({
      data: {
        userId: req.user!.id,
        tripId: id,
        latitude: parseFloat(startLatitude),
        longitude: parseFloat(startLongitude),
        timestamp: new Date()
      }
    });

    // Update user's current location
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        currentLatitude: parseFloat(startLatitude),
        currentLongitude: parseFloat(startLongitude),
        lastLocationUpdate: new Date()
      }
    });

    res.json({
      message: 'Trip started successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Start trip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// End a trip
router.post('/:id/end', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { endLatitude, endLongitude } = req.body;

    if (!endLatitude || !endLongitude) {
      return res.status(400).json({ message: 'Ending coordinates are required' });
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: req.user!.id,
        status: 'ACTIVE'
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Active trip not found' });
    }

    // Update trip status and end time
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualEndTime: new Date()
      }
    });

    // Create final location update
    await prisma.locationUpdate.create({
      data: {
        userId: req.user!.id,
        tripId: id,
        latitude: parseFloat(endLatitude),
        longitude: parseFloat(endLongitude),
        timestamp: new Date()
      }
    });

    res.json({
      message: 'Trip ended successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('End trip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update trip location (called by scheduler every 10 minutes)
router.post('/:id/update-location', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, accuracy, speed, heading, altitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Coordinates are required' });
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: req.user!.id,
        status: 'ACTIVE'
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Active trip not found' });
    }

    // Create location update
    const locationUpdate = await prisma.locationUpdate.create({
      data: {
        userId: req.user!.id,
        tripId: id,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : null,
        speed: speed ? parseFloat(speed) : null,
        heading: heading ? parseFloat(heading) : null,
        altitude: altitude ? parseFloat(altitude) : null,
        timestamp: new Date()
      }
    });

    // Update user's current location
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        currentLatitude: parseFloat(latitude),
        currentLongitude: parseFloat(longitude),
        lastLocationUpdate: new Date()
      }
    });

    res.json({
      message: 'Location updated successfully',
      locationUpdate
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel a trip
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: req.user!.id,
        status: { in: ['PLANNED', 'ACTIVE'] }
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or cannot be cancelled' });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        description: reason ? `${trip.description || ''}\nCancellation reason: ${reason}` : trip.description
      }
    });

    res.json({
      message: 'Trip cancelled successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Cancel trip error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get trip statistics
router.get('/:id/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        userId: req.user!.id
      },
      include: {
        _count: {
          select: {
            locationUpdates: true,
            communityPosts: true,
            sosRequests: true
          }
        },
        locationUpdates: {
          select: {
            latitude: true,
            longitude: true,
            timestamp: true
          },
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Calculate distance traveled (basic calculation)
    let totalDistance = 0;
    for (let i = 1; i < trip.locationUpdates.length; i++) {
      const prev = trip.locationUpdates[i - 1];
      const curr = trip.locationUpdates[i];
      
      // Simple distance calculation (you might want to use a proper geolib)
      const latDiff = curr.latitude - prev.latitude;
      const lonDiff = curr.longitude - prev.longitude;
      totalDistance += Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // Approximate km
    }

    const stats = {
      tripId: trip.id,
      status: trip.status,
      startTime: trip.actualStartTime,
      endTime: trip.actualEndTime,
      duration: trip.actualStartTime && trip.actualEndTime 
        ? Math.floor((trip.actualEndTime.getTime() - trip.actualStartTime.getTime()) / 1000 / 60) // minutes
        : null,
      totalDistance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
      locationUpdates: trip._count.locationUpdates,
      communityReports: trip._count.communityPosts,
      sosAlerts: trip._count.sosRequests,
      safetyScore: trip.safetyScore
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get trip stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
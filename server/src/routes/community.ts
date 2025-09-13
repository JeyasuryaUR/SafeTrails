import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Create a community report/incident
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      issueDescription,
      location,
      latitude,
      longitude,
      incidentType,
      priority,
      imageUrl,
      tripId
    } = req.body;

    // Validate required fields
    if (!title || !issueDescription || !location || !latitude || !longitude) {
      return res.status(400).json({ message: 'Title, description, location, and coordinates are required' });
    }

    // Create community post
    const communityPost = await prisma.communityPost.create({
      data: {
        userId: req.user!.id,
        tripId: tripId || null,
        title,
        issueDescription,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        incidentType: incidentType || 'OTHER',
        priority: priority || 'MEDIUM',
        imageUrl: imageUrl || null,
        status: 'OPEN'
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        trip: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Community report created successfully',
      report: communityPost
    });
  } catch (error) {
    console.error('Community report creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get community reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      location, 
      incidentType, 
      priority, 
      status = 'OPEN', 
      limit = '20', 
      offset = '0',
      lat,
      lng,
      radius = '10' // km
    } = req.query;

    let whereClause: any = {};
    
    // Filter by status
    if (status !== 'ALL') {
      whereClause.status = status;
    }

    // Filter by incident type
    if (incidentType) {
      whereClause.incidentType = incidentType;
    }

    // Filter by priority
    if (priority) {
      whereClause.priority = priority;
    }

    // Filter by location text
    if (location) {
      whereClause.location = {
        contains: location as string,
        mode: 'insensitive'
      };
    }

    const reports = await prisma.communityPost.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        trip: {
          select: {
            id: true,
            title: true
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

    // Filter by geographic radius if coordinates provided
    let filteredReports = reports;
    if (lat && lng && radius) {
      const centerLat = parseFloat(lat as string);
      const centerLng = parseFloat(lng as string);
      const radiusKm = parseFloat(radius as string);

      filteredReports = reports.filter(report => {
        if (!report.latitude || !report.longitude) return true;
        
        // Simple distance calculation
        const latDiff = report.latitude - centerLat;
        const lngDiff = report.longitude - centerLng;
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Approximate km
        
        return distance <= radiusKm;
      });
    }

    res.json({ 
      reports: filteredReports,
      total: filteredReports.length,
      filters: {
        location,
        incidentType,
        priority,
        status,
        coordinates: lat && lng ? { lat, lng, radius } : null
      }
    });
  } catch (error) {
    console.error('Get community reports error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get community report by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true
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

    if (!report) {
      return res.status(404).json({ message: 'Community report not found' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get community report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like/Unlike a community report
router.post('/:id/like', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'like' or 'unlike'

    const report = await prisma.communityPost.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ message: 'Community report not found' });
    }

    let updateData: any = {};
    if (action === 'like') {
      updateData.likeCount = report.likeCount + 1;
    } else if (action === 'unlike') {
      updateData.likeCount = Math.max(0, report.likeCount - 1);
    } else {
      return res.status(400).json({ message: 'Action must be "like" or "unlike"' });
    }

    const updatedReport = await prisma.communityPost.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: `Report ${action}d successfully`,
      likeCount: updatedReport.likeCount
    });
  } catch (error) {
    console.error('Like/Unlike report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dislike/Remove dislike from a community report
router.post('/:id/dislike', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'dislike' or 'remove_dislike'

    const report = await prisma.communityPost.findUnique({
      where: { id }
    });

    if (!report) {
      return res.status(404).json({ message: 'Community report not found' });
    }

    let updateData: any = {};
    if (action === 'dislike') {
      updateData.dislikeCount = report.dislikeCount + 1;
    } else if (action === 'remove_dislike') {
      updateData.dislikeCount = Math.max(0, report.dislikeCount - 1);
    } else {
      return res.status(400).json({ message: 'Action must be "dislike" or "remove_dislike"' });
    }

    const updatedReport = await prisma.communityPost.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: `Report ${action.replace('_', ' ')}d successfully`,
      dislikeCount: updatedReport.dislikeCount
    });
  } catch (error) {
    console.error('Dislike report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update community report status (for users to update their own reports)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, issueDescription, priority, status } = req.body;

    const existingReport = await prisma.communityPost.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!existingReport) {
      return res.status(404).json({ message: 'Community report not found or you do not have permission to update it' });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (issueDescription) updateData.issueDescription = issueDescription;
    if (priority) updateData.priority = priority;
    if (status && ['OPEN', 'CLOSED'].includes(status)) updateData.status = status;

    const updatedReport = await prisma.communityPost.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      message: 'Community report updated successfully',
      report: updatedReport
    });
  } catch (error) {
    console.error('Update community report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete community report
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingReport = await prisma.communityPost.findFirst({
      where: {
        id,
        userId: req.user!.id
      }
    });

    if (!existingReport) {
      return res.status(404).json({ message: 'Community report not found or you do not have permission to delete it' });
    }

    await prisma.communityPost.delete({
      where: { id }
    });

    res.json({ message: 'Community report deleted successfully' });
  } catch (error) {
    console.error('Delete community report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get community reports by location (for map view)
router.get('/location/:locationName', async (req: Request, res: Response) => {
  try {
    const { locationName } = req.params;
    const { status = 'OPEN', priority, incidentType } = req.query;

    let whereClause: any = {
      location: {
        contains: locationName,
        mode: 'insensitive'
      }
    };

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (incidentType) {
      whereClause.incidentType = incidentType;
    }

    const reports = await prisma.communityPost.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 50 // Limit for map performance
    });

    res.json({ 
      reports,
      location: locationName,
      total: reports.length
    });
  } catch (error) {
    console.error('Get reports by location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
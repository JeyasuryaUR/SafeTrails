import cron from 'node-cron';
import { prisma } from '../lib/prisma';

// Track location updates every 10 minutes for active trips
export const startLocationTrackingScheduler = () => {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('🔄 Running location tracking scheduler...');

      // Get all active trips
      const activeTrips = await prisma.trip.findMany({
        where: { 
          status: 'ACTIVE',
          actualStartTime: {
            not: null
          }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              currentLatitude: true,
              currentLongitude: true,
              lastLocationUpdate: true
            }
          }
        }
      });

      console.log(`📍 Found ${activeTrips.length} active trips to track`);

      // For each active trip, check if we need location updates
      const locationUpdates = [];
      
      for (const trip of activeTrips) {
        const user = trip.user;
        
        // Check if user has current location data
        if (user.currentLatitude && user.currentLongitude) {
          // Check if it's been more than 10 minutes since last update for this trip
          const lastTripUpdate = await prisma.locationUpdate.findFirst({
            where: {
              tripId: trip.id,
              userId: user.id
            },
            orderBy: { timestamp: 'desc' }
          });

          const shouldUpdate = !lastTripUpdate || 
            (new Date().getTime() - new Date(lastTripUpdate.timestamp).getTime()) > 10 * 60 * 1000; // 10 minutes

          if (shouldUpdate) {
            locationUpdates.push({
              userId: user.id,
              tripId: trip.id,
              latitude: user.currentLatitude,
              longitude: user.currentLongitude,
              timestamp: new Date()
            });
          }
        }
      }

      // Batch insert location updates
      if (locationUpdates.length > 0) {
        await prisma.locationUpdate.createMany({
          data: locationUpdates
        });
        console.log(`✅ Created ${locationUpdates.length} location updates`);
      } else {
        console.log('ℹ️  No location updates needed');
      }

    } catch (error) {
      console.error('❌ Location tracking scheduler error:', error);
    }
  });

  console.log('🚀 Location tracking scheduler started (runs every 10 minutes)');
};

// Check for stale trips and mark them as completed if no location updates for 2+ hours
export const startStaleTripsScheduler = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 Checking for stale trips...');

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

      // Find active trips with no recent location updates
      const staleTrips = await prisma.trip.findMany({
        where: {
          status: 'ACTIVE',
          locationUpdates: {
            none: {
              timestamp: {
                gte: twoHoursAgo
              }
            }
          },
          actualStartTime: {
            lte: twoHoursAgo
          }
        },
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

      if (staleTrips.length > 0) {
        // Update stale trips to completed status
        const tripIds = staleTrips.map(trip => trip.id);
        
        await prisma.trip.updateMany({
          where: {
            id: { in: tripIds }
          },
          data: {
            status: 'COMPLETED',
            actualEndTime: new Date()
          }
        });

        console.log(`⚠️  Marked ${staleTrips.length} stale trips as completed`);
        
        // Log details for admin review
        staleTrips.forEach(trip => {
          console.log(`   - Trip: ${trip.title} by ${trip.user.firstName} ${trip.user.lastName}`);
        });
      } else {
        console.log('✅ No stale trips found');
      }

    } catch (error) {
      console.error('❌ Stale trips scheduler error:', error);
    }
  });

  console.log('🚀 Stale trips scheduler started (runs hourly)');
};

// Auto-resolve old SOS requests that haven't been updated
export const startSosCleanupScheduler = () => {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🔄 Running SOS cleanup...');

      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

      // Find old unresolved SOS requests
      const oldSosRequests = await prisma.sosRequest.findMany({
        where: {
          status: { in: ['NEW', 'ACKNOWLEDGED', 'IN_PROGRESS'] },
          createdAt: {
            lte: threeDaysAgo
          }
        }
      });

      if (oldSosRequests.length > 0) {
        // Mark as resolved with auto-resolution note
        await prisma.sosRequest.updateMany({
          where: {
            id: { in: oldSosRequests.map(sos => sos.id) }
          },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date(),
            adminComments: 'Auto-resolved: No activity for 3+ days'
          }
        });

        console.log(`🧹 Auto-resolved ${oldSosRequests.length} old SOS requests`);
      } else {
        console.log('✅ No old SOS requests to clean up');
      }

    } catch (error) {
      console.error('❌ SOS cleanup scheduler error:', error);
    }
  });

  console.log('🚀 SOS cleanup scheduler started (runs daily at 2 AM)');
};

// Calculate and update safety scores for users
export const startSafetyScoreUpdateScheduler = () => {
  // Run daily at 3 AM
  cron.schedule('0 3 * * *', async () => {
    try {
      console.log('🔄 Updating safety scores...');

      // Get all active users
      const users = await prisma.user.findMany({
        where: { isActive: true },
        include: {
          trips: {
            where: {
              status: { in: ['COMPLETED', 'ACTIVE'] }
            }
          },
          sosRequests: true,
          communityPosts: true
        }
      });

      const userUpdates = [];

      for (const user of users) {
        // Simple safety score calculation
        let score = 100; // Start with perfect score

        // Deduct points for SOS requests
        const sosCount = user.sosRequests.length;
        score -= sosCount * 10; // -10 per SOS

        // Add points for community contributions
        const communityCount = user.communityPosts.length;
        score += Math.min(communityCount * 2, 20); // +2 per post, max +20

        // Add points for completed trips without issues
        const completedTrips = user.trips.filter(trip => trip.status === 'COMPLETED').length;
        score += Math.min(completedTrips * 1, 30); // +1 per completed trip, max +30

        // Ensure score is between 0 and 100
        score = Math.max(0, Math.min(100, score));

        if (score !== user.safetyScore) {
          userUpdates.push({
            id: user.id,
            safetyScore: score
          });
        }
      }

      // Batch update safety scores
      if (userUpdates.length > 0) {
        for (const update of userUpdates) {
          await prisma.user.update({
            where: { id: update.id },
            data: { safetyScore: update.safetyScore }
          });
        }
        console.log(`📊 Updated safety scores for ${userUpdates.length} users`);
      } else {
        console.log('ℹ️  No safety score updates needed');
      }

    } catch (error) {
      console.error('❌ Safety score update scheduler error:', error);
    }
  });

  console.log('🚀 Safety score update scheduler started (runs daily at 3 AM)');
};

// Start all schedulers
export const startAllSchedulers = () => {
  console.log('🎯 Starting all schedulers...');
  startLocationTrackingScheduler();
  startStaleTripsScheduler();
  startSosCleanupScheduler();
  startSafetyScoreUpdateScheduler();
  console.log('✅ All schedulers started successfully');
};

// Health check for schedulers
export const getSchedulerHealth = () => {
  return {
    locationTracking: 'Running every 10 minutes',
    staleTripsCheck: 'Running every hour',
    sosCleanup: 'Running daily at 2 AM',
    safetyScoreUpdate: 'Running daily at 3 AM',
    status: 'All schedulers active'
  };
};
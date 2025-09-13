import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@safetrails.com' },
    update: {},
    create: {
      email: 'admin@safetrails.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify([
        'MANAGE_USERS',
        'MANAGE_KYC',
        'MANAGE_TRIPS',
        'MANAGE_SOS',
        'MANAGE_COMMUNITY',
        'VIEW_ANALYTICS',
        'MANAGE_ADMINS'
      ]),
      isActive: true
    }
  });

  console.log('✅ Created admin user:', admin.email);

  // Create sample moderator
  const moderatorPassword = await bcrypt.hash('mod123', 12);
  
  const moderator = await prisma.admin.upsert({
    where: { email: 'moderator@safetrails.com' },
    update: {},
    create: {
      email: 'moderator@safetrails.com',
      password: moderatorPassword,
      firstName: 'John',
      lastName: 'Moderator',
      role: 'MODERATOR',
      permissions: JSON.stringify([
        'MANAGE_COMMUNITY',
        'MANAGE_SOS',
        'VIEW_TRIPS'
      ]),
      isActive: true
    }
  });

  console.log('✅ Created moderator user:', moderator.email);

  // Create sample tourist user
  const touristPassword = await bcrypt.hash('tourist123', 12);
  
  const tourist = await prisma.user.upsert({
    where: { email: 'tourist@example.com' },
    update: {},
    create: {
      email: 'tourist@example.com',
      password: touristPassword,
      firstName: 'Alex',
      lastName: 'Tourist',
      phone: '+1234567890',
      kycStatus: 'APPROVED',
      digitalId: 'DID-SAMPLE-001',
      safetyScore: 95.5,
      emergencyContacts: JSON.stringify([
        {
          name: 'Emergency Contact',
          phone: '+1987654321',
          relation: 'Family'
        },
        {
          name: 'Local Emergency',
          phone: '911',
          relation: 'Emergency Services'
        }
      ]),
      isActive: true
    }
  });

  console.log('✅ Created sample tourist user:', tourist.email);

  // Create sample KYC application
  await prisma.kycApplication.upsert({
    where: { userId: tourist.id },
    update: {},
    create: {
      userId: tourist.id,
      aadhaarNumber: '123456789012',
      fullName: 'Alex Tourist',
      dateOfBirth: new Date('1990-01-15'),
      address: '123 Tourist Street, Travel City, TC 12345',
      phoneNumber: '+1234567890',
      email: 'tourist@example.com',
      documentType: 'AADHAAR',
      documentNumber: '123456789012',
      documentImage: '/uploads/kyc/documents/sample-doc.jpg',
      selfieImage: '/uploads/kyc/selfies/sample-selfie.jpg',
      status: 'APPROVED',
      verifiedAt: new Date(),
      verifiedBy: admin.id,
      blockchainTxHash: 'sample-blockchain-hash'
    }
  });

  console.log('✅ Created sample KYC application');

  // Create sample trip
  const trip = await prisma.trip.create({
    data: {
      userId: tourist.id,
      title: 'Delhi Heritage Tour',
      description: '3-day historical tour of Delhi landmarks',
      startDate: new Date('2025-02-01T10:00:00Z'),
      endDate: new Date('2025-02-03T18:00:00Z'),
      startLocation: 'New Delhi Railway Station',
      endLocation: 'Indira Gandhi International Airport',
      startLatitude: 28.6139,
      startLongitude: 77.2090,
      endLatitude: 28.5562,
      endLongitude: 77.1000,
      status: 'PLANNED',
      safetyScore: 92.0
    }
  });

  console.log('✅ Created sample trip:', trip.title);

  // Create sample itinerary items
  await prisma.itineraryItem.createMany({
    data: [
      {
        tripId: trip.id,
        location: 'Red Fort',
        landmark: 'Historic Monument',
        latitude: 28.6562,
        longitude: 77.2410,
        plannedTime: new Date('2025-02-01T14:00:00Z'),
        safetyScore: 95.0,
        order: 1,
        isCompleted: false
      },
      {
        tripId: trip.id,
        location: 'India Gate',
        landmark: 'War Memorial',
        latitude: 28.6129,
        longitude: 77.2295,
        plannedTime: new Date('2025-02-02T10:00:00Z'),
        safetyScore: 98.0,
        order: 2,
        isCompleted: false
      },
      {
        tripId: trip.id,
        location: 'Qutub Minar',
        landmark: 'UNESCO World Heritage Site',
        latitude: 28.5244,
        longitude: 77.1855,
        plannedTime: new Date('2025-02-02T15:00:00Z'),
        safetyScore: 90.0,
        order: 3,
        isCompleted: false
      }
    ]
  });

  console.log('✅ Created sample itinerary items');

  // Create sample community post
  const communityPost = await prisma.communityPost.create({
    data: {
      userId: tourist.id,
      tripId: trip.id,
      title: 'Construction work near Red Fort',
      issueDescription: 'Heavy construction blocking main entrance, expect delays',
      location: 'Red Fort, Delhi',
      latitude: 28.6562,
      longitude: 77.2410,
      incidentType: 'INFRASTRUCTURE',
      priority: 'MEDIUM',
      status: 'OPEN',
      likeCount: 5,
      dislikeCount: 0
    }
  });

  console.log('✅ Created sample community post:', communityPost.title);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
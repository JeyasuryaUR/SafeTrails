# SafeTrails API - Quick Start Guide

## ✅ Setup Complete!

Your SafeTrails API server is now fully configured and ready to use!

## 🚀 Starting the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 🌐 Server URLs

- **Main API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **Scheduler Status**: http://localhost:3000/scheduler-health
- **API Documentation**: See API_DOCUMENTATION.md

## 🔑 Pre-configured Accounts

### Tourist Account
- **Email**: `tourist@example.com`
- **Password**: `tourist123`
- **Features**: Approved KYC, Digital ID, Sample trip planned

### Admin Account
- **Email**: `admin@safetrails.com`
- **Password**: `admin123`
- **Role**: Super Admin (Full permissions)

### Moderator Account
- **Email**: `moderator@safetrails.com`
- **Password**: `mod123`
- **Role**: Moderator (Community & SOS management)

## 📊 Database Status

✅ **PostgreSQL Connected**: Your Render database is configured and seeded
✅ **Sample Data Available**: Users, trips, community posts, KYC applications
✅ **Schedulers Running**: Location tracking, SOS cleanup, safety scoring

## 🔥 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/kyc/submit` - Submit KYC application
- `GET /api/auth/kyc/status` - Check KYC status

### Trip Management
- `POST /api/trips` - Create trip
- `POST /api/trips/:id/start` - Start trip
- `POST /api/trips/:id/update-location` - Update location
- `POST /api/trips/:id/end` - End trip
- `GET /api/trips` - Get user trips

### Emergency & Safety
- `POST /api/sos` - Trigger SOS alert
- `GET /api/sos/my-alerts` - Get SOS history
- `POST /api/community` - Report incident
- `GET /api/community` - Get community reports

### Admin Dashboard
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/overview` - Dashboard stats
- `GET /api/admin/trips/location/:location` - Monitor trips by location
- `PUT /api/admin/sos-requests/:id/status` - Manage SOS requests
- `PUT /api/admin/kyc/:id/verify` - Approve/reject KYC

## 📱 Testing with Frontend

### Sample API Calls

**User Registration:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**User Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tourist@example.com",
    "password": "tourist123"
  }'
```

**Create Trip (with auth token):**
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Mumbai Tour",
    "startDate": "2025-02-15T10:00:00Z",
    "endDate": "2025-02-17T18:00:00Z",
    "startLocation": "Mumbai Airport",
    "endLocation": "Gateway of India",
    "startLatitude": 19.0896,
    "startLongitude": 72.8656,
    "endLatitude": 18.9220,
    "endLongitude": 72.8347
  }'
```

## ⚙️ Automated Features

### 🕒 Schedulers (Running Every 10 Minutes)
- **Location Tracking**: Updates location for active trips
- **Stale Trip Detection**: Auto-completes inactive trips  
- **SOS Cleanup**: Resolves old emergency requests
- **Safety Scoring**: Updates user safety metrics

### 📁 File Uploads
- Upload directories created at: `uploads/profiles/`, `uploads/community/`, `uploads/kyc/`
- Supported formats: JPEG, PNG, GIF, WebP, PDF
- Size limits: 5-10MB depending on type

## 🔧 Development Commands

```bash
# Database operations
npm run db:generate    # Generate Prisma client
npm run db:seed       # Seed sample data
npm run db:studio     # Open Prisma Studio (DB GUI)

# Development
npm run build         # Build TypeScript
npm run dev          # Start with hot reload
npm start            # Start production server

# Testing
node test-api.js     # Test database connection
```

## 📖 Full Documentation

See `API_DOCUMENTATION.md` for complete endpoint documentation with request/response examples.

## 🎯 Next Steps for Mobile App Integration

1. **Update mobile app API base URL** to `http://localhost:3000`
2. **Implement JWT token storage** for authenticated requests
3. **Connect registration/login screens** to `/api/auth` endpoints
4. **Add location tracking** calls to `/api/trips/:id/update-location`
5. **Implement SOS button** to trigger `/api/sos` endpoint
6. **Add community reporting** to `/api/community` endpoint

Your SafeTrails API server is now ready for full integration! 🚀
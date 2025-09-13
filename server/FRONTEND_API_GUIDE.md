# SafeTrails API - Complete Frontend Integration Guide

## 🌐 Base Configuration

**Base URL**: `http://localhost:3000`  
**Content-Type**: `application/json`  
**Authentication**: Bearer Token in Authorization header  

---

## 📖 Table of Contents

1. [Authentication & User Management](#authentication--user-management)
2. [Trip Management](#trip-management)  
3. [Community Safety Reports](#community-safety-reports)
4. [Emergency SOS System](#emergency-sos-system)
5. [Admin Dashboard](#admin-dashboard)
6. [System Endpoints](#system-endpoints)
7. [Error Handling](#error-handling)
8. [Ready-to-Use Test Accounts](#ready-to-use-test-accounts)

---

# Authentication & User Management

## 1. User Registration

**Endpoint**: `POST /api/auth/register`  
**Authentication**: None required  

### Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "johndoe@example.com",
    "password": "securePass123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+9876543210"
  }'
```

### Success Response (201):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "clw123abc456",
    "email": "johndoe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+9876543210",
    "createdAt": "2025-01-13T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. User Login

**Endpoint**: `POST /api/auth/login`  
**Authentication**: None required  

### Request Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tourist@example.com",
    "password": "tourist123"
  }'
```

### Success Response (200):
```json
{
  "message": "Login successful",
  "user": {
    "id": "clw123abc456",
    "email": "tourist@example.com",
    "firstName": "Alex",
    "lastName": "Tourist",
    "phone": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. Get User Profile

**Endpoint**: `GET /api/auth/profile`  
**Authentication**: Bearer Token required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "user": {
    "id": "clw123abc456",
    "email": "tourist@example.com",
    "firstName": "Alex",
    "lastName": "Tourist",
    "phone": "+1234567890",
    "isActive": true,
    "createdAt": "2025-01-13T10:30:00.000Z",
    "updatedAt": "2025-01-13T10:30:00.000Z"
  }
}
```

---

## 4. Update User Profile

**Endpoint**: `PUT /api/auth/profile`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "firstName": "John",
  "lastName": "Updated",
  "phone": "+9999999999"
}
```

### cURL Example:
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Updated",
    "phone": "+9999999999"
  }'
```

### Success Response (200):
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "clw123abc456",
    "email": "tourist@example.com",
    "firstName": "John",
    "lastName": "Updated",
    "phone": "+9999999999",
    "updatedAt": "2025-01-13T11:30:00.000Z"
  }
}
```

---

## 5. Change Password

**Endpoint**: `PUT /api/auth/change-password`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### cURL Example:
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "tourist123",
    "newPassword": "newPassword123"
  }'
```

### Success Response (200):
```json
{
  "message": "Password changed successfully"
}
```

---

## 6. Submit KYC Application

**Endpoint**: `POST /api/auth/kyc/submit`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "aadhaarNumber": "123456789012",
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main Street, City, State 12345",
  "phoneNumber": "+1234567890",
  "email": "user@example.com",
  "documentType": "AADHAAR",
  "documentNumber": "123456789012",
  "documentImage": "https://example.com/document.jpg",
  "selfieImage": "https://example.com/selfie.jpg"
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/auth/kyc/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "aadhaarNumber": "987654321098",
    "fullName": "John Doe",
    "dateOfBirth": "1990-01-15",
    "address": "123 Main Street, Mumbai, Maharashtra 400001",
    "phoneNumber": "+919876543210",
    "email": "johndoe@example.com",
    "documentType": "AADHAAR",
    "documentNumber": "987654321098",
    "documentImage": "https://example.com/aadhaar-front.jpg",
    "selfieImage": "https://example.com/selfie.jpg"
  }'
```

### Success Response (201):
```json
{
  "message": "KYC application submitted successfully",
  "application": {
    "id": "clw789ghi012",
    "status": "SUBMITTED",
    "createdAt": "2025-01-13T10:30:00.000Z"
  }
}
```

---

## 7. Get KYC Status

**Endpoint**: `GET /api/auth/kyc/status`  
**Authentication**: Bearer Token required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/auth/kyc/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "kycApplication": {
    "id": "clw789ghi012",
    "status": "APPROVED",
    "adminComments": "Documents verified successfully",
    "verifiedAt": "2025-01-13T12:00:00.000Z",
    "createdAt": "2025-01-13T10:30:00.000Z",
    "updatedAt": "2025-01-13T12:00:00.000Z"
  }
}
```

---

## 8. Update Emergency Contacts

**Endpoint**: `PUT /api/auth/emergency-contacts`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "emergencyContacts": [
    {
      "name": "Jane Doe",
      "phone": "+1987654321",
      "relation": "Spouse"
    },
    {
      "name": "Emergency Services",
      "phone": "911",
      "relation": "Emergency"
    },
    {
      "name": "Local Police",
      "phone": "100",
      "relation": "Police"
    }
  ]
}
```

### cURL Example:
```bash
curl -X PUT http://localhost:3000/api/auth/emergency-contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "emergencyContacts": [
      {
        "name": "Jane Doe",
        "phone": "+1987654321",
        "relation": "Spouse"
      },
      {
        "name": "Emergency Services",
        "phone": "108",
        "relation": "Ambulance"
      }
    ]
  }'
```

### Success Response (200):
```json
{
  "message": "Emergency contacts updated successfully"
}
```

---

# Trip Management

## 9. Create Trip

**Endpoint**: `POST /api/trips`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "title": "Delhi Heritage Tour",
  "description": "3-day historical tour of Delhi landmarks",
  "startDate": "2025-02-01T10:00:00Z",
  "endDate": "2025-02-03T18:00:00Z",
  "startLocation": "New Delhi Railway Station",
  "endLocation": "Indira Gandhi International Airport",
  "startLatitude": 28.6139,
  "startLongitude": 77.2090,
  "endLatitude": 28.5562,
  "endLongitude": 77.1000,
  "itineraryItems": [
    {
      "location": "Red Fort",
      "landmark": "Historic Monument",
      "latitude": 28.6562,
      "longitude": 77.2410,
      "plannedTime": "2025-02-01T14:00:00Z"
    },
    {
      "location": "India Gate",
      "landmark": "War Memorial",
      "latitude": 28.6129,
      "longitude": 77.2295,
      "plannedTime": "2025-02-02T10:00:00Z"
    }
  ]
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Mumbai Beach Tour",
    "description": "2-day Mumbai coastal exploration",
    "startDate": "2025-02-15T09:00:00Z",
    "endDate": "2025-02-16T20:00:00Z",
    "startLocation": "Chhatrapati Shivaji Terminus",
    "endLocation": "Mumbai Airport",
    "startLatitude": 18.9401,
    "startLongitude": 72.8350,
    "endLatitude": 19.0896,
    "endLongitude": 72.8656,
    "itineraryItems": [
      {
        "location": "Marine Drive",
        "landmark": "Queens Necklace",
        "latitude": 18.9431,
        "longitude": 72.8236,
        "plannedTime": "2025-02-15T11:00:00Z"
      },
      {
        "location": "Gateway of India",
        "landmark": "Historic Monument",
        "latitude": 18.9218,
        "longitude": 72.8347,
        "plannedTime": "2025-02-15T15:00:00Z"
      }
    ]
  }'
```

### Success Response (201):
```json
{
  "message": "Trip created successfully",
  "trip": {
    "id": "clw456def789",
    "userId": "clw123abc456",
    "title": "Mumbai Beach Tour",
    "description": "2-day Mumbai coastal exploration",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-16T20:00:00.000Z",
    "startLocation": "Chhatrapati Shivaji Terminus",
    "endLocation": "Mumbai Airport",
    "startLatitude": 18.9401,
    "startLongitude": 72.8350,
    "endLatitude": 19.0896,
    "endLongitude": 72.8656,
    "status": "PLANNED",
    "safetyScore": 0.0,
    "createdAt": "2025-01-13T10:30:00.000Z",
    "user": {
      "id": "clw123abc456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "johndoe@example.com"
    }
  }
}
```

---

## 10. Get User's Trips

**Endpoint**: `GET /api/trips`  
**Authentication**: Bearer Token required  
**Query Parameters**: 
- `status`: PLANNED | ACTIVE | COMPLETED | CANCELLED (optional)
- `limit`: number (default: 10)
- `offset`: number (default: 0)

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/trips?status=ACTIVE&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "trips": [
    {
      "id": "clw456def789",
      "title": "Mumbai Beach Tour",
      "description": "2-day Mumbai coastal exploration",
      "startDate": "2025-02-15T09:00:00.000Z",
      "endDate": "2025-02-16T20:00:00.000Z",
      "startLocation": "Chhatrapati Shivaji Terminus",
      "endLocation": "Mumbai Airport",
      "status": "ACTIVE",
      "safetyScore": 95.5,
      "createdAt": "2025-01-13T10:30:00.000Z",
      "itineraryItems": [
        {
          "id": "clw789ghi012",
          "location": "Marine Drive",
          "landmark": "Queens Necklace",
          "latitude": 18.9431,
          "longitude": 72.8236,
          "plannedTime": "2025-02-15T11:00:00.000Z",
          "order": 1,
          "isCompleted": false
        }
      ],
      "_count": {
        "communityPosts": 0,
        "sosRequests": 0,
        "locationUpdates": 25
      }
    }
  ]
}
```

---

## 11. Get Trip Details

**Endpoint**: `GET /api/trips/:id`  
**Authentication**: Bearer Token required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/trips/clw456def789 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "trip": {
    "id": "clw456def789",
    "title": "Mumbai Beach Tour",
    "description": "2-day Mumbai coastal exploration",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-16T20:00:00.000Z",
    "startLocation": "Chhatrapati Shivaji Terminus",
    "endLocation": "Mumbai Airport",
    "status": "ACTIVE",
    "actualStartTime": "2025-02-15T09:15:00.000Z",
    "actualEndTime": null,
    "safetyScore": 95.5,
    "itineraryItems": [
      {
        "id": "clw789ghi012",
        "location": "Marine Drive",
        "landmark": "Queens Necklace",
        "latitude": 18.9431,
        "longitude": 72.8236,
        "plannedTime": "2025-02-15T11:00:00.000Z",
        "order": 1,
        "isCompleted": true
      }
    ],
    "communityPosts": [],
    "sosRequests": [],
    "locationUpdates": [
      {
        "id": "clw012jkl345",
        "latitude": 18.9431,
        "longitude": 72.8236,
        "timestamp": "2025-02-15T11:30:00.000Z",
        "accuracy": 5.0,
        "speed": 0.0
      }
    ],
    "user": {
      "id": "clw123abc456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "johndoe@example.com"
    }
  }
}
```

---

## 12. Start Trip

**Endpoint**: `POST /api/trips/:id/start`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "startLatitude": 18.9401,
  "startLongitude": 72.8350
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/trips/clw456def789/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "startLatitude": 18.9401,
    "startLongitude": 72.8350
  }'
```

### Success Response (200):
```json
{
  "message": "Trip started successfully",
  "trip": {
    "id": "clw456def789",
    "status": "ACTIVE",
    "actualStartTime": "2025-02-15T09:15:00.000Z",
    "updatedAt": "2025-02-15T09:15:00.000Z"
  }
}
```

---

## 13. Update Location During Trip

**Endpoint**: `POST /api/trips/:id/update-location`  
**Authentication**: Bearer Token required  
**Note**: This endpoint is called automatically by the scheduler every 10 minutes, but can also be called manually.

### Request Body:
```json
{
  "latitude": 18.9431,
  "longitude": 72.8236,
  "accuracy": 5.0,
  "speed": 25.5,
  "heading": 180.0,
  "altitude": 10.0
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/trips/clw456def789/update-location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "latitude": 18.9431,
    "longitude": 72.8236,
    "accuracy": 5.0,
    "speed": 15.2,
    "heading": 90.0,
    "altitude": 12.0
  }'
```

### Success Response (200):
```json
{
  "message": "Location updated successfully",
  "locationUpdate": {
    "id": "clw345mno678",
    "userId": "clw123abc456",
    "tripId": "clw456def789",
    "latitude": 18.9431,
    "longitude": 72.8236,
    "accuracy": 5.0,
    "speed": 15.2,
    "heading": 90.0,
    "altitude": 12.0,
    "timestamp": "2025-02-15T11:30:00.000Z"
  }
}
```

---

## 14. End Trip

**Endpoint**: `POST /api/trips/:id/end`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "endLatitude": 19.0896,
  "endLongitude": 72.8656
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/trips/clw456def789/end \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "endLatitude": 19.0896,
    "endLongitude": 72.8656
  }'
```

### Success Response (200):
```json
{
  "message": "Trip ended successfully",
  "trip": {
    "id": "clw456def789",
    "status": "COMPLETED",
    "actualEndTime": "2025-02-16T18:45:00.000Z",
    "updatedAt": "2025-02-16T18:45:00.000Z"
  }
}
```

---

## 15. Cancel Trip

**Endpoint**: `POST /api/trips/:id/cancel`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "reason": "Weather conditions not favorable"
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/trips/clw456def789/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "Unexpected work emergency"
  }'
```

### Success Response (200):
```json
{
  "message": "Trip cancelled successfully",
  "trip": {
    "id": "clw456def789",
    "status": "CANCELLED",
    "description": "2-day Mumbai coastal exploration\nCancellation reason: Unexpected work emergency",
    "updatedAt": "2025-02-15T08:30:00.000Z"
  }
}
```

---

## 16. Get Trip Statistics

**Endpoint**: `GET /api/trips/:id/stats`  
**Authentication**: Bearer Token required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/trips/clw456def789/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "stats": {
    "tripId": "clw456def789",
    "status": "COMPLETED",
    "startTime": "2025-02-15T09:15:00.000Z",
    "endTime": "2025-02-16T18:45:00.000Z",
    "duration": 2010,
    "totalDistance": 45.8,
    "locationUpdates": 142,
    "communityReports": 1,
    "sosAlerts": 0,
    "safetyScore": 95.5
  }
}
```

---

# Community Safety Reports

## 17. Create Community Report

**Endpoint**: `POST /api/community`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "title": "Road closure due to construction",
  "issueDescription": "Major construction work blocking the main road to Gateway of India. Traffic is being diverted through alternate routes.",
  "location": "Near Gateway of India, Mumbai",
  "latitude": 18.9218,
  "longitude": 72.8347,
  "incidentType": "INFRASTRUCTURE",
  "priority": "MEDIUM",
  "imageUrl": "https://example.com/construction-image.jpg",
  "tripId": "clw456def789"
}
```

**Incident Types**: `ROAD_ACCIDENT`, `THEFT`, `HARASSMENT`, `MEDICAL_EMERGENCY`, `NATURAL_DISASTER`, `FRAUD`, `INFRASTRUCTURE`, `OTHER`  
**Priorities**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/community \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Pickpocket alert near Marine Drive",
    "issueDescription": "Multiple reports of pickpocketing incidents near the Marine Drive promenade, especially during evening hours.",
    "location": "Marine Drive, Mumbai",
    "latitude": 18.9431,
    "longitude": 72.8236,
    "incidentType": "THEFT",
    "priority": "HIGH",
    "imageUrl": "https://example.com/warning-sign.jpg"
  }'
```

### Success Response (201):
```json
{
  "message": "Community report created successfully",
  "report": {
    "id": "clw678pqr901",
    "title": "Pickpocket alert near Marine Drive",
    "issueDescription": "Multiple reports of pickpocketing incidents near the Marine Drive promenade, especially during evening hours.",
    "location": "Marine Drive, Mumbai",
    "latitude": 18.9431,
    "longitude": 72.8236,
    "incidentType": "THEFT",
    "priority": "HIGH",
    "status": "OPEN",
    "likeCount": 0,
    "dislikeCount": 0,
    "createdAt": "2025-01-13T15:30:00.000Z",
    "user": {
      "id": "clw123abc456",
      "firstName": "John",
      "lastName": "Doe",
      "email": "johndoe@example.com"
    },
    "trip": null
  }
}
```

---

## 18. Get Community Reports

**Endpoint**: `GET /api/community`  
**Authentication**: None required  
**Query Parameters**: 
- `location`: Filter by location name
- `incidentType`: Filter by incident type
- `priority`: Filter by priority level
- `status`: Filter by status (OPEN, UNDER_REVIEW, RESOLVED, CLOSED)
- `lat`, `lng`, `radius`: Filter by geographic area (radius in km)
- `limit`, `offset`: Pagination

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/community?location=Mumbai&incidentType=THEFT&priority=HIGH&limit=10" \
  -H "Content-Type: application/json"
```

### Success Response (200):
```json
{
  "reports": [
    {
      "id": "clw678pqr901",
      "title": "Pickpocket alert near Marine Drive",
      "issueDescription": "Multiple reports of pickpocketing incidents near the Marine Drive promenade, especially during evening hours.",
      "location": "Marine Drive, Mumbai",
      "latitude": 18.9431,
      "longitude": 72.8236,
      "incidentType": "THEFT",
      "priority": "HIGH",
      "status": "OPEN",
      "likeCount": 12,
      "dislikeCount": 1,
      "imageUrl": "https://example.com/warning-sign.jpg",
      "createdAt": "2025-01-13T15:30:00.000Z",
      "user": {
        "id": "clw123abc456",
        "firstName": "John",
        "lastName": "Doe"
      },
      "trip": {
        "id": "clw456def789",
        "title": "Mumbai Beach Tour"
      }
    }
  ],
  "total": 1,
  "filters": {
    "location": "Mumbai",
    "incidentType": "THEFT",
    "priority": "HIGH",
    "status": null,
    "coordinates": null
  }
}
```

---

## 19. Get Community Report by ID

**Endpoint**: `GET /api/community/:id`  
**Authentication**: None required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/community/clw678pqr901 \
  -H "Content-Type: application/json"
```

### Success Response (200):
```json
{
  "report": {
    "id": "clw678pqr901",
    "title": "Pickpocket alert near Marine Drive",
    "issueDescription": "Multiple reports of pickpocketing incidents near the Marine Drive promenade, especially during evening hours.",
    "location": "Marine Drive, Mumbai",
    "latitude": 18.9431,
    "longitude": 72.8236,
    "incidentType": "THEFT",
    "priority": "HIGH",
    "status": "OPEN",
    "likeCount": 12,
    "dislikeCount": 1,
    "imageUrl": "https://example.com/warning-sign.jpg",
    "adminComments": null,
    "resolvedAt": null,
    "createdAt": "2025-01-13T15:30:00.000Z",
    "updatedAt": "2025-01-13T16:45:00.000Z",
    "user": {
      "id": "clw123abc456",
      "firstName": "John",
      "lastName": "Doe",
      "profileImage": null
    },
    "trip": {
      "id": "clw456def789",
      "title": "Mumbai Beach Tour",
      "startLocation": "Chhatrapati Shivaji Terminus",
      "endLocation": "Mumbai Airport"
    }
  }
}
```

---

## 20. Like/Unlike Community Report

**Endpoint**: `POST /api/community/:id/like`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "action": "like"
}
```

**Actions**: `like`, `unlike`

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/community/clw678pqr901/like \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "action": "like"
  }'
```

### Success Response (200):
```json
{
  "message": "Report liked successfully",
  "likeCount": 13
}
```

---

## 21. Dislike Community Report

**Endpoint**: `POST /api/community/:id/dislike`  
**Authentication**: Bearer Token required  

### Request Body:
```json
{
  "action": "dislike"
}
```

**Actions**: `dislike`, `remove_dislike`

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/community/clw678pqr901/dislike \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "action": "dislike"
  }'
```

### Success Response (200):
```json
{
  "message": "Report disliked successfully",
  "dislikeCount": 2
}
```

---

## 22. Update Own Community Report

**Endpoint**: `PUT /api/community/:id`  
**Authentication**: Bearer Token required (must be report owner)  

### Request Body:
```json
{
  "title": "Updated: Pickpocket alert resolved",
  "issueDescription": "Police patrol increased in the area. Situation seems under control now.",
  "priority": "LOW",
  "status": "CLOSED"
}
```

### cURL Example:
```bash
curl -X PUT http://localhost:3000/api/community/clw678pqr901 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated: Pickpocket alert resolved",
    "issueDescription": "Police patrol increased in the area. Situation seems under control now.",
    "priority": "LOW"
  }'
```

### Success Response (200):
```json
{
  "message": "Community report updated successfully",
  "report": {
    "id": "clw678pqr901",
    "title": "Updated: Pickpocket alert resolved",
    "issueDescription": "Police patrol increased in the area. Situation seems under control now.",
    "priority": "LOW",
    "updatedAt": "2025-01-13T17:30:00.000Z",
    "user": {
      "id": "clw123abc456",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

## 23. Delete Community Report

**Endpoint**: `DELETE /api/community/:id`  
**Authentication**: Bearer Token required (must be report owner)  

### cURL Example:
```bash
curl -X DELETE http://localhost:3000/api/community/clw678pqr901 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "message": "Community report deleted successfully"
}
```

---

## 24. Get Reports by Location

**Endpoint**: `GET /api/community/location/:locationName`  
**Authentication**: None required  
**Query Parameters**: 
- `status`: Filter by status
- `priority`: Filter by priority
- `incidentType`: Filter by incident type

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/community/location/Mumbai?status=OPEN&priority=HIGH" \
  -H "Content-Type: application/json"
```

### Success Response (200):
```json
{
  "reports": [
    {
      "id": "clw678pqr901",
      "title": "Pickpocket alert near Marine Drive",
      "location": "Marine Drive, Mumbai",
      "incidentType": "THEFT",
      "priority": "HIGH",
      "status": "OPEN",
      "likeCount": 12,
      "createdAt": "2025-01-13T15:30:00.000Z",
      "user": {
        "id": "clw123abc456",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "location": "Mumbai",
  "total": 1
}
```

---

# Emergency SOS System

## 25. Trigger SOS Alert (Panic Button)

**Endpoint**: `POST /api/sos`  
**Authentication**: Bearer Token required  
**CRITICAL**: This endpoint should be used only for real emergencies

### Request Body:
```json
{
  "location": "Near Gateway of India, Mumbai",
  "latitude": 18.9218,
  "longitude": 72.8347,
  "sosType": "GENERAL",
  "description": "Need immediate help - feeling unsafe",
  "tripId": "clw456def789"
}
```

**SOS Types**: `GENERAL`, `MEDICAL`, `SECURITY`, `ACCIDENT`, `NATURAL_DISASTER`

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/sos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "location": "Marine Drive, Mumbai",
    "latitude": 18.9431,
    "longitude": 72.8236,
    "sosType": "SECURITY",
    "description": "Being followed by strangers, need help",
    "tripId": "clw456def789"
  }'
```

### Success Response (201):
```json
{
  "message": "SOS alert triggered successfully",
  "sosRequest": {
    "id": "clw901stu234",
    "status": "NEW",
    "location": "Marine Drive, Mumbai",
    "sosType": "SECURITY",
    "createdAt": "2025-01-13T20:15:00.000Z",
    "contactNumbers": [
      {
        "name": "Jane Doe",
        "phone": "+1987654321",
        "relation": "Spouse"
      },
      {
        "name": "Emergency Services",
        "phone": "108",
        "relation": "Ambulance"
      }
    ]
  },
  "emergencyInfo": {
    "contactsNotified": 2,
    "location": "Marine Drive, Mumbai",
    "coordinates": {
      "latitude": 18.9431,
      "longitude": 72.8236
    },
    "timestamp": "2025-01-13T20:15:00.000Z"
  }
}
```

---

## 26. Get User's SOS Alerts

**Endpoint**: `GET /api/sos/my-alerts`  
**Authentication**: Bearer Token required  
**Query Parameters**: 
- `status`: Filter by SOS status
- `limit`, `offset`: Pagination

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/sos/my-alerts?status=NEW&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "sosRequests": [
    {
      "id": "clw901stu234",
      "location": "Marine Drive, Mumbai",
      "latitude": 18.9431,
      "longitude": 72.8236,
      "sosType": "SECURITY",
      "status": "NEW",
      "description": "Being followed by strangers, need help",
      "createdAt": "2025-01-13T20:15:00.000Z",
      "updatedAt": "2025-01-13T20:15:00.000Z",
      "trip": {
        "id": "clw456def789",
        "title": "Mumbai Beach Tour",
        "startLocation": "Chhatrapati Shivaji Terminus",
        "endLocation": "Mumbai Airport"
      }
    }
  ]
}
```

---

## 27. Get SOS Request Details

**Endpoint**: `GET /api/sos/:id`  
**Authentication**: Bearer Token required (must be request owner)  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/sos/clw901stu234 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "sosRequest": {
    "id": "clw901stu234",
    "location": "Marine Drive, Mumbai",
    "latitude": 18.9431,
    "longitude": 72.8236,
    "sosType": "SECURITY",
    "status": "NEW",
    "description": "Being followed by strangers, need help",
    "contactNumbers": [
      {
        "name": "Jane Doe",
        "phone": "+1987654321",
        "relation": "Spouse"
      }
    ],
    "responseTime": null,
    "resolvedAt": null,
    "adminComments": null,
    "createdAt": "2025-01-13T20:15:00.000Z",
    "user": {
      "id": "clw123abc456",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "email": "johndoe@example.com"
    },
    "trip": {
      "id": "clw456def789",
      "title": "Mumbai Beach Tour",
      "startLocation": "Chhatrapati Shivaji Terminus",
      "endLocation": "Mumbai Airport",
      "status": "EMERGENCY"
    }
  }
}
```

---

## 28. Update SOS Status

**Endpoint**: `PUT /api/sos/:id/status`  
**Authentication**: Bearer Token required (must be request owner)  

### Request Body:
```json
{
  "status": "RESOLVED",
  "description": "Help arrived, situation resolved safely"
}
```

**User can update to**: `RESOLVED`, `FALSE_ALARM`

### cURL Example:
```bash
curl -X PUT http://localhost:3000/api/sos/clw901stu234/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "RESOLVED",
    "description": "Police arrived and escorted me safely"
  }'
```

### Success Response (200):
```json
{
  "message": "SOS request marked as resolved",
  "sosRequest": {
    "id": "clw901stu234",
    "status": "RESOLVED",
    "description": "Police arrived and escorted me safely",
    "resolvedAt": "2025-01-13T20:45:00.000Z",
    "updatedAt": "2025-01-13T20:45:00.000Z"
  }
}
```

---

## 29. Cancel SOS (False Alarm)

**Endpoint**: `POST /api/sos/:id/cancel`  
**Authentication**: Bearer Token required (must be request owner)  

### Request Body:
```json
{
  "reason": "False alarm - misunderstanding resolved"
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/sos/clw901stu234/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "reason": "False alarm - just tourists asking for directions"
  }'
```

### Success Response (200):
```json
{
  "message": "SOS request cancelled successfully",
  "sosRequest": {
    "id": "clw901stu234",
    "status": "FALSE_ALARM",
    "description": "Being followed by strangers, need help\nCancellation reason: False alarm - just tourists asking for directions",
    "resolvedAt": "2025-01-13T20:30:00.000Z",
    "updatedAt": "2025-01-13T20:30:00.000Z"
  }
}
```

---

## 30. Get SOS Statistics

**Endpoint**: `GET /api/sos/stats/overview`  
**Authentication**: Bearer Token required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/sos/stats/overview \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "total": 3,
  "groupedByStatus": {
    "RESOLVED_GENERAL": 1,
    "FALSE_ALARM_SECURITY": 1,
    "NEW_MEDICAL": 1
  },
  "recent": [
    {
      "id": "clw901stu234",
      "location": "Marine Drive, Mumbai",
      "sosType": "SECURITY",
      "status": "RESOLVED",
      "createdAt": "2025-01-13T20:15:00.000Z"
    }
  ],
  "summary": {
    "new": 1,
    "inProgress": 0,
    "resolved": 1,
    "falseAlarms": 1
  }
}
```

---

## 31. Test Emergency Contacts

**Endpoint**: `POST /api/sos/test-contacts`  
**Authentication**: Bearer Token required  

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/sos/test-contacts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "message": "Emergency contacts test initiated",
  "contactsTested": 2,
  "contacts": [
    {
      "name": "Jane Doe",
      "relation": "Spouse",
      "phone": "***-***-4321"
    },
    {
      "name": "Emergency Services",
      "relation": "Ambulance",
      "phone": "***-***-5108"
    }
  ],
  "testResults": "Test notifications would be sent to all contacts"
}
```

---

# Admin Dashboard

## 32. Admin Login

**Endpoint**: `POST /api/admin/login`  
**Authentication**: None required  

### Request Body:
```json
{
  "email": "admin@safetrails.com",
  "password": "admin123"
}
```

### cURL Example:
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@safetrails.com",
    "password": "admin123"
  }'
```

### Success Response (200):
```json
{
  "message": "Admin login successful",
  "admin": {
    "id": "clw567xyz890",
    "email": "admin@safetrails.com",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "SUPER_ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 33. Dashboard Overview

**Endpoint**: `GET /api/admin/dashboard/overview`  
**Authentication**: Admin Bearer Token required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/admin/dashboard/overview \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "overview": {
    "totalUsers": 125,
    "activeTrips": 8,
    "pendingKyc": 3,
    "activeSos": 1,
    "recentCommunityReports": 5,
    "todayStats": 12
  },
  "recentActivity": {
    "sosRequests": [
      {
        "id": "clw901stu234",
        "location": "Marine Drive, Mumbai",
        "sosType": "SECURITY",
        "status": "NEW",
        "createdAt": "2025-01-13T20:15:00.000Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+1234567890"
        }
      }
    ],
    "communityReports": [
      {
        "id": "clw678pqr901",
        "title": "Pickpocket alert near Marine Drive",
        "location": "Marine Drive, Mumbai",
        "priority": "HIGH",
        "status": "OPEN",
        "createdAt": "2025-01-13T15:30:00.000Z",
        "user": {
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    ]
  }
}
```

---

## 34. Get Trips by Location (Admin)

**Endpoint**: `GET /api/admin/trips/location/:location`  
**Authentication**: Admin Bearer Token required  
**Query Parameters**: 
- `status`: Filter by trip status
- `limit`, `offset`: Pagination

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/admin/trips/location/Mumbai?status=ACTIVE" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "trips": [
    {
      "id": "clw456def789",
      "title": "Mumbai Beach Tour",
      "status": "ACTIVE",
      "startLocation": "Chhatrapati Shivaji Terminus",
      "endLocation": "Mumbai Airport",
      "actualStartTime": "2025-02-15T09:15:00.000Z",
      "user": {
        "id": "clw123abc456",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "email": "johndoe@example.com",
        "currentLatitude": 18.9431,
        "currentLongitude": 72.8236,
        "lastLocationUpdate": "2025-02-15T11:30:00.000Z"
      },
      "_count": {
        "sosRequests": 1,
        "communityPosts": 0,
        "locationUpdates": 25
      },
      "sosRequests": [
        {
          "id": "clw901stu234",
          "status": "NEW",
          "sosType": "SECURITY",
          "createdAt": "2025-01-13T20:15:00.000Z"
        }
      ],
      "communityPosts": []
    }
  ],
  "location": "Mumbai",
  "total": 1
}
```

---

## 35. Get Trip Details (Admin)

**Endpoint**: `GET /api/admin/trips/:tripId`  
**Authentication**: Admin Bearer Token required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/api/admin/trips/clw456def789 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "trip": {
    "id": "clw456def789",
    "title": "Mumbai Beach Tour",
    "description": "2-day Mumbai coastal exploration",
    "status": "ACTIVE",
    "startDate": "2025-02-15T09:00:00.000Z",
    "endDate": "2025-02-16T20:00:00.000Z",
    "actualStartTime": "2025-02-15T09:15:00.000Z",
    "actualEndTime": null,
    "user": {
      "id": "clw123abc456",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "email": "johndoe@example.com",
      "emergencyContacts": [
        {
          "name": "Jane Doe",
          "phone": "+1987654321",
          "relation": "Spouse"
        }
      ],
      "currentLatitude": 18.9431,
      "currentLongitude": 72.8236,
      "lastLocationUpdate": "2025-02-15T11:30:00.000Z",
      "digitalId": "DID-SAMPLE-002",
      "kycStatus": "APPROVED"
    },
    "itineraryItems": [
      {
        "id": "clw789ghi012",
        "location": "Marine Drive",
        "landmark": "Queens Necklace",
        "latitude": 18.9431,
        "longitude": 72.8236,
        "plannedTime": "2025-02-15T11:00:00.000Z",
        "order": 1,
        "isCompleted": true
      }
    ],
    "sosRequests": [
      {
        "id": "clw901stu234",
        "sosType": "SECURITY",
        "status": "NEW",
        "location": "Marine Drive, Mumbai",
        "createdAt": "2025-01-13T20:15:00.000Z"
      }
    ],
    "communityPosts": [],
    "locationUpdates": [
      {
        "id": "clw345mno678",
        "latitude": 18.9431,
        "longitude": 72.8236,
        "timestamp": "2025-02-15T11:30:00.000Z",
        "accuracy": 5.0,
        "speed": 15.2
      }
    ]
  },
  "metrics": {
    "totalDistance": 12.5,
    "locationUpdates": 25,
    "sosAlerts": 1,
    "communityReports": 0,
    "lastLocationUpdate": "2025-02-15T11:30:00.000Z"
  }
}
```

---

## 36. Get All SOS Requests (Admin)

**Endpoint**: `GET /api/admin/sos-requests`  
**Authentication**: Admin Bearer Token required  
**Query Parameters**: 
- `status`: Filter by SOS status
- `location`: Filter by location
- `sosType`: Filter by SOS type
- `limit`, `offset`: Pagination

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/admin/sos-requests?status=NEW&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "sosRequests": [
    {
      "id": "clw901stu234",
      "location": "Marine Drive, Mumbai",
      "latitude": 18.9431,
      "longitude": 72.8236,
      "sosType": "SECURITY",
      "status": "NEW",
      "description": "Being followed by strangers, need help",
      "contactNumbers": [
        {
          "name": "Jane Doe",
          "phone": "+1987654321",
          "relation": "Spouse"
        }
      ],
      "createdAt": "2025-01-13T20:15:00.000Z",
      "user": {
        "id": "clw123abc456",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "email": "johndoe@example.com",
        "emergencyContacts": [
          {
            "name": "Jane Doe",
            "phone": "+1987654321",
            "relation": "Spouse"
          }
        ]
      },
      "trip": {
        "id": "clw456def789",
        "title": "Mumbai Beach Tour",
        "startLocation": "Chhatrapati Shivaji Terminus",
        "endLocation": "Mumbai Airport",
        "status": "EMERGENCY"
      }
    }
  ]
}
```

---

## 37. Update SOS Status (Admin)

**Endpoint**: `PUT /api/admin/sos-requests/:id/status`  
**Authentication**: Admin Bearer Token required  

### Request Body:
```json
{
  "status": "IN_PROGRESS",
  "adminComments": "Local police unit dispatched to location",
  "responseTime": "2025-01-13T20:25:00Z"
}
```

**Admin can update to**: `NEW`, `ACKNOWLEDGED`, `IN_PROGRESS`, `RESOLVED`, `FALSE_ALARM`

### cURL Example:
```bash
curl -X PUT http://localhost:3000/api/admin/sos-requests/clw901stu234/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "status": "ACKNOWLEDGED",
    "adminComments": "Alert received, dispatching nearest patrol unit",
    "responseTime": "2025-01-13T20:20:00Z"
  }'
```

### Success Response (200):
```json
{
  "message": "SOS request status updated successfully",
  "sosRequest": {
    "id": "clw901stu234",
    "status": "ACKNOWLEDGED",
    "adminComments": "Alert received, dispatching nearest patrol unit",
    "responseTime": "2025-01-13T20:20:00.000Z",
    "resolvedBy": "clw567xyz890",
    "updatedAt": "2025-01-13T20:20:00.000Z",
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    }
  }
}
```

---

## 38. Get Community Reports (Admin)

**Endpoint**: `GET /api/admin/community-reports`  
**Authentication**: Admin Bearer Token required  
**Query Parameters**: 
- `status`: Filter by report status
- `priority`: Filter by priority
- `incidentType`: Filter by incident type
- `location`: Filter by location
- `limit`, `offset`: Pagination

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/admin/community-reports?status=OPEN&priority=HIGH" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "reports": [
    {
      "id": "clw678pqr901",
      "title": "Pickpocket alert near Marine Drive",
      "issueDescription": "Multiple reports of pickpocketing incidents near the Marine Drive promenade, especially during evening hours.",
      "location": "Marine Drive, Mumbai",
      "latitude": 18.9431,
      "longitude": 72.8236,
      "incidentType": "THEFT",
      "priority": "HIGH",
      "status": "OPEN",
      "likeCount": 12,
      "dislikeCount": 1,
      "imageUrl": "https://example.com/warning-sign.jpg",
      "adminComments": null,
      "resolvedAt": null,
      "createdAt": "2025-01-13T15:30:00.000Z",
      "user": {
        "id": "clw123abc456",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "email": "johndoe@example.com"
      },
      "trip": {
        "id": "clw456def789",
        "title": "Mumbai Beach Tour",
        "status": "ACTIVE"
      }
    }
  ]
}
```

---

## 39. Update Community Report Status (Admin)

**Endpoint**: `PUT /api/admin/community-reports/:id/status`  
**Authentication**: Admin Bearer Token required  

### Request Body:
```json
{
  "status": "UNDER_REVIEW",
  "adminComments": "Verified with local police, investigation ongoing"
}
```

**Admin can update to**: `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `CLOSED`

### cURL Example:
```bash
curl -X PUT http://localhost:3000/api/admin/community-reports/clw678pqr901/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "status": "RESOLVED",
    "adminComments": "Additional patrol units assigned to the area. Situation resolved."
  }'
```

### Success Response (200):
```json
{
  "message": "Community report status updated successfully",
  "report": {
    "id": "clw678pqr901",
    "status": "RESOLVED",
    "adminComments": "Additional patrol units assigned to the area. Situation resolved.",
    "resolvedAt": "2025-01-13T17:30:00.000Z",
    "resolvedBy": "clw567xyz890",
    "updatedAt": "2025-01-13T17:30:00.000Z",
    "user": {
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    }
  }
}
```

---

## 40. Get Pending KYC Applications

**Endpoint**: `GET /api/admin/kyc/pending`  
**Authentication**: Admin Bearer Token required  
**Query Parameters**: 
- `limit`, `offset`: Pagination

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/admin/kyc/pending?limit=5" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "applications": [
    {
      "id": "clw234vwx567",
      "aadhaarNumber": "987654321098",
      "fullName": "Jane Smith",
      "dateOfBirth": "1992-05-20T00:00:00.000Z",
      "address": "456 Tourist Road, Delhi 110001",
      "phoneNumber": "+919876543210",
      "email": "janesmith@example.com",
      "documentType": "AADHAAR",
      "documentNumber": "987654321098",
      "documentImage": "/uploads/kyc/documents/doc-123.jpg",
      "selfieImage": "/uploads/kyc/selfies/selfie-123.jpg",
      "status": "SUBMITTED",
      "createdAt": "2025-01-13T09:00:00.000Z",
      "user": {
        "id": "clw890def123",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "janesmith@example.com",
        "phone": "+919876543210"
      }
    }
  ]
}
```

---

## 41. Verify/Reject KYC Application

**Endpoint**: `PUT /api/admin/kyc/:id/verify`  
**Authentication**: Admin Bearer Token required  

### Request Body:
```json
{
  "action": "APPROVE",
  "adminComments": "Documents verified successfully. Identity confirmed.",
  "digitalId": "DID-2025-001234"
}
```

**Actions**: `APPROVE`, `REJECT`

### cURL Example (Approve):
```bash
curl -X PUT http://localhost:3000/api/admin/kyc/clw234vwx567/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "action": "APPROVE",
    "adminComments": "Documents verified successfully. All information matches government records.",
    "digitalId": "DID-2025-001234"
  }'
```

### cURL Example (Reject):
```bash
curl -X PUT http://localhost:3000/api/admin/kyc/clw234vwx567/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "action": "REJECT",
    "adminComments": "Document image quality too poor for verification. Please resubmit with clearer images."
  }'
```

### Success Response (200):
```json
{
  "message": "KYC application approved successfully",
  "application": {
    "id": "clw234vwx567",
    "status": "APPROVED",
    "adminComments": "Documents verified successfully. All information matches government records.",
    "verifiedAt": "2025-01-13T16:30:00.000Z",
    "verifiedBy": "clw567xyz890",
    "blockchainTxHash": "DID-2025-001234",
    "updatedAt": "2025-01-13T16:30:00.000Z"
  }
}
```

---

## 42. Location-based Analytics

**Endpoint**: `GET /api/admin/analytics/locations`  
**Authentication**: Admin Bearer Token required  
**Query Parameters**: 
- `location`: Filter by specific location
- `startDate`: Start date for analytics period
- `endDate`: End date for analytics period

### cURL Example:
```bash
curl -X GET "http://localhost:3000/api/admin/analytics/locations?location=Mumbai&startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Success Response (200):
```json
{
  "analytics": {
    "tripsByStatus": {
      "PLANNED": 12,
      "ACTIVE": 8,
      "COMPLETED": 45,
      "CANCELLED": 3,
      "EMERGENCY": 1
    },
    "totalSos": 4,
    "totalCommunityReports": 15,
    "topLocations": [
      {
        "location": "Mumbai",
        "tripCount": 28
      },
      {
        "location": "Delhi",
        "tripCount": 22
      },
      {
        "location": "Goa",
        "tripCount": 15
      }
    ]
  },
  "filters": {
    "location": "Mumbai",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
}
```

---

# System Endpoints

## 43. Health Check

**Endpoint**: `GET /health`  
**Authentication**: None required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/health
```

### Success Response (200):
```json
{
  "status": "OK",
  "timestamp": "2025-01-13T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": "45 MB",
    "total": "128 MB"
  },
  "environment": "development"
}
```

---

## 44. Scheduler Health

**Endpoint**: `GET /scheduler-health`  
**Authentication**: None required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/scheduler-health
```

### Success Response (200):
```json
{
  "message": "Scheduler Status",
  "locationTracking": "Running every 10 minutes",
  "staleTripsCheck": "Running every hour",
  "sosCleanup": "Running daily at 2 AM",
  "safetyScoreUpdate": "Running daily at 3 AM",
  "status": "All schedulers active"
}
```

---

## 45. API Root

**Endpoint**: `GET /`  
**Authentication**: None required  

### cURL Example:
```bash
curl -X GET http://localhost:3000/
```

### Success Response (200):
```json
{
  "message": "Welcome to SafeTrails API!",
  "status": "Server is running successfully",
  "version": "1.0.0",
  "port": 3000,
  "environment": "development",
  "endpoints": {
    "authentication": "/api/auth",
    "trips": "/api/trips",
    "community": "/api/community",
    "sos": "/api/sos",
    "admin": "/api/admin",
    "health": "/health",
    "scheduler": "/scheduler-health"
  },
  "features": [
    "🔐 JWT Authentication & KYC Verification",
    "🗺️ Trip Planning & Real-time Tracking",
    "👥 Community Safety Reporting",
    "🚨 Emergency SOS System",
    "📊 Admin Dashboard & Analytics",
    "📸 File Upload Support",
    "⏰ Automated Location Tracking"
  ]
}
```

---

# Error Handling

## Standard Error Response Format

All endpoints return errors in this consistent format:

### Error Response Structure:
```json
{
  "message": "Human-readable error description",
  "error": "Additional technical details (in development mode only)"
}
```

## Common HTTP Status Codes

| Status Code | Description | When It Occurs |
|-------------|-------------|----------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or missing required fields |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | User lacks permission to access resource |
| 404 | Not Found | Requested resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error | Server-side error occurred |

## Example Error Responses

### 400 Bad Request:
```json
{
  "message": "Email and password are required"
}
```

### 401 Unauthorized:
```json
{
  "message": "Access token required"
}
```

### 404 Not Found:
```json
{
  "message": "Trip not found"
}
```

### 403 Forbidden:
```json
{
  "message": "Insufficient permissions",
  "required": ["SUPER_ADMIN", "ADMIN"],
  "current": "MODERATOR"
}
```

---

# Ready-to-Use Test Accounts

## Tourist Account
- **Email**: `tourist@example.com`
- **Password**: `tourist123`
- **Features**: Approved KYC, Digital ID: `DID-SAMPLE-001`, Safety Score: 95.5
- **Sample Trip**: "Delhi Heritage Tour" (ID: available via GET trips endpoint)

## Admin Account  
- **Email**: `admin@safetrails.com`
- **Password**: `admin123`
- **Role**: SUPER_ADMIN (Full permissions)

## Moderator Account
- **Email**: `moderator@safetrails.com`  
- **Password**: `mod123`
- **Role**: MODERATOR (Community & SOS management)

---

# Quick Integration Checklist

## For Mobile App Developers:

### ✅ Authentication Flow
1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login` 
3. **Store JWT Token** in secure storage
4. **Add Bearer Token** to all protected requests

### ✅ Trip Flow
1. **Create Trip**: `POST /api/trips`
2. **Start Trip**: `POST /api/trips/:id/start`  
3. **Update Location**: `POST /api/trips/:id/update-location` (every 10 min)
4. **End Trip**: `POST /api/trips/:id/end`

### ✅ Safety Features
1. **SOS Button**: `POST /api/sos` (CRITICAL - only for real emergencies)
2. **Report Incident**: `POST /api/community`
3. **View Reports**: `GET /api/community`

### ✅ KYC Process
1. **Submit KYC**: `POST /api/auth/kyc/submit` 
2. **Check Status**: `GET /api/auth/kyc/status`
3. **Update Contacts**: `PUT /api/auth/emergency-contacts`

## Sample JWT Token Usage:

```javascript
// Store token after login
localStorage.setItem('authToken', response.token);

// Use token in requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
};
```

---

**🚀 Your SafeTrails API is ready for integration!**

**Base URL**: `http://localhost:3000`  
**Total Endpoints**: 45  
**Authentication**: JWT Bearer Token  
**Documentation Updated**: January 13, 2025
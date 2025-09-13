# SafeTrails Server

A Node.js/Express server with Prisma ORM and PostgreSQL for the SafeTrails application.

## Features

- 🔐 JWT-based authentication
- 👤 User management with profile updates
- 🗄️ PostgreSQL database with Prisma ORM
- 🛡️ Security middleware (Helmet, CORS)
- 📝 Request logging with Morgan
- 🔄 Database migrations and seeding

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL:**
   - Install PostgreSQL on your system
   - Start PostgreSQL service
   - Create a database named `safetrails_db`

3. **Configure environment variables:**
   Update the `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/safetrails_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   NODE_ENV=development
   ```

4. **Set up the database:**
   ```bash
   npm run db:setup
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run db:setup` - Set up database and run migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database and run migrations

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `PUT /api/auth/change-password` - Change user password (requires auth)

### General

- `GET /` - API information
- `GET /health` - Health check

## Example Usage

### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### Get profile (with authentication)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Schema

### User Model
- `id` - Unique identifier (CUID)
- `email` - Email address (unique)
- `password` - Hashed password
- `firstName` - First name (optional)
- `lastName` - Last name (optional)
- `phone` - Phone number (optional)
- `isActive` - Account status (default: true)
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Security Features

- Password hashing with bcryptjs (12 salt rounds)
- JWT tokens with 7-day expiration
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection via Prisma

## Development

The server uses TypeScript and includes:
- Express.js framework
- Prisma ORM for database operations
- JWT for authentication
- bcryptjs for password hashing
- Security middleware
- Request logging

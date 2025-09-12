# SafeTrails Database Setup Guide

## PostgreSQL Installation & Setup

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create a database user (optional, you can use your system user)
createuser -s postgres

# Create the database
createdb safetrails_db
```

### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
CREATE DATABASE safetrails_db;
CREATE USER safetrails_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE safetrails_db TO safetrails_user;
\q
```

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user
4. Open pgAdmin or psql and create the database:
   ```sql
   CREATE DATABASE safetrails_db;
   ```

## Environment Configuration

Update your `.env` file with the correct database URL:

```env
# For local development with default postgres user
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/safetrails_db?schema=public"

# Or if using a custom user
DATABASE_URL="postgresql://safetrails_user:your_password@localhost:5432/safetrails_db?schema=public"
```

## Quick Start

1. **Start PostgreSQL** (if not already running)
2. **Update .env** with your database credentials
3. **Run the setup script:**
   ```bash
   npm run db:setup
   ```
4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Verification

Test the API endpoints using the provided `test-api.http` file or curl:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'
```

## Troubleshooting

### PostgreSQL Connection Issues
- Ensure PostgreSQL is running: `pg_isready`
- Check if the database exists: `psql -l`
- Verify credentials in `.env` file
- Check if the port 5432 is available

### Permission Issues
- Make sure the database user has proper permissions
- Check if the database exists and is accessible

### Migration Issues
- Run `npx prisma migrate reset` to reset the database
- Check Prisma schema for syntax errors
- Ensure all required fields are properly defined

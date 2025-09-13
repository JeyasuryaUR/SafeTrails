#!/bin/bash

# Database setup script for SafeTrails
echo "🗄️  Setting up PostgreSQL database for SafeTrails..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS with Homebrew: brew services start postgresql"
    echo "   On Ubuntu/Debian: sudo systemctl start postgresql"
    echo "   On Windows: Start PostgreSQL service"
    exit 1
fi

# Create database if it doesn't exist
echo "📝 Creating database 'safetrails_db'..."
createdb safetrails_db 2>/dev/null || echo "Database 'safetrails_db' already exists or creation failed"

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
npx prisma migrate dev --name init

echo "✅ Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with the correct database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test the API endpoints at http://localhost:3000"

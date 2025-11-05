#!/bin/bash

# Database Reset Script
echo "🔄 Resetting E-commerce Database..."

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the server directory"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Get database connection details
DB_NAME=${DB_NAME:-ecommerce_db}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "📊 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "🌐 Host: $DB_HOST:$DB_PORT"

# Drop and recreate database
echo "🗑️ Dropping existing database..."
dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo "Database didn't exist"

echo "🆕 Creating fresh database..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
    
    # Run the database setup
    echo "🔧 Setting up database schema and data..."
    node src/utils/setupDatabase.js
    
    if [ $? -eq 0 ]; then
        echo "🎉 Database reset completed successfully!"
        echo "🚀 You can now start the server with: npm run dev"
    else
        echo "❌ Database setup failed"
        exit 1
    fi
else
    echo "❌ Failed to create database"
    exit 1
fi

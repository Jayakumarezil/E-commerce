#!/bin/bash

# E-commerce Platform Setup Script
echo "🚀 Setting up E-commerce Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Create environment files
echo "⚙️  Setting up environment files..."

# Client environment
if [ ! -f "client/.env" ]; then
    cp client/env.example client/.env
    echo "✅ Created client/.env from template"
else
    echo "ℹ️  client/.env already exists"
fi

# Server environment
if [ ! -f "server/.env" ]; then
    cp server/env.example server/.env
    echo "✅ Created server/.env from template"
else
    echo "ℹ️  server/.env already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables in client/.env and server/.env"
echo "2. Set up PostgreSQL database"
echo "3. Run 'npm run dev' to start both client and server"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev          - Start both client and server in development mode"
echo "  npm run build        - Build client for production"
echo "  npm start            - Start production server"
echo "  npm run install:all  - Install dependencies for both client and server"
echo ""
echo "📚 Documentation:"
echo "  - Client runs on: http://localhost:3000"
echo "  - Server runs on: http://localhost:5000"
echo "  - Health check: http://localhost:5000/health"
echo ""
echo "⚠️  Don't forget to:"
echo "  - Configure your database credentials in server/.env"
echo "  - Update JWT secret in server/.env"
echo "  - Set up email configuration if needed"

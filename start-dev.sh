#!/bin/bash

# Development Server Restart Script
echo "🔄 Restarting Development Servers..."

# Kill any existing processes on ports 3000 and 5000
echo "🛑 Stopping existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Wait a moment for ports to be released
sleep 2

# Start backend server
echo "🚀 Starting backend server..."
cd server
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "🚀 Starting frontend server..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers started!"
echo "📊 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo "📋 Health check: http://localhost:5000/health"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit
}

# Trap Ctrl+C
trap cleanup INT

# Wait for user to stop
echo "Press Ctrl+C to stop both servers"
wait

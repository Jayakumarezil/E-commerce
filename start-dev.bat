@echo off
echo 🔄 Restarting Development Servers...

REM Kill any existing processes on ports 3000 and 5000
echo 🛑 Stopping existing servers...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a 2>nul

REM Wait a moment for ports to be released
timeout /t 2 /nobreak >nul

REM Start backend server
echo 🚀 Starting backend server...
start "Backend Server" cmd /k "cd server && npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🚀 Starting frontend server...
start "Frontend Server" cmd /k "cd client && npm run dev"

echo ✅ Both servers started!
echo 📊 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo 📋 Health check: http://localhost:5000/health
echo.
echo Press any key to exit...
pause >nul

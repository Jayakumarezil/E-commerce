@echo off
echo 🚀 Setting up E-commerce Platform...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js (v18 or higher) first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
node --version

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install client dependencies
echo 📦 Installing client dependencies...
cd client
npm install
cd ..

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
npm install
cd ..

REM Create environment files
echo ⚙️  Setting up environment files...

REM Client environment
if not exist "client\.env" (
    copy "client\env.example" "client\.env"
    echo ✅ Created client\.env from template
) else (
    echo ℹ️  client\.env already exists
)

REM Server environment
if not exist "server\.env" (
    copy "server\env.example" "server\.env"
    echo ✅ Created server\.env from template
) else (
    echo ℹ️  server\.env already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Update environment variables in client\.env and server\.env
echo 2. Set up PostgreSQL database
echo 3. Run 'npm run dev' to start both client and server
echo.
echo 🔧 Available commands:
echo   npm run dev          - Start both client and server in development mode
echo   npm run build        - Build client for production
echo   npm start            - Start production server
echo   npm run install:all  - Install dependencies for both client and server
echo.
echo 📚 Documentation:
echo   - Client runs on: http://localhost:3000
echo   - Server runs on: http://localhost:5000
echo   - Health check: http://localhost:5000/health
echo.
echo ⚠️  Don't forget to:
echo   - Configure your database credentials in server\.env
echo   - Update JWT secret in server\.env
echo   - Set up email configuration if needed

pause

@echo off
REM Database Reset Script for Windows
echo 🔄 Resetting E-commerce Database...

REM Check if we're in the server directory
if not exist "package.json" (
    echo ❌ Please run this script from the server directory
    exit /b 1
)

REM Get database connection details
set DB_NAME=ecommerce_db
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo 📊 Database: %DB_NAME%
echo 👤 User: %DB_USER%
echo 🌐 Host: %DB_HOST%:%DB_PORT%

REM Drop and recreate database
echo 🗑️ Dropping existing database...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;" 2>nul

echo 🆕 Creating fresh database...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;"

if %errorlevel% equ 0 (
    echo ✅ Database created successfully!
    
    REM Run the database setup
    echo 🔧 Setting up database schema and data...
    node src/utils/setupDatabase.js
    
    if %errorlevel% equ 0 (
        echo 🎉 Database reset completed successfully!
        echo 🚀 You can now start the server with: npm run dev
    ) else (
        echo ❌ Database setup failed
        exit /b 1
    )
) else (
    echo ❌ Failed to create database
    exit /b 1
)

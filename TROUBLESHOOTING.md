# Troubleshooting Guide

## Common Issues and Solutions

### 1. Lodash Import Error
**Error**: `Failed to resolve import "lodash"`

**Solution**: 
- The lodash dependency has been removed and replaced with custom utility functions
- If you still see this error, restart your development server:
  ```bash
  # Stop the current server (Ctrl+C)
  # Then restart:
  cd client
  npm run dev
  ```

### 2. Development Server Issues

#### Quick Restart Scripts
- **Windows**: Run `start-dev.bat`
- **Linux/Mac**: Run `./start-dev.sh`

#### Manual Restart
```bash
# Stop current servers (Ctrl+C in each terminal)
# Then start each server in separate terminals:

# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### 3. Port Already in Use
**Error**: `Port 3000/5000 is already in use`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /f /pid <PID_NUMBER>

netstat -ano | findstr :5000
taskkill /f /pid <PID_NUMBER>

# Linux/Mac
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

### 4. Database Connection Issues
**Error**: `Database connection failed`

**Solution**:
1. Ensure PostgreSQL is running
2. Check database credentials in `server/.env`
3. Run database setup:
   ```bash
   cd server
   npm run db:setup
   ```

### 5. Dependency Issues
**Error**: `Module not found`

**Solution**:
```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

### 6. TypeScript Errors
**Error**: TypeScript compilation errors

**Solution**:
```bash
# Check for linting errors
cd client
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### 7. Build Issues
**Error**: Build failures

**Solution**:
```bash
# Clean build
cd client
rm -rf dist
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## Verification Steps

### 1. Check Server Status
```bash
# Backend health check
curl http://localhost:5000/health

# Should return:
# {"status":"UP","timestamp":"..."}
```

### 2. Check Frontend
- Open http://localhost:3000
- Should see the e-commerce homepage
- Check browser console for errors

### 3. Check API Endpoints
```bash
# Test product endpoints
curl http://localhost:5000/api/products
curl http://localhost:5000/api/products/categories
curl http://localhost:5000/api/products/featured
```

### 4. Check Database
```bash
# Connect to PostgreSQL
psql -U postgres -d ecommerce_db

# Check tables
\dt

# Check sample data
SELECT * FROM products LIMIT 5;
SELECT * FROM users LIMIT 5;
```

## Performance Optimization

### 1. Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache and cookies

### 2. Restart Development Servers
- Stop all servers
- Clear node_modules and reinstall
- Restart servers

### 3. Check System Resources
- Ensure sufficient RAM (8GB+ recommended)
- Close unnecessary applications
- Check disk space

## Getting Help

### 1. Check Logs
- Backend logs: Check terminal running `npm run dev` in server directory
- Frontend logs: Check browser console and terminal running `npm run dev` in client directory

### 2. Common Log Locations
- Backend: Terminal output
- Frontend: Browser console (F12)
- Database: PostgreSQL logs

### 3. Debug Mode
```bash
# Enable debug logging
cd server
DEBUG=* npm run dev

# Check specific modules
DEBUG=sequelize npm run dev
```

## Environment Setup

### Required Environment Variables
Create `server/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Client URL
CLIENT_URL=http://localhost:3000
```

### Required Services
- Node.js 18+
- PostgreSQL 13+
- npm 8+

## Quick Commands Reference

```bash
# Start everything
./start-dev.bat  # Windows
./start-dev.sh   # Linux/Mac

# Database operations
cd server
npm run db:setup    # Setup database
npm run db:migrate  # Run migrations
npm run db:seed     # Seed data
npm run db:reset    # Reset database

# Development
cd server && npm run dev    # Backend
cd client && npm run dev    # Frontend

# Production
cd server && npm run build && npm start
cd client && npm run build
```

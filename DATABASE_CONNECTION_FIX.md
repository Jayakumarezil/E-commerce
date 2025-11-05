# Database Connection Fix - PostgreSQL Authentication Error

## 🎯 Problem

```
ConnectionError [SequelizeConnectionError]: password authentication failed for user "postgres"
```

The server cannot connect to PostgreSQL because the password is incorrect or not set.

## ✅ Solution Steps

### Step 1: Verify PostgreSQL is Running

Check if PostgreSQL service is running:
```powershell
# Windows
Get-Service -Name postgresql*
```

Or check PostgreSQL is accessible:
```powershell
psql -U postgres -h localhost
```

### Step 2: Find Your PostgreSQL Password

You have a few options:

#### Option A: Use Your Actual PostgreSQL Password
If you know your PostgreSQL password, update `.env` file:
```env
DB_PASSWORD=your-actual-postgres-password
```

#### Option B: Reset PostgreSQL Password

**For Windows:**
1. Open Command Prompt as Administrator
2. Navigate to PostgreSQL bin directory:
   ```powershell
   cd "C:\Program Files\PostgreSQL\<version>\bin"
   ```
3. Reset password using pgAdmin or:
   ```powershell
   psql -U postgres
   ```
   Then run:
   ```sql
   ALTER USER postgres PASSWORD 'newpassword';
   ```

#### Option C: Create a New Database User (Recommended)

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create new user
CREATE USER ecommerce_user WITH PASSWORD 'your-secure-password';

-- Grant privileges
CREATE DATABASE ecommerce_db OWNER ecommerce_user;
GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;

-- Update .env
DB_USER=ecommerce_user
DB_PASSWORD=your-secure-password
```

### Step 3: Update `.env` File

Edit `server/.env` with correct credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=postgres
DB_PASSWORD=your-actual-postgres-password  # ← UPDATE THIS
```

### Step 4: Test Connection

Try connecting manually:
```powershell
psql -U postgres -h localhost -d ecommerce_db
```

If connection works, restart your server.

## 🔧 Quick Fix Scripts

### Check if .env has correct values:
```powershell
cd server
Get-Content .env | Select-String "DB_"
```

### Common Issues:

1. **Password contains special characters**: Wrap in quotes in .env
2. **PostgreSQL service not running**: Start it from Services
3. **Wrong port**: Default is 5432
4. **Database doesn't exist**: Create it first

## 🚀 Alternative: Use SQLite for Development

If PostgreSQL is causing issues, you can temporarily use SQLite:

Update `server/src/config/database.ts`:
```typescript
dialect: 'sqlite',
storage: './database.sqlite',
```

But this is **NOT recommended** for production. PostgreSQL is required for the full application.

## ✅ Verification

After updating `.env`, restart the server. You should see:
```
✅ Database connected successfully
```

If you still see errors, share the error message and we'll troubleshoot further!


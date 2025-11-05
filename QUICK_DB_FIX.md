# Quick Database Password Fix

## ❌ Error
```
password authentication failed for user "postgres"
```

## ✅ Quick Solution

### Update `server/.env` file:

1. Open `server/.env` in a text editor
2. Find this line:
   ```
   DB_PASSWORD=password
   ```
3. Change `password` to your actual PostgreSQL password:
   ```
   DB_PASSWORD=your-actual-postgresql-password
   ```

### If you don't know your PostgreSQL password:

**Option 1: Reset PostgreSQL Password**
```powershell
# Open PostgreSQL command line
psql -U postgres

# Then run:
ALTER USER postgres WITH PASSWORD 'newpassword123';
```

**Option 2: Use pgAdmin**
- Open pgAdmin
- Right-click on PostgreSQL server
- Properties → Change password

**Option 3: Windows Service**
- Check if PostgreSQL installed with default password
- Common defaults: `postgres`, `admin`, `root`

### After updating `.env`:

1. Save the file
2. Restart the server:
   ```powershell
   cd server
   npm run dev
   ```

The server should now connect successfully! ✅

## 🧪 Test Connection

You can test if the password is correct:
```powershell
psql -U postgres -h localhost -d ecommerce_db
```

If it asks for password and accepts it, the credentials are correct!


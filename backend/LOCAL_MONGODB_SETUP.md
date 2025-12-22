# Local MongoDB Setup with MongoDB Compass

## ✅ Configuration Complete!

Your `.env` file has been configured to use **local MongoDB** with MongoDB Compass.

## Connection Details

- **Connection String**: `mongodb://localhost:27017/medicare`
- **Host**: `localhost`
- **Port**: `27017`
- **Database**: `medicare`

---

## Step 1: Verify MongoDB is Running

### Windows:

1. **Check MongoDB Service**:
   - Press `Win + R`
   - Type `services.msc` and press Enter
   - Look for "MongoDB" service
   - Ensure it's **Running** (if not, right-click → Start)

2. **Or Start MongoDB Manually**:
   ```bash
   # If MongoDB is installed but not running as service
   "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe" --dbpath "C:\data\db"
   ```

### Test Connection:

Open a new terminal and test:
```bash
mongosh mongodb://localhost:27017/medicare
```

If it connects, you'll see the MongoDB shell prompt.

---

## Step 2: Connect MongoDB Compass

1. **Open MongoDB Compass**
2. **Connection String**: 
   ```
   mongodb://localhost:27017
   ```
   Or just click "Fill in connection fields individually":
   - **Hostname**: `localhost`
   - **Port**: `27017`
   - Click **Connect**

3. **You should see**:
   - Default databases (admin, config, local)
   - After your first API call, you'll see the **medicare** database

---

## Step 3: Start Your Backend

```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 MediCare Backend Server running on port 5000
📡 Health check: http://localhost:5000/api/health
🔗 Frontend URL: http://localhost:8080
✅ MongoDB Connected: localhost
   Database: medicare
```

---

## Step 4: Verify Data in MongoDB Compass

1. **After starting your backend**, the `medicare` database will be created automatically
2. **In MongoDB Compass**:
   - Refresh the database list
   - Click on **medicare** database
   - You'll see collections created as you use the app:
     - `users` - User accounts (patients, doctors, admins)
     - `appointments` - Appointment records
     - `medicalrecords` - Medical history

---

## Troubleshooting

### Error: "MongoDB Connection Error: ECONNREFUSED"

**Cause**: MongoDB service is not running

**Solution**:
1. Start MongoDB service (see Step 1)
2. Or install MongoDB if not installed:
   - Download: https://www.mongodb.com/try/download/community
   - Install and start the service

### Error: "MongoDB Connection Error: querySrv ENOTFOUND"

**Cause**: `.env` file still has Atlas connection string

**Solution**:
```bash
cd backend
node setup-local-mongodb.js
```

### MongoDB Compass Can't Connect

**Check**:
1. MongoDB service is running
2. Connection string: `mongodb://localhost:27017`
3. No firewall blocking port 27017
4. MongoDB is installed correctly

### Database Not Appearing in Compass

**Note**: The `medicare` database is created when you first make an API call (like registering a user). Until then, it won't appear in Compass.

**To create it manually**:
1. In MongoDB Compass, click "Create Database"
2. Database name: `medicare`
3. Collection name: `users` (or any name)
4. Click "Create Database"

---

## File Locations

### Your Configuration:
- **`.env` file**: `backend/.env`
- **Connection String**: `mongodb://localhost:27017/medicare`

### MongoDB Data Storage:
- **Default location**: `C:\data\db` (Windows)
- **Or**: Location specified during MongoDB installation

---

## Using MongoDB Compass

### View Collections:
1. Click on `medicare` database
2. See all collections (users, appointments, etc.)
3. Click on a collection to view documents

### Query Data:
- Use the filter bar to search
- Example: `{ "email": "user@example.com" }`
- Click "Find" to execute

### Add/Edit Data:
- Click "Insert Document" to add new data
- Click on a document to edit
- Changes are saved automatically

---

## Quick Commands

### Check MongoDB Status:
```bash
# Windows PowerShell
Get-Service MongoDB
```

### Start MongoDB Service:
```bash
# Windows PowerShell (as Administrator)
Start-Service MongoDB
```

### Test Connection:
```bash
mongosh mongodb://localhost:27017/medicare
```

### View Databases:
```bash
mongosh mongodb://localhost:27017
show dbs
use medicare
show collections
```

---

## Summary

✅ **Configuration**: Local MongoDB (`mongodb://localhost:27017/medicare`)  
✅ **GUI Tool**: MongoDB Compass  
✅ **Connection**: `mongodb://localhost:27017` in Compass  
✅ **Database**: `medicare` (created automatically)  
✅ **Data Storage**: Local MongoDB (not cloud)  

---

## Next Steps

1. ✅ Verify MongoDB service is running
2. ✅ Connect MongoDB Compass to `mongodb://localhost:27017`
3. ✅ Start backend: `npm run dev`
4. ✅ Check for "✅ MongoDB Connected" message
5. ✅ Register a user to create the database
6. ✅ View data in MongoDB Compass

---

## Need Help?

- **MongoDB not starting?** Check Services app, ensure MongoDB service is running
- **Can't connect?** Verify port 27017 is not blocked by firewall
- **Database not showing?** Make an API call first (register/login) to create it
- **Still having issues?** Run: `node check-env.js` to diagnose


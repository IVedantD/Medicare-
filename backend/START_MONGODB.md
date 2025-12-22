# Start MongoDB Service - Quick Guide

## ✅ Your .env File is Configured!

Your `.env` file is now set to use local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/medicare
```

## Step 1: Start MongoDB Service

### Method 1: Using Services App (Easiest)

1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find **"MongoDB"** or **"MongoDB Server"** in the list
4. Right-click → **Start** (if it's stopped)
5. Ensure Status shows **"Running"**

### Method 2: Using PowerShell (As Administrator)

```powershell
# Check if MongoDB service exists
Get-Service -Name "*mongo*"

# Start MongoDB service
Start-Service MongoDB

# Or if service name is different:
Start-Service "MongoDB Server"
```

### Method 3: Start MongoDB Manually

If MongoDB is not installed as a service:

```bash
# Navigate to MongoDB bin directory (adjust version number)
cd "C:\Program Files\MongoDB\Server\7.0\bin"

# Start MongoDB
mongod.exe --dbpath "C:\data\db"
```

**Note**: Create the data directory first if it doesn't exist:
```bash
mkdir C:\data\db
```

---

## Step 2: Verify MongoDB is Running

### Test Connection:

Open a new terminal and run:
```bash
mongosh mongodb://localhost:27017/medicare
```

**If successful**, you'll see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://localhost:27017/medicare
Using MongoDB: ...
Using Mongosh: ...
...
medicare>
```

**If it fails**, you'll see an error - MongoDB is not running.

---

## Step 3: Connect MongoDB Compass

1. **Open MongoDB Compass**
2. **Connection String**: 
   ```
   mongodb://localhost:27017
   ```
   Or use individual fields:
   - **Hostname**: `localhost`
   - **Port**: `27017`
3. Click **Connect**

**You should see**:
- Default databases (admin, config, local)
- After your first API call, the **medicare** database will appear

---

## Step 4: Start Your Backend

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

## Step 5: Verify Data Storage

1. **Make an API call** (register a user or login)
2. **In MongoDB Compass**:
   - Refresh the database list (click refresh icon)
   - Click on **medicare** database
   - You'll see collections:
     - `users` - All user accounts
     - `appointments` - Appointment records
     - `medicalrecords` - Medical history

---

## Troubleshooting

### MongoDB Service Not Found

**Solution**: MongoDB might not be installed as a service. Install MongoDB:
1. Download: https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service (recommended)

### "Connection Refused" Error

**Cause**: MongoDB service is not running

**Solution**:
1. Start MongoDB service (see Step 1)
2. Or start MongoDB manually

### Port 27017 Already in Use

**Cause**: Another application is using port 27017

**Solution**:
1. Find what's using the port:
   ```powershell
   netstat -ano | findstr :27017
   ```
2. Stop that application or change MongoDB port

### MongoDB Compass Can't Connect

**Check**:
1. MongoDB service is running
2. Connection string: `mongodb://localhost:27017`
3. No firewall blocking port 27017

---

## Quick Commands Reference

### Check MongoDB Status:
```powershell
Get-Service MongoDB
```

### Start MongoDB:
```powershell
Start-Service MongoDB
```

### Stop MongoDB:
```powershell
Stop-Service MongoDB
```

### Test Connection:
```bash
mongosh mongodb://localhost:27017/medicare
```

---

## Summary

✅ **Configuration**: Local MongoDB  
✅ **Connection**: `mongodb://localhost:27017/medicare`  
✅ **GUI Tool**: MongoDB Compass  
✅ **Data Storage**: Local MongoDB (not cloud)  

**Next**: Start MongoDB service → Start backend → View data in Compass!


# MongoDB Setup Guide - Complete Instructions

## Where Credentials Are Stored

**All credentials are stored in**: `backend/.env` file

⚠️ **Important**: The `.env` file is **gitignored** (not tracked by Git) for security. Each developer needs to create their own `.env` file.

---

## Quick Setup (Choose One Option)

### Option 1: Local MongoDB (Easiest for Development) ⭐ Recommended

#### Step 1: Install MongoDB

**Windows:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service (recommended)
5. MongoDB will start automatically

**Or use MongoDB via Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Step 2: Create `.env` File

1. Navigate to `backend` folder
2. Create a new file named `.env` (no extension, just `.env`)
3. Copy this content:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# MongoDB Configuration - Local
MONGODB_URI=mongodb://localhost:27017/medicare

# JWT Configuration
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Other Configuration
BCRYPT_ROUNDS=10
```

#### Step 3: Verify MongoDB is Running

**Windows:**
- Open Services (Win + R, type `services.msc`)
- Look for "MongoDB" service
- Ensure it's "Running"

**Or test connection:**
```bash
# If MongoDB is installed, test with:
mongosh mongodb://localhost:27017/medicare
```

#### Step 4: Restart Your Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
   Database: medicare
```

---

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)

#### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Create your account

#### Step 2: Create a Cluster

1. After logging in, click "Build a Database"
2. Choose **FREE** tier (M0 Sandbox)
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to you
5. Name your cluster (e.g., "Cluster0")
6. Click "Create Cluster" (takes 3-5 minutes)

#### Step 3: Create Database User

1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username (e.g., "medicare_user")
5. Enter a strong password (save it!)
6. Set privileges to "Read and write to any database"
7. Click "Add User"

#### Step 4: Configure Network Access

1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - ⚠️ **For production, add only specific IPs**
4. Click "Confirm"

#### Step 5: Get Connection String

1. Go to "Database" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "5.5 or later"
5. Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

#### Step 6: Create `.env` File

1. Navigate to `backend` folder
2. Create a new file named `.env`
3. Copy this content and **replace the placeholders**:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# MongoDB Configuration - Atlas
# Replace <username> with your database username
# Replace <password> with your database password
# Replace cluster0.xxxxx with your actual cluster name
# Add /medicare before the ? to specify database name
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Other Configuration
BCRYPT_ROUNDS=10
```

**Example** (replace with your actual values):
```env
MONGODB_URI=mongodb+srv://medicare_user:MyPassword123!@cluster0.abc123.mongodb.net/medicare?retryWrites=true&w=majority
```

#### Step 7: Restart Your Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   Database: medicare
```

---

## Troubleshooting

### Error: "querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net"

**Cause**: Invalid or placeholder connection string in `.env`

**Solution**:
1. Check your `.env` file in `backend/.env`
2. Ensure `MONGODB_URI` has your actual cluster name (not "cluster.mongodb.net")
3. Verify username and password are correct
4. Make sure there are no extra spaces or quotes

### Error: "Authentication failed"

**Cause**: Wrong username or password

**Solution**:
1. Verify username and password in MongoDB Atlas
2. Check `.env` file - ensure no extra spaces
3. URL-encode special characters in password (e.g., `@` becomes `%40`)

### Error: "ECONNREFUSED" or "Connection refused"

**Cause**: MongoDB server not running (for local MongoDB)

**Solution**:
1. **Windows**: Start MongoDB service
   - Open Services (Win + R → `services.msc`)
   - Find "MongoDB" service
   - Right-click → Start

2. **Or start manually**:
   ```bash
   mongod
   ```

### Error: "Network access denied" (Atlas)

**Cause**: Your IP address not whitelisted

**Solution**:
1. Go to MongoDB Atlas → Network Access
2. Add your current IP address
3. Or temporarily allow all IPs (0.0.0.0/0) for development

---

## Security Best Practices

### For Development:
- ✅ `.env` file is gitignored (safe to commit)
- ✅ Use local MongoDB or Atlas free tier
- ✅ Use strong passwords

### For Production:
- ⚠️ Never commit `.env` file
- ⚠️ Use environment variables on your hosting platform
- ⚠️ Restrict MongoDB Atlas network access to specific IPs
- ⚠️ Use strong, unique JWT_SECRET
- ⚠️ Enable MongoDB Atlas encryption at rest

---

## Verify Connection

After setup, test your connection:

```bash
# Test local MongoDB
mongosh mongodb://localhost:27017/medicare

# Test Atlas (replace with your connection string)
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medicare"
```

If connection works, you'll see MongoDB shell prompt.

---

## File Structure

```
backend/
├── .env                    ← Your credentials (NOT in Git)
├── .env.example            ← Template (safe to commit)
├── config/
│   └── database.js         ← Uses MONGODB_URI from .env
└── ...
```

---

## Quick Reference

**Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/medicare
```

**MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority
```

**Where to find:**
- Local: `backend/.env` file
- Atlas: MongoDB Atlas Dashboard → Database → Connect → Connect your application

---

## Need Help?

1. Check backend console for detailed error messages
2. Verify `.env` file exists in `backend/` folder
3. Ensure no typos in connection string
4. Test connection string directly with `mongosh`
5. Check MongoDB service is running (for local)


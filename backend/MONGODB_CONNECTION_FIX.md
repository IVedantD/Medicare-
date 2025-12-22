# MongoDB Connection Error - Fix Guide

## Error Message
```
❌ MongoDB Connection Error: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

## Root Cause
This error occurs when:
1. Your `.env` file has an invalid MongoDB Atlas connection string (likely a placeholder)
2. The MongoDB Atlas cluster doesn't exist or is incorrectly named
3. Network/DNS issues preventing connection to MongoDB Atlas

## Solution

### Step 1: Check Your .env File

Navigate to `backend/.env` and check your `MONGODB_URI` value.

**❌ Invalid (Placeholder):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicare
```

**✅ Valid Options:**

#### Option A: Use Local MongoDB (Recommended for Development)

1. **Install MongoDB locally** (if not installed):
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB via Docker

2. **Start MongoDB service**:
   ```bash
   # Windows (if installed as service, it should auto-start)
   # Or use: net start MongoDB
   ```

3. **Update your .env file**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/medicare
   ```

#### Option B: Use MongoDB Atlas (Cloud)

1. **Create/Login to MongoDB Atlas account**:
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up or log in

2. **Create a Cluster** (if you don't have one):
   - Click "Build a Database"
   - Choose free tier (M0)
   - Select a cloud provider and region
   - Click "Create"

3. **Get Your Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It should look like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

4. **Update Your .env File**:
   ```env
   MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority
   ```
   
   **Important**: 
   - Replace `yourusername` with your MongoDB Atlas username
   - Replace `yourpassword` with your MongoDB Atlas password
   - Replace `cluster0.xxxxx` with your actual cluster name
   - Add `/medicare` before the `?` to specify the database name

5. **Configure Network Access**:
   - In MongoDB Atlas, go to "Network Access"
   - Click "Add IP Address"
   - For development, you can add `0.0.0.0/0` (allows all IPs - only for development!)
   - For production, add your specific IP addresses

6. **Create Database User** (if not already created):
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (remember these for your connection string)
   - Set privileges to "Read and write to any database"

### Step 2: Create .env File (If It Doesn't Exist)

If you don't have a `.env` file in the `backend` folder:

1. Create a new file named `.env` in the `backend` folder
2. Copy this template:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# MongoDB Configuration
# Choose ONE option below:

# Option 1: Local MongoDB (Recommended for development)
MONGODB_URI=mongodb://localhost:27017/medicare

# Option 2: MongoDB Atlas (Uncomment and fill in your details)
# MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/medicare?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Other Configuration
BCRYPT_ROUNDS=10
```

3. Update `MONGODB_URI` with your actual connection string

### Step 3: Restart Your Server

After updating the `.env` file:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Verification

After fixing the connection string, you should see:

```
✅ MongoDB Connected: localhost
   Database: medicare
```

Or for Atlas:

```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   Database: medicare
```

## Common Issues

### Issue 1: "Authentication failed"
- **Solution**: Check your MongoDB username and password in the connection string

### Issue 2: "Connection refused" (Local MongoDB)
- **Solution**: Ensure MongoDB service is running
  - Windows: Check Services app, look for "MongoDB"
  - Or run: `mongod` in a separate terminal

### Issue 3: "Network access denied" (Atlas)
- **Solution**: Add your IP address in MongoDB Atlas Network Access settings

### Issue 4: "Invalid connection string format"
- **Solution**: Ensure your connection string follows the correct format:
  - Local: `mongodb://localhost:27017/medicare`
  - Atlas: `mongodb+srv://user:pass@cluster.mongodb.net/medicare`

## Quick Test

Test your MongoDB connection string directly:

```bash
# For local MongoDB
mongosh mongodb://localhost:27017/medicare

# For Atlas (replace with your connection string)
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/medicare"
```

If this works, your connection string is correct!

## Need Help?

1. Check MongoDB logs for more details
2. Verify your `.env` file is in the `backend` folder (not root)
3. Ensure `.env` file doesn't have extra spaces or quotes around values
4. Restart your terminal/IDE after creating/updating `.env` file


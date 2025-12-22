# Fix MongoDB Connection - Quick Instructions

## Current Issue
Your `.env` file exists but MongoDB connection is failing with:
```
❌ MongoDB Connection Error: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

## Quick Fix (Choose One Method)

### Method 1: Use Fix Script (Easiest) ⭐

```bash
cd backend
node fix-mongodb-connection.js
```

Follow the prompts to fix your connection automatically.

---

### Method 2: Manual Fix

#### Option A: Use Local MongoDB

1. **Install MongoDB** (if not installed):
   - Download: https://www.mongodb.com/try/download/community
   - Install and start the service

2. **Update `.env` file**:
   - Open `backend/.env`
   - Find the line: `MONGODB_URI=...`
   - Replace it with:
     ```env
     MONGODB_URI=mongodb://localhost:27017/medicare
     ```
   - Make sure there are NO commented lines with Atlas connection strings above it

3. **Restart backend**:
   ```bash
   npm run dev
   ```

#### Option B: Use MongoDB Atlas (Cloud)

1. **Get Atlas Connection String**:
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up (free tier available)
   - Create cluster → Add user → Add IP → Get connection string

2. **Update `.env` file**:
   - Open `backend/.env`
   - Find: `MONGODB_URI=...`
   - Replace with your Atlas connection string:
     ```env
     MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/medicare?retryWrites=true&w=majority
     ```
   - Replace `username`, `password`, and `cluster0.xxxxx` with your actual values
   - Make sure `/medicare` is before the `?`

3. **Restart backend**:
   ```bash
   npm run dev
   ```

---

## Verify It Works

After fixing and restarting, you should see:

```
✅ MongoDB Connected: localhost
   Database: medicare
```

OR

```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   Database: medicare
```

---

## Common Mistakes

❌ **Wrong**: Connection string has placeholders
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicare
```

✅ **Correct**: Connection string has actual values
```env
MONGODB_URI=mongodb+srv://myuser:mypass@cluster0.abc123.mongodb.net/medicare?retryWrites=true&w=majority
```

❌ **Wrong**: Multiple MONGODB_URI lines (one commented, one active)
```env
# MONGODB_URI=mongodb://localhost:27017/medicare
MONGODB_URI=mongodb+srv://...  # This one is active
```

✅ **Correct**: Only one active MONGODB_URI line
```env
MONGODB_URI=mongodb://localhost:27017/medicare
```

---

## Check Your Current Setup

Run this to see what's in your `.env` file:

```bash
cd backend
node check-env.js
```

This will show you:
- ✅ What connection string you're using
- ⚠️ Any issues detected
- 💡 How to fix them

---

## Still Not Working?

1. **Check MongoDB is running** (for local):
   - Windows: Services → MongoDB should be "Running"
   - Or test: `mongosh mongodb://localhost:27017/medicare`

2. **Check Atlas credentials** (for Atlas):
   - Verify username and password
   - Check IP is whitelisted (0.0.0.0/0 for development)
   - Verify cluster name is correct

3. **Check .env file location**:
   - Must be in: `backend/.env`
   - Not in root folder

4. **Restart backend server** after any changes

---

## File Location

Your `.env` file should be here:
```
D:\MediCare Project\Medicare\backend\.env
```

---

## Need More Help?

See detailed guides:
- `MONGODB_SETUP_GUIDE.md` - Complete setup instructions
- `QUICK_MONGODB_SETUP.md` - Quick reference
- `CREATE_ENV_FILE.md` - How to create .env file


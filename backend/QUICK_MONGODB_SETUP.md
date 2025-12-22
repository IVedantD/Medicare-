# Quick MongoDB Setup - 5 Minutes

## Where Credentials Are Stored

**Location**: `backend/.env` file (this file is NOT in Git for security)

---

## 🚀 Quick Setup (Choose One)

### Option A: Use Setup Script (Easiest)

```bash
cd backend
node setup-env.js
```

Follow the prompts to create your `.env` file automatically.

---

### Option B: Manual Setup

#### Step 1: Create `.env` File

1. Go to `backend` folder
2. Create a new file named `.env` (no extension)
3. Copy one of the templates below:

#### For Local MongoDB (if you have MongoDB installed):

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/medicare
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

#### For MongoDB Atlas (Cloud - Free):

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user (username + password)
4. Add IP address (0.0.0.0/0 for development)
5. Get connection string from "Connect" → "Connect your application"
6. Replace placeholders in this template:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/medicare?retryWrites=true&w=majority
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

**Example Atlas connection string:**
```
MONGODB_URI=mongodb+srv://medicare_user:MyPass123!@cluster0.abc123.mongodb.net/medicare?retryWrites=true&w=majority
```

#### Step 2: Save the File

Save as `backend/.env` (make sure it's exactly `.env` with no extension)

#### Step 3: Restart Backend

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

## ✅ Verify It Works

After restarting, check your terminal. You should see:
- ✅ `MongoDB Connected: ...` (success!)
- ❌ `MongoDB Connection Error: ...` (check the error message)

---

## 🔍 Common Issues

### "querySrv ENOTFOUND" Error
- Your `.env` file has a placeholder connection string
- Replace it with your actual MongoDB connection string

### "Authentication failed"
- Wrong username or password in connection string
- Check MongoDB Atlas database user credentials

### "Connection refused"
- MongoDB service not running (for local)
- Start MongoDB service or use Atlas instead

---

## 📍 File Location

```
Medicare/
└── backend/
    ├── .env              ← YOUR CREDENTIALS HERE (not in Git)
    ├── .env.example      ← Template (safe to commit)
    └── config/
        └── database.js   ← Reads from .env
```

---

## 🎯 Next Steps

1. ✅ Create `.env` file in `backend/` folder
2. ✅ Add your MongoDB connection string
3. ✅ Restart backend server
4. ✅ Look for "✅ MongoDB Connected" message

For detailed instructions, see: `MONGODB_SETUP_GUIDE.md`


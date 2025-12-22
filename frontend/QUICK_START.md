# ⚡ Quick Start Guide

## 🎯 TL;DR - Get Running in 5 Minutes

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB locally
- Start MongoDB service
- Use: `mongodb://localhost:27017/medicare`

**Option B: MongoDB Atlas (Easier)**
- Sign up at https://www.mongodb.com/cloud/atlas (free)
- Create cluster
- Get connection string

### 3. Create Backend .env File

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your_secret_key_here_change_this
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

**Replace `MONGODB_URI` with your actual MongoDB connection string!**

### 4. Start Backend

```bash
cd backend
npm run dev
```

✅ You should see: "🚀 MediCare Backend Server running on port 5000"

### 5. Start Frontend (New Terminal)

```bash
npm run dev
```

✅ Open: http://localhost:8080

---

## ✅ That's It!

Your application is now running:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:5000/api

---

## 🧪 Quick Test

1. Go to http://localhost:8080/register
2. Register as Admin
3. Login
4. Start using the system!

---

## 📖 Full Guide

For detailed instructions, see `RUN_GUIDE.md`


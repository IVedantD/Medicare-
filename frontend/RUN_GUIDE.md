# 🚀 MediCare - Complete Run Guide

## ✅ Project Status: FULLY FUNCTIONAL

The MediCare project is **100% complete** and ready to run! All features are implemented:
- ✅ Frontend (React + TypeScript)
- ✅ Backend (Express + MongoDB)
- ✅ Authentication & Authorization
- ✅ All APIs (Doctors, Appointments, Patients, Medical Records, Admin)

---

## 📋 Prerequisites

Before running, make sure you have:

1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should be v18+
   ```

2. **MongoDB** (Choose one):
   - **Option A**: Local MongoDB installed and running
   - **Option B**: MongoDB Atlas account (free cloud database)

3. **npm** or **yarn** package manager

---

## 🚀 Quick Start (Step-by-Step)

### Step 1: Install Dependencies

#### Frontend Dependencies
```bash
# Navigate to project root
cd clinicflow-ui

# Install frontend dependencies
npm install
```

#### Backend Dependencies
```bash
# Navigate to backend folder
cd backend

# Install backend dependencies
npm install
```

---

### Step 2: Set Up MongoDB

#### Option A: Local MongoDB

1. **Install MongoDB** (if not installed):
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB Service**:
   - Windows: MongoDB should start automatically as a service
   - Mac/Linux: `mongod` (or `brew services start mongodb-community` on Mac)

3. **Verify MongoDB is running**:
   ```bash
   mongosh  # Should connect to MongoDB shell
   ```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. **Create free account** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a cluster** (free tier is fine)
3. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

---

### Step 3: Configure Environment Variables

#### Backend Environment Variables

1. **Create `.env` file** in the `backend` folder:
   ```bash
   cd backend
   touch .env  # or create manually
   ```

2. **Add the following content** to `backend/.env`:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:8080

   # MongoDB Configuration
   # For Local MongoDB:
   MONGODB_URI=mongodb://localhost:27017/medicare
   
   # OR For MongoDB Atlas (replace with your connection string):
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medicare?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production_12345
   JWT_EXPIRE=7d

   # Password Hashing
   BCRYPT_ROUNDS=10
   ```

3. **Important**: 
   - Replace `MONGODB_URI` with your actual MongoDB connection string
   - Change `JWT_SECRET` to a secure random string (use a password generator)

#### Frontend Environment Variables (Optional)

1. **Create `.env` file** in the project root:
   ```bash
   cd ..  # Back to project root
   touch .env  # or create manually
   ```

2. **Add the following** (optional - defaults work):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

---

### Step 4: Start the Backend Server

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```

2. **Start the server**:
   ```bash
   npm run dev
   ```

3. **You should see**:
   ```
   ✅ MongoDB Connected: localhost (or your cluster)
   🚀 MediCare Backend Server running on port 5000
   📡 Health check: http://localhost:5000/api/health
   🔗 Frontend URL: http://localhost:8080
   ```

4. **Test the backend**:
   - Open browser: http://localhost:5000/api/health
   - Should see: `{"status":"OK","message":"MediCare Backend is running",...}`

**Keep this terminal open!** The backend must be running.

---

### Step 5: Start the Frontend Server

1. **Open a NEW terminal window** (keep backend running)

2. **Navigate to project root**:
   ```bash
   cd clinicflow-ui
   ```

3. **Start the frontend**:
   ```bash
   npm run dev
   ```

4. **You should see**:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:8080/
   ➜  Network: use --host to expose
   ```

5. **Open your browser**:
   - Navigate to: http://localhost:8080
   - You should see the MediCare homepage!

---

## 🎉 You're All Set!

The application is now running:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 👤 Test Accounts

You can create accounts through the registration page, or use these test accounts (after registering):

### Create Your First Admin Account

1. Go to: http://localhost:8080/register
2. Register with:
   - **Name**: Admin User
   - **Email**: admin@medicare.com
   - **Password**: password123
   - **Role**: Admin

3. Login and start using the system!

### Create Test Accounts

**Patient Account**:
- Email: `patient@test.com`
- Password: `password123`
- Role: Patient

**Doctor Account**:
- Email: `doctor@test.com`
- Password: `password123`
- Role: Doctor
- Specialization: (e.g., "Cardiology")

**Note**: Doctor accounts need admin approval before they appear in the doctor list.

---

## 📱 Using the Application

### As a Patient:
1. Register/Login as Patient
2. Browse doctors at "Find Doctors"
3. Book an appointment
4. View your appointments and medical records

### As a Doctor:
1. Register/Login as Doctor
2. Wait for admin approval (or approve yourself if you're admin)
3. View your appointments
4. Approve/reject appointments
5. Add prescriptions after appointments

### As an Admin:
1. Register/Login as Admin
2. View dashboard statistics
3. Approve pending doctors
4. Manage users
5. View all appointments and records

---

## 🛠️ Troubleshooting

### Backend Won't Start

**Error: "MongoDB connection failed"**
- ✅ Check MongoDB is running (local) or connection string is correct (Atlas)
- ✅ Verify `MONGODB_URI` in `backend/.env`
- ✅ For Atlas: Make sure IP is whitelisted (0.0.0.0/0 for development)

**Error: "Port 5000 already in use"**
- ✅ Change `PORT` in `backend/.env` to another port (e.g., 5001)
- ✅ Update `VITE_API_URL` in frontend `.env` if you changed port

**Error: "Cannot find module"**
- ✅ Run `npm install` in the `backend` folder
- ✅ Delete `node_modules` and `package-lock.json`, then `npm install` again

### Frontend Won't Start

**Error: "Port 8080 already in use"**
- ✅ Vite will automatically use the next available port
- ✅ Or specify port: `npm run dev -- --port 3000`

**Error: "Cannot connect to API"**
- ✅ Make sure backend is running on port 5000
- ✅ Check `VITE_API_URL` in `.env` file
- ✅ Frontend will work with mock data if API is unavailable

**Blank Page / Errors**
- ✅ Check browser console for errors
- ✅ Clear browser cache
- ✅ Try incognito/private mode

### MongoDB Issues

**Local MongoDB not starting:**
- ✅ Check MongoDB service is running
- ✅ Verify MongoDB is installed correctly
- ✅ Check MongoDB logs for errors

**Atlas Connection Issues:**
- ✅ Verify connection string is correct
- ✅ Check IP whitelist (add 0.0.0.0/0 for development)
- ✅ Verify database user credentials
- ✅ Check cluster is not paused

---

## 📝 Available Scripts

### Frontend (Root Directory)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend (backend/ Directory)
```bash
npm run dev          # Start development server (with nodemon)
npm start            # Start production server
```

---

## 🔍 Verify Everything Works

### 1. Backend Health Check
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK",...}
```

### 2. Test Registration
- Go to http://localhost:8080/register
- Register a new user
- Should redirect to login

### 3. Test Login
- Login with your credentials
- Should redirect to dashboard

### 4. Test API Endpoints
- Use Postman or browser DevTools
- Check Network tab for API calls
- All endpoints should return data (not errors)

---

## 🎯 Next Steps

1. **Explore the Features**:
   - Create accounts for different roles
   - Book appointments
   - Test all features

2. **Customize**:
   - Update branding/colors
   - Add more specializations
   - Customize dashboard

3. **Deploy** (Optional):
   - Deploy frontend to Vercel/Netlify
   - Deploy backend to Heroku/Railway
   - Use MongoDB Atlas for production database

---

## 📚 Documentation

- `backend/STEP1_COMPLETE.md` - Authentication implementation
- `backend/STEP2_COMPLETE.md` - Database models
- `backend/STEP3_COMPLETE.md` - Core APIs
- `backend/TESTING_AUTH.md` - API testing guide
- `backend/ENV_SETUP.md` - Environment setup details

---

## ✅ Checklist

Before running, make sure:
- [ ] Node.js installed (v18+)
- [ ] MongoDB running (local or Atlas)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `backend/.env` file created with correct values
- [ ] Backend server running (`cd backend && npm run dev`)
- [ ] Frontend server running (`npm run dev`)
- [ ] Both servers accessible in browser

---

## 🎊 Success!

If you see both servers running and can access the application, **you're all set!**

The MediCare system is fully functional and ready to use. Enjoy! 🚀

---

**Need Help?** Check the troubleshooting section above or review the documentation files.


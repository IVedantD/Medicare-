# 🏥 MediCare - Healthcare Management System

A complete, production-ready healthcare management system built with **MERN Stack** (MongoDB, Express, React, Node.js).

## ✅ Project Status: FULLY FUNCTIONAL

All features are implemented and ready to use:
- ✅ **Frontend**: React 18 + TypeScript + Vite
- ✅ **Backend**: Express.js + MongoDB + JWT Authentication
- ✅ **Authentication**: JWT-based with role-based access control
- ✅ **APIs**: Doctors, Appointments, Patients, Medical Records, Admin
- ✅ **Database**: MongoDB with Mongoose ODM

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)

### Installation & Run

1. **Install dependencies**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   ```

2. **Set up MongoDB**:
   - Local: Install and start MongoDB
   - Cloud: Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

3. **Configure environment**:
   - Create `backend/.env` file (see `backend/ENV_SETUP.md`)
   - Add MongoDB connection string
   - Set JWT secret

4. **Start servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run dev
   ```

5. **Open browser**: http://localhost:8080

**📖 For detailed instructions, see [RUN_GUIDE.md](./RUN_GUIDE.md)**

---

## 📋 Features

### Patient Features
- 🔐 Secure authentication
- 👨‍⚕️ Browse and search doctors
- 📅 Book appointments
- 📋 View appointment history
- 🏥 Access medical records
- 👤 Update profile

### Doctor Features
- 🔐 Secure authentication
- 📅 View and manage appointments
- ✅ Approve/reject appointments
- 💊 Add prescriptions
- 👥 Manage patient list
- 📊 View patient medical history

### Admin Features
- 🔐 Secure authentication
- 📊 Dashboard with statistics
- 👥 User management
- ✅ Doctor approval system
- 📈 System-wide analytics
- 🔧 Manage all users and appointments

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Server state
- **Tailwind CSS** - Styling
- **shadcn/ui** - Components

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

---

## 📁 Project Structure

```
clinicflow-ui/
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   └── context/            # React Context
├── backend/               # Backend source
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Middleware
│   └── utils/             # Utilities
└── README.md              # This file
```

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control (RBAC)
- ✅ Protected API routes
- ✅ Input validation
- ✅ CORS configuration
- ✅ Secure environment variables

---

## 📚 Documentation

- **[RUN_GUIDE.md](./RUN_GUIDE.md)** - Complete setup and run instructions
- **[QUICK_START.md](./QUICK_START.md)** - Quick 5-minute setup
- **[backend/ENV_SETUP.md](./backend/ENV_SETUP.md)** - Environment variables guide
- **[backend/TESTING_AUTH.md](./backend/TESTING_AUTH.md)** - API testing guide
- **[backend/STEP1_COMPLETE.md](./backend/STEP1_COMPLETE.md)** - Authentication docs
- **[backend/STEP2_COMPLETE.md](./backend/STEP2_COMPLETE.md)** - Database models docs
- **[backend/STEP3_COMPLETE.md](./backend/STEP3_COMPLETE.md)** - APIs docs

---

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:5000/api/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123","role":"patient"}'
```

### Test Frontend
- Open http://localhost:8080
- Register a new account
- Login and explore features

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set environment variable: `VITE_API_URL`

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy backend folder
3. Update frontend API URL

### Database
- Use MongoDB Atlas for production
- Update `MONGODB_URI` in production `.env`

---

## 📝 Available Scripts

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview   # Preview production build
```

### Backend
```bash
cd backend
npm run dev      # Start dev server (nodemon)
npm start        # Start production server
```

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check MongoDB is running
- Verify `.env` file exists in `backend/`
- Check MongoDB connection string

**Frontend won't connect?**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Frontend works with mock data if API unavailable

**MongoDB connection issues?**
- Verify MongoDB is running (local)
- Check connection string (Atlas)
- Whitelist IP address (Atlas)

See [RUN_GUIDE.md](./RUN_GUIDE.md) for detailed troubleshooting.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

---

## 📄 License

MIT License

---

## 🎉 Success!

If you've followed the setup and both servers are running, **you're all set!**

The MediCare system is fully functional and ready to use.

**Need help?** Check the documentation files or troubleshooting section.

---

**Built with ❤️ using MERN Stack**

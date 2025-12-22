# MediCare Backend - Express + MongoDB

MERN Stack backend for MediCare Healthcare Management System.

## 🚀 Quick Start

1. **Install dependencies** (already installed):
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env` file (already created)
   - Update `MONGODB_URI` with your MongoDB connection string
   - Update `JWT_SECRET` with a secure random string

3. **Start the server**:
   ```bash
   npm run dev
   ```

4. **Test the server**:
   Visit: http://localhost:5000/api/health

## 📁 Project Structure

```
backend/
├── server.js              # Main server file
├── .env                   # Environment variables
├── .gitignore
├── package.json
├── config/                # Configuration files
│   └── database.js        # MongoDB connection (to be created)
├── models/                # Mongoose models (to be created)
│   ├── User.js
│   ├── Doctor.js
│   ├── Appointment.js
│   └── MedicalRecord.js
├── routes/                # API routes (to be created)
│   ├── auth.js
│   ├── doctors.js
│   ├── appointments.js
│   ├── patients.js
│   ├── medicalRecords.js
│   └── admin.js
├── controllers/           # Route controllers (to be created)
│   ├── authController.js
│   ├── doctorController.js
│   └── ...
└── middleware/            # Custom middleware (to be created)
    ├── auth.js            # JWT authentication
    └── errorHandler.js
```

## 🔄 Integration Steps

Follow `../BACKEND_INTEGRATION.md` for step-by-step API implementation:

1. **Step 1**: Authentication API
2. **Step 2**: Doctors API
3. **Step 3**: Appointments API
4. **Step 4**: Patients API
5. **Step 5**: Medical Records API
6. **Step 6**: Admin API

## 📝 API Endpoints (To be implemented)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:id/availability` - Get doctor availability
- `PUT /api/doctors/availability` - Update availability

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/my` - Get my appointments
- `GET /api/appointments/doctor` - Get doctor appointments
- `PUT /api/appointments/:id/status` - Update status
- `PUT /api/appointments/:id/cancel` - Cancel appointment

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/:id/history` - Get medical history

### Medical Records
- `GET /api/medical-records/my` - Get my records
- `GET /api/medical-records/patient/:id` - Get patient records
- `POST /api/medical-records` - Create record

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user

## 🔒 Security

- JWT authentication
- Password hashing with bcrypt
- CORS configured
- Environment variables for secrets

## 📚 Documentation

- See `../BACKEND_INTEGRATION.md` for detailed implementation guide
- See `../backend-setup-guide.md` for setup instructions


# MERN Stack Backend Integration Guide

This guide will help you integrate the MediCare frontend with a MERN (MongoDB, Express, React, Node.js) backend.

## Project Structure

```
medicare-project/
├── frontend/          (Current React app)
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           (Express + MongoDB)
│   ├── server.js
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── config/
│   └── package.json
└── README.md
```

## Step-by-Step Backend Integration

### Step 1: Authentication API Integration

**Backend Endpoints Required:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

**Frontend Status:** ✅ Ready
- File: `src/services/api.ts` - `authAPI` object
- File: `src/context/AuthContext.tsx` - Already configured to use API

**Backend Response Format Expected:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "patient|doctor|admin",
    "phone": "+1234567890",
    "specialization": "Cardiology" // for doctors
  }
}
```

### Step 2: Doctors API Integration

**Backend Endpoints Required:**
- `GET /api/doctors` - Get all doctors (with filters)
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:id/availability?date=YYYY-MM-DD` - Get doctor availability
- `PUT /api/doctors/availability` - Update doctor availability

**Frontend Status:** ✅ Ready
- File: `src/hooks/useDoctors.ts` - All hooks configured
- File: `src/pages/patient/FindDoctorsPage.tsx` - Uses `useDoctors` hook

**Backend Response Format Expected:**
```json
// GET /api/doctors
[
  {
    "id": "doctor_id",
    "name": "Dr. John Doe",
    "email": "doctor@example.com",
    "specialization": "Cardiology",
    "department": "Heart Center",
    "rating": 4.9,
    "experience": "15 years",
    "available": true,
    "verified": true
  }
]
```

### Step 3: Appointments API Integration

**Backend Endpoints Required:**
- `POST /api/appointments` - Create appointment
- `GET /api/appointments/my` - Get patient's appointments
- `GET /api/appointments/doctor` - Get doctor's appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id/status` - Update appointment status
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/prescription` - Add prescription

**Frontend Status:** ✅ Ready
- File: `src/hooks/useAppointments.ts` - All hooks configured
- Files using appointments: All dashboard and appointment pages

**Backend Response Format Expected:**
```json
// GET /api/appointments/my
[
  {
    "id": "appointment_id",
    "patientId": "patient_id",
    "patientName": "Patient Name",
    "doctorId": "doctor_id",
    "doctorName": "Dr. John Doe",
    "date": "2024-12-20",
    "time": "10:00 AM",
    "reason": "Regular checkup",
    "status": "pending|approved|rejected|completed|cancelled",
    "createdAt": "2024-12-15T10:00:00Z"
  }
]
```

### Step 4: Patients API Integration

**Backend Endpoints Required:**
- `GET /api/patients` - Get all patients (for doctors/admin)
- `GET /api/patients/:id` - Get patient by ID
- `GET /api/patients/:id/history` - Get patient medical history

**Frontend Status:** ✅ Ready
- File: `src/hooks/usePatients.ts` - All hooks configured
- File: `src/pages/doctor/DoctorPatientsPage.tsx` - Uses `usePatients` hook

### Step 5: Medical Records API Integration

**Backend Endpoints Required:**
- `GET /api/medical-records/my` - Get patient's medical records
- `GET /api/medical-records/patient/:patientId` - Get patient records (for doctors)
- `POST /api/medical-records` - Create medical record

**Frontend Status:** ✅ Ready
- File: `src/hooks/useMedicalRecords.ts` - All hooks configured
- File: `src/pages/patient/MedicalRecordsPage.tsx` - Uses `useMyMedicalRecords` hook

### Step 6: Admin API Integration

**Backend Endpoints Required:**
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user

**Frontend Status:** ✅ Ready
- File: `src/hooks/useAdmin.ts` - All hooks configured
- File: `src/pages/admin/AdminDashboard.tsx` - Uses admin hooks

## Backend Setup Instructions

### 1. Create Backend Directory

```bash
# In your project root
mkdir backend
cd backend
npm init -y
```

### 2. Install Backend Dependencies

```bash
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

### 3. Backend File Structure

```
backend/
├── server.js              # Main server file
├── config/
│   └── database.js        # MongoDB connection
├── models/
│   ├── User.js            # User model
│   ├── Doctor.js          # Doctor model
│   ├── Appointment.js    # Appointment model
│   └── MedicalRecord.js   # Medical record model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── doctors.js         # Doctor routes
│   ├── appointments.js    # Appointment routes
│   ├── patients.js        # Patient routes
│   ├── medicalRecords.js # Medical records routes
│   └── admin.js           # Admin routes
├── controllers/
│   ├── authController.js
│   ├── doctorController.js
│   ├── appointmentController.js
│   └── ...
├── middleware/
│   ├── auth.js            # JWT authentication middleware
│   └── errorHandler.js    # Error handling middleware
└── .env                   # Environment variables
```

### 4. Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/medicare
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/medicare

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:8080
```

### 5. Basic Server Setup (server.js)

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/medical-records', require('./routes/medicalRecords'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Integration Testing Order

1. **Start with Authentication** (Step 1)
   - Test login/register endpoints
   - Verify JWT token generation
   - Test protected routes

2. **Add Doctors API** (Step 2)
   - Test doctor listing
   - Test doctor details
   - Test availability

3. **Add Appointments API** (Step 3)
   - Test appointment creation
   - Test appointment listing
   - Test status updates

4. **Add Patients API** (Step 4)
   - Test patient listing (for doctors)
   - Test patient details

5. **Add Medical Records API** (Step 5)
   - Test record creation
   - Test record retrieval

6. **Add Admin API** (Step 6)
   - Test admin dashboard stats
   - Test user management

## Frontend Configuration

The frontend is already configured to work with the backend:

1. **API Base URL**: Set in `.env` file as `VITE_API_URL`
2. **Axios Interceptors**: Already set up for JWT tokens
3. **Error Handling**: Already implemented in all hooks
4. **Loading States**: Already implemented
5. **Type Safety**: TypeScript types defined in `src/types/index.ts`

## Testing the Integration

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Test authentication first
4. Gradually test each feature

## Notes

- All API endpoints expect JSON responses
- JWT tokens should be sent in `Authorization: Bearer <token>` header
- Error responses should follow: `{ message: "Error message" }`
- Success responses should include the data directly or in a `data` field

## Next Steps

1. Create the backend folder structure
2. Set up MongoDB connection
3. Create User model and authentication
4. Test authentication endpoints
5. Continue with other APIs one by one


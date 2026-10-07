# 🏥 MediCare - Healthcare Management System

A full-stack, enterprise-grade **Healthcare Management System** built with the **MERN Stack** (MongoDB, Express.js, React, Node.js) and **TypeScript**. 

MediCare provides a unified platform for **Patients**, **Doctors**, and **Administrators** to manage appointments, medical records, doctor schedules, and hospital operations efficiently.

---

## 🌟 Key Features

### 👨‍⚕️ Patient Portal
* **Doctor Discovery**: Search and filter doctors by medical specialty, rating, and availability.
* **Appointment Booking**: Select available time slots and book consultations with instant confirmation.
* **Medical Records**: Access past prescriptions, diagnostic reports, and medical history.
* **Appointment History**: Track upcoming, completed, and canceled appointments.
* **Personal Profile**: Update personal details, contact info, and medical preferences.

### 🩺 Doctor Portal
* **Schedule & Availability Management**: Set working hours, day-wise availability, and consultation slots.
* **Appointment Handling**: Review incoming patient bookings with options to approve, reschedule, or cancel.
* **Patient Records**: Access patient medical histories prior to consultation and log new prescriptions.
* **Consultation Dashboard**: Summary of daily appointments and patient statistics.

### 🛡️ Admin Portal
* **Analytics Dashboard**: Overview of key hospital statistics (total patients, doctors, appointments, revenue metrics).
* **Doctor Verification**: Review and approve doctor credentials and license registration.
* **User Management**: Manage system users (Patients, Doctors, Admins) with role-based permissions.
* **Activity & Audit Logs**: Monitor system activities, appointment changes, and security events.

---

## 🛠️ Tech Stack

### **Frontend**
* **Framework**: React 18 with TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS & shadcn/ui components
* **Routing**: React Router v6
* **State Management**: React Query / Context API
* **Icons**: Lucide React

### **Backend**
* **Runtime**: Node.js
* **Framework**: Express.js
* **Database**: MongoDB with Mongoose ODM
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs password hashing
* **Middleware**: CORS, Custom Error Handlers, Role-Based Auth Guards

---

## 📁 Project Structure

```
Medicare/
├── backend/                  # Express.js REST API Server
│   ├── config/               # Database and server configurations
│   ├── controllers/          # Business logic & request handlers
│   ├── middleware/           # Auth guards & error handling middleware
│   ├── models/               # Mongoose schema definitions (User, Doctor, Appointment, Record)
│   ├── routes/               # API route definitions
│   ├── utils/                # Helper utilities & seeders
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Backend dependencies
│   └── server.js             # API entry point
│
├── frontend/                 # React + TypeScript Client App
│   ├── src/
│   │   ├── components/       # Reusable UI components & layouts
│   │   ├── context/          # Global application state (AuthContext)
│   │   ├── pages/            # Page components (Patient, Doctor, Admin views)
│   │   ├── services/         # API integration services (Axios/Fetch)
│   │   ├── types/            # TypeScript interfaces & types
│   │   └── App.tsx           # Main application routing
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
│
├── .gitignore                # Global git ignore configuration
└── README.md                 # Master project documentation
```

---

## 🚀 Getting Started

### **Prerequisites**
* **Node.js**: `v18.x` or higher
* **npm**: `v9.x` or higher
* **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection string

---

### **1. Setup Backend**

```bash
cd backend

# Install dependencies
npm install

# Create environment file from template
cp .env.example .env
```

Configure your `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/medicare
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
```

Start the backend server:

```bash
# Development mode with auto-reload
npm run dev
```

The backend server will start at `http://localhost:5000`. Test health status at `http://localhost:5000/api/health`.

---

### **2. Setup Frontend**

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:8080`.

---

## 🔑 Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode (`development`/`production`) | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:8080` |
| `MONGODB_URI` | MongoDB database connection URI | `mongodb://localhost:27017/medicare` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `your_secret_key` |
| `JWT_EXPIRE` | Token validity duration | `7d` |

> ⚠️ **Security Note**: Never commit actual `.env` files or credentials to git repositories. Always use `.env.example` as a template for environment configuration.

---

## 📡 Key REST API Endpoints

### 🔐 **Authentication & Users** (`/api/auth`)
* `POST /api/auth/register` — Register a new user (Patient/Doctor/Admin)
* `POST /api/auth/login` — User authentication & JWT issuance
* `GET /api/auth/profile` — Get authenticated user details

### 🩺 **Doctors** (`/api/doctors`)
* `GET /api/doctors` — List all verified doctors (with filter options)
* `GET /api/doctors/:id` — Get detailed doctor profile
* `PUT /api/doctors/availability` — Doctor updates schedule slots

### 📅 **Appointments** (`/api/appointments`)
* `POST /api/appointments` — Book a new appointment
* `GET /api/appointments/my` — Get appointments for logged-in user
* `PUT /api/appointments/:id/status` — Update appointment status (Confirmed, Completed, Canceled)

### 📋 **Medical Records & Patients** (`/api/patients`, `/api/medical-records`)
* `GET /api/patients/:id/history` — Get patient medical history
* `POST /api/medical-records` — Add diagnostic report / prescription

### 🛡️ **Admin System** (`/api/admin`)
* `GET /api/admin/stats` — System analytics & dashboard statistics
* `PUT /api/admin/doctors/:id/verify` — Approve or reject doctor registration

---

## 🔒 Security & Best Practices

* **JWT Authentication**: Secured stateless token-based authorization.
* **Password Encryption**: Hashed using `bcryptjs` before storage.
* **Git Ignore Enforcement**: `.env` and sensitive configurations are strictly excluded from version control via `.gitignore`.
* **Role Guards**: Backend routes are restricted using role-based middleware (`patient`, `doctor`, `admin`).
* **Input Validation**: Server-side request data validation and error handling.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

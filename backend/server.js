const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route (must be before other routes)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'MediCare Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Database connection
connectDB().then((conn) => {
  if (conn) {
    console.log('✅ Database connection established');
  } else {
    console.warn('⚠️  Database connection failed - server will continue but API calls may fail');
    console.warn('   Please ensure MongoDB is running and restart the server');
  }
}).catch((error) => {
  console.error('❌ Database connection error:', error.message);
});

// ============================================
// API ROUTES
// ============================================

// Step 1: Authentication routes
app.use('/api/auth', require('./routes/auth'));

// Step 2: Doctors routes
app.use('/api/doctors', require('./routes/doctors'));

// Step 3: Appointments routes
app.use('/api/appointments', require('./routes/appointments'));

// Step 4: Patients routes
app.use('/api/patients', require('./routes/patients'));

// Step 5: Medical Records routes
app.use('/api/medical-records', require('./routes/medicalRecords'));

// Step 6: Admin routes
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware (must be after all routes)
const { errorHandler } = require('./middleware/errorHandler');
app.use(errorHandler);

// 404 handler - must be last route
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MediCare Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
});


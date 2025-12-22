const mongoose = require('mongoose');

/**
 * Database Connection Configuration
 * Handles MongoDB connection with proper error handling
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare', {
      // Remove deprecated options for Mongoose 9.x
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit process - allow server to continue
    return null;
  }
};

module.exports = connectDB;


const mongoose = require('mongoose');

/**
 * Database Connection Configuration
 * Handles MongoDB connection with proper error handling
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare';
    
    // Validate connection string format
    if (mongoURI.includes('cluster.mongodb.net') && !mongoURI.includes('@')) {
      console.error('❌ MongoDB Connection Error: Invalid Atlas connection string');
      console.error('   Your MONGODB_URI appears to be a placeholder.');
      console.error('   Please update your .env file with a valid connection string.');
      console.error('   For local MongoDB, use: mongodb://localhost:27017/medicare');
      console.error('   For Atlas, use: mongodb+srv://username:password@your-cluster.mongodb.net/medicare');
      return null;
    }

    const conn = await mongoose.connect(mongoURI, {
      // Remove deprecated options for Mongoose 9.x
    });

    const host = conn.connection.host;
    const dbName = conn.connection.name;
    console.log(`✅ MongoDB Connected: ${host}`);
    console.log(`   Database: ${dbName}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('\n💡 Troubleshooting Tips:');
      console.error('   1. Check your MONGODB_URI in the .env file');
      console.error('   2. For MongoDB Atlas: Ensure the cluster name is correct');
      console.error('   3. For local MongoDB: Ensure MongoDB is running on your machine');
      console.error('   4. Verify network connectivity and firewall settings');
      console.error('\n   Example local connection: mongodb://localhost:27017/medicare');
      console.error('   Example Atlas connection: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/medicare');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n💡 Authentication Error:');
      console.error('   Check your MongoDB username and password in the connection string');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Connection Refused:');
      console.error('   MongoDB server is not running or not accessible');
      console.error('   For local MongoDB, start it with: mongod');
    }
    
    // Don't exit process - allow server to continue (for development)
    // In production, you might want to exit the process
    if (process.env.NODE_ENV === 'production') {
      console.error('   Exiting in production mode due to database connection failure');
      process.exit(1);
    }
    
    return null;
  }
};

module.exports = connectDB;


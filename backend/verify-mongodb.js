/**
 * Verify MongoDB Connection
 * Quick script to check if MongoDB is accessible
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function verifyConnection() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare';
    console.log('\n🔍 Verifying MongoDB Connection\n');
    console.log(`Connection String: ${mongoURI.replace(/:([^:@]+)@/, ':****@')}\n`);
    
    console.log('Attempting to connect...');
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    
    console.log('✅ SUCCESS! MongoDB is connected');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
    console.log(`   Ready State: ${conn.connection.readyState} (1 = connected)`);
    
    // Test a simple query
    console.log('\n🧪 Testing database operations...');
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`   Users in database: ${userCount}`);
    
    if (userCount > 0) {
      const sampleUser = await User.findOne().select('email name role');
      console.log(`   Sample user: ${sampleUser.email} (${sampleUser.role})`);
    }
    
    console.log('\n✅ All checks passed! MongoDB is ready to use.\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ FAILED! MongoDB connection error\n');
    console.error(`Error: ${error.message}\n`);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Solution:');
      console.error('   1. Start MongoDB service');
      console.error('   2. Windows: Check Services app for "MongoDB" service');
      console.error('   3. Or start manually: mongod\n');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('💡 Solution:');
      console.error('   1. Check your MONGODB_URI in .env file');
      console.error('   2. For local: mongodb://localhost:27017/medicare');
      console.error('   3. For Atlas: Use valid connection string\n');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Solution:');
      console.error('   1. MongoDB is not responding');
      console.error('   2. Check if MongoDB service is running');
      console.error('   3. Check firewall settings\n');
    }
    
    process.exit(1);
  }
}

verifyConnection();


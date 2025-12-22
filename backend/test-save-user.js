/**
 * Test Saving User to MongoDB
 * This script tests if user creation works and saves to database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testSaveUser = async () => {
  try {
    console.log('\n🧪 Testing User Creation in MongoDB\n');
    
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare';
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
    
    // Test user data
    const testUserData = {
      name: 'Test Patient',
      email: `test${Date.now()}@example.com`, // Unique email
      password: 'Test123!@#', // Will be hashed by pre-save hook
      role: 'patient',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    };
    
    console.log('📝 Creating test user...');
    console.log('   Email:', testUserData.email);
    console.log('   Role:', testUserData.role);
    console.log('   Password:', 'Test123!@# (will be hashed)\n');
    
    // Create user
    const user = await User.create(testUserData);
    
    console.log('✅ User created successfully!');
    console.log('   User ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Password hash:', user.password ? `${user.password.substring(0, 20)}...` : 'N/A');
    console.log('   Created at:', user.createdAt);
    
    // Verify user exists in database
    console.log('\n🔍 Verifying user in database...');
    const foundUser = await User.findById(user._id);
    if (foundUser) {
      console.log('✅ User found in database!');
      console.log('   Name:', foundUser.name);
      console.log('   Email:', foundUser.email);
    } else {
      console.log('❌ User not found in database!');
    }
    
    // Count all users
    const userCount = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${userCount}`);
    
    // List all users
    if (userCount > 0) {
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({}).select('email name role createdAt');
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (${u.role}) - Created: ${u.createdAt}`);
      });
    }
    
    console.log('\n✅ Test completed successfully!');
    console.log('💡 You can now see this user in MongoDB Compass:\n');
    console.log('   1. Open MongoDB Compass');
    console.log('   2. Connect to: mongodb://localhost:27017');
    console.log('   3. Click on "medicare" database');
    console.log('   4. Click on "users" collection');
    console.log('   5. You should see the test user!\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n💡 Error details:');
    console.error('   Name:', error.name);
    console.error('   Code:', error.code);
    if (error.errors) {
      console.error('   Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`     ${key}: ${error.errors[key].message}`);
      });
    }
    console.error('\n');
    process.exit(1);
  }
};

testSaveUser();


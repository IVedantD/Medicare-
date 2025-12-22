/**
 * Test Login Script
 * Use this to test login functionality directly
 * 
 * Usage: node test-login.js <email> <password>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const testLogin = async (email, password) => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare');
    console.log('✅ Connected to MongoDB\n');

    // Find user
    console.log(`🔍 Looking for user with email: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ User not found in database');
      console.log('\n💡 Possible issues:');
      console.log('   1. User was never registered');
      console.log('   2. Email is incorrect');
      console.log('   3. Database connection issue');
      process.exit(1);
    }

    console.log(`✅ User found: ${user.name} (${user.role})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Password hash exists: ${!!user.password}`);
    console.log(`   Password hash length: ${user.password ? user.password.length : 0}`);
    console.log(`   Password hash starts with: ${user.password ? user.password.substring(0, 7) : 'N/A'}`);

    // Check if password hash looks valid (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (user.password && !user.password.startsWith('$2')) {
      console.log('\n⚠️  WARNING: Password hash format looks invalid!');
      console.log('   Bcrypt hashes should start with $2a$, $2b$, or $2y$');
      console.log('   This might indicate the password was not hashed correctly during registration.');
    }

    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    const isPasswordValid = await user.comparePassword(password);
    
    if (isPasswordValid) {
      console.log('✅ Password is CORRECT!');
      console.log('\n✅ Login should work. If it doesn\'t, check:');
      console.log('   1. Frontend is sending correct email/password');
      console.log('   2. API endpoint is receiving the request');
      console.log('   3. Check browser console and network tab');
    } else {
      console.log('❌ Password is INCORRECT!');
      console.log('\n💡 Possible issues:');
      console.log('   1. Password entered is wrong');
      console.log('   2. Password was double-hashed during registration');
      console.log('   3. Password hash in database is corrupted');
      console.log('\n🔧 To fix:');
      console.log('   Option 1: Reset password for this user');
      console.log('   Option 2: Re-register with a new account');
    }

    // Test direct bcrypt comparison
    console.log('\n🧪 Testing direct bcrypt comparison...');
    try {
      const directCompare = await bcrypt.compare(password, user.password);
      console.log(`   Direct bcrypt.compare result: ${directCompare}`);
      if (directCompare !== isPasswordValid) {
        console.log('   ⚠️  WARNING: comparePassword method result differs from direct bcrypt.compare!');
      }
    } catch (error) {
      console.log(`   ❌ Direct bcrypt comparison error: ${error.message}`);
    }

    await mongoose.disconnect();
    process.exit(isPasswordValid ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node test-login.js <email> <password>');
  console.log('Example: node test-login.js user@example.com MyPassword123!');
  process.exit(1);
}

testLogin(email, password);


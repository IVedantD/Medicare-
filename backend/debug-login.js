/**
 * Debug Login Issue
 * This script helps diagnose why login is failing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const testLogin = async (email, password) => {
  try {
    console.log('\n🔍 Debugging Login Issue\n');
    console.log('─'.repeat(60));
    
    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare';
    console.log(`📡 Connecting to: ${mongoURI.replace(/:([^:@]+)@/, ':****@')}`);
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
    console.log('─'.repeat(60));

    // Find user
    console.log(`\n🔍 Step 1: Looking for user with email: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('❌ USER NOT FOUND in database!');
      console.log('\n💡 Possible reasons:');
      console.log('   1. User was never registered');
      console.log('   2. Email is incorrect');
      console.log('   3. User was registered with different email');
      console.log('\n📋 Checking all users in database...\n');
      
      const allUsers = await User.find({}).select('email name role');
      if (allUsers.length === 0) {
        console.log('   ⚠️  No users found in database at all!');
        console.log('   💡 You need to register a user first.\n');
      } else {
        console.log(`   Found ${allUsers.length} user(s):`);
        allUsers.forEach((u, i) => {
          console.log(`   ${i + 1}. Email: ${u.email}, Name: ${u.name}, Role: ${u.role}`);
        });
        console.log('\n   💡 Try logging in with one of these emails.\n');
      }
      
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Password hash exists: ${!!user.password}`);
    console.log(`   Password hash length: ${user.password ? user.password.length : 0}`);
    console.log(`   Password hash starts with: ${user.password ? user.password.substring(0, 7) : 'N/A'}`);

    // Check password hash format
    if (user.password && !user.password.startsWith('$2')) {
      console.log('\n⚠️  WARNING: Password hash format looks invalid!');
      console.log('   Bcrypt hashes should start with $2a$, $2b$, or $2y$');
      console.log('   This might indicate the password was not hashed correctly.\n');
    }

    // Test password comparison
    console.log('\n🔐 Step 2: Testing password comparison...');
    console.log(`   Comparing password: "${password}"`);
    
    const isPasswordValid = await user.comparePassword(password);
    console.log(`   Result: ${isPasswordValid ? '✅ CORRECT' : '❌ INCORRECT'}`);

    // Test direct bcrypt comparison
    console.log('\n🧪 Step 3: Testing direct bcrypt comparison...');
    try {
      const directCompare = await bcrypt.compare(password, user.password);
      console.log(`   Direct bcrypt.compare result: ${directCompare ? '✅ CORRECT' : '❌ INCORRECT'}`);
      
      if (directCompare !== isPasswordValid) {
        console.log('   ⚠️  WARNING: comparePassword method differs from direct bcrypt.compare!');
      }
    } catch (bcryptError) {
      console.log(`   ❌ Direct bcrypt comparison error: ${bcryptError.message}`);
    }

    // Summary
    console.log('\n' + '─'.repeat(60));
    console.log('📊 SUMMARY\n');
    
    if (isPasswordValid) {
      console.log('✅ PASSWORD IS CORRECT!');
      console.log('✅ Login should work!');
      console.log('\n💡 If login still fails, check:');
      console.log('   1. Backend server is running');
      console.log('   2. API endpoint is correct');
      console.log('   3. Frontend is calling the correct API');
      console.log('   4. Check browser console for errors');
      console.log('   5. Check backend console for [LOGIN DEBUG] messages\n');
    } else {
      console.log('❌ PASSWORD IS INCORRECT!');
      console.log('\n💡 Possible issues:');
      console.log('   1. Wrong password entered');
      console.log('   2. Password was double-hashed during registration');
      console.log('   3. Password hash is corrupted');
      console.log('\n🔧 Solutions:');
      console.log('   1. Try the exact password used during registration');
      console.log('   2. Re-register with a new account');
      console.log('   3. Reset password in database\n');
    }

    await mongoose.disconnect();
    process.exit(isPasswordValid ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
      console.error('\n💡 MongoDB Connection Error:');
      console.error('   MongoDB is not running or not accessible');
      console.error('   Start MongoDB service or check connection string\n');
    }
    
    process.exit(1);
  }
};

// Get command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node debug-login.js <email> <password>');
  console.log('Example: node debug-login.js user@example.com MyPassword123!');
  process.exit(1);
}

testLogin(email, password);


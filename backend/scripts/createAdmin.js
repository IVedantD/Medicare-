const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Admin credentials
const ADMIN_EMAIL = 'admin@medicare.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME = 'MediCare Admin';

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare';
    console.log('🔌 Connecting to MongoDB...');
    
    const conn = await mongoose.connect(mongoUri);
    const host = conn.connection.host;
    const dbName = conn.connection.name;
    console.log(`✅ MongoDB Connected: ${host}`);
    console.log(`   Database: ${dbName}`);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('\n📋 Existing Admin Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Email:    ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log(`   Name:     ${existingAdmin.name}`);
      console.log(`   Role:     ${existingAdmin.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Update password if needed (in case it was changed)
      const isPasswordCorrect = await existingAdmin.comparePassword(ADMIN_PASSWORD);
      if (!isPasswordCorrect) {
        console.log('⚠️  Password mismatch. Updating password...');
        existingAdmin.password = ADMIN_PASSWORD;
        await existingAdmin.save();
        console.log('✅ Password updated successfully');
      }
      
      await mongoose.disconnect();
      return;
    }

    // Create admin user (password will be hashed by User model's pre-save hook)
    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD, // Will be hashed automatically
      role: 'admin',
      phone: '+91 9876543210',
      isActive: true,
      verified: true, // Admin is always verified
      address: {
        street: 'MediCare Headquarters',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    });

    await admin.save();

    console.log('\n✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   🎉 ADMIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Name:     ${ADMIN_NAME}`);
    console.log(`   Role:     Admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 Login Instructions:');
    console.log('   1. Go to: http://localhost:8080/login');
    console.log(`   2. Email: ${ADMIN_EMAIL}`);
    console.log(`   3. Password: ${ADMIN_PASSWORD}`);
    console.log('   4. You will be redirected to /admin/dashboard\n');

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the script
createAdmin();


/**
 * Check and fix .env file
 * This script helps diagnose and fix MongoDB connection issues
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('\n🔍 Checking .env file...\n');

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file does NOT exist!');
  console.log('\n📝 To create it:');
  console.log('   1. Copy .env.example to .env');
  console.log('   2. Or run: node setup-env.js');
  console.log('   3. Or manually create backend/.env file\n');
  process.exit(1);
}

console.log('✅ .env file exists');

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

console.log('\n📋 Current .env content:\n');
console.log('─'.repeat(50));

let hasMongoURI = false;
let mongoURI = '';
let issues = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  // Skip comments and empty lines
  if (trimmed.startsWith('#') || trimmed === '') {
    console.log(line);
    return;
  }
  
  // Check for MONGODB_URI
  if (trimmed.startsWith('MONGODB_URI=')) {
    hasMongoURI = true;
    mongoURI = trimmed.substring('MONGODB_URI='.length);
    
    // Hide password in output
    const safeURI = mongoURI.replace(/:([^:@]+)@/, ':****@');
    console.log(`MONGODB_URI=${safeURI}`);
    
    // Check for issues
    if (mongoURI.includes('cluster.mongodb.net') && !mongoURI.includes('@')) {
      issues.push('❌ Invalid Atlas connection string (placeholder detected)');
    }
    if (mongoURI.includes('username') || mongoURI.includes('password')) {
      issues.push('❌ Connection string contains placeholders (username/password)');
    }
    if (mongoURI.includes('xxxxx') || mongoURI.includes('cluster0.xxxxx')) {
      issues.push('❌ Connection string contains placeholder cluster name');
    }
    if (mongoURI === '' || mongoURI === 'mongodb://localhost:27017/medicare') {
      console.log('   ℹ️  Using local MongoDB - make sure MongoDB is running');
    }
  } else {
    console.log(line);
  }
});

console.log('─'.repeat(50));

// Summary
console.log('\n📊 Summary:\n');

if (!hasMongoURI) {
  console.log('❌ MONGODB_URI not found in .env file');
  console.log('\n💡 Add this line to your .env file:');
  console.log('   For local: MONGODB_URI=mongodb://localhost:27017/medicare');
  console.log('   For Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/medicare');
} else {
  console.log('✅ MONGODB_URI found');
  
  if (issues.length > 0) {
    console.log('\n⚠️  Issues detected:\n');
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('\n💡 Fix: Update MONGODB_URI in .env file with your actual connection string');
  } else {
    console.log('✅ Connection string format looks valid');
  }
}

// Check other required variables
const required = ['PORT', 'JWT_SECRET', 'NODE_ENV'];
const missing = required.filter(key => !envContent.includes(`${key}=`));

if (missing.length > 0) {
  console.log(`\n⚠️  Missing variables: ${missing.join(', ')}`);
} else {
  console.log('✅ All required variables present');
}

console.log('\n📁 File location:', envPath);
console.log('\n💡 Next steps:');
if (issues.length > 0) {
  console.log('   1. Fix MONGODB_URI in .env file');
  console.log('   2. Restart backend server: npm run dev');
} else if (!hasMongoURI) {
  console.log('   1. Add MONGODB_URI to .env file');
  console.log('   2. Restart backend server: npm run dev');
} else {
  console.log('   1. Restart backend server: npm run dev');
  console.log('   2. Check for "✅ MongoDB Connected" message');
}
console.log('');


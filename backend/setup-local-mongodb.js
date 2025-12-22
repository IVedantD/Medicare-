/**
 * Setup Local MongoDB Connection
 * Configures .env file for local MongoDB (MongoDB Compass)
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

console.log('\n🔧 Setting up Local MongoDB Connection\n');
console.log('This will configure your .env file to use local MongoDB.');
console.log('Make sure MongoDB is installed and running on your machine.\n');

// Read current .env or create default
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found existing .env file');
} else {
  console.log('📝 Creating new .env file');
  envContent = `# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/medicare

# JWT Configuration
JWT_SECRET=medicare_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Other Configuration
BCRYPT_ROUNDS=10
`;
}

// Update MONGODB_URI to local MongoDB
const lines = envContent.split('\n');
const updatedLines = lines.map(line => {
  const trimmed = line.trim();
  
  // Replace any MONGODB_URI line (active or commented)
  if (trimmed.startsWith('MONGODB_URI=') || trimmed.startsWith('# MONGODB_URI=')) {
    return 'MONGODB_URI=mongodb://localhost:27017/medicare';
  }
  
  return line;
});

// If MONGODB_URI wasn't found, add it
const hasMongoURI = updatedLines.some(line => line.trim().startsWith('MONGODB_URI='));
if (!hasMongoURI) {
  // Find where to insert (after PORT or in MongoDB section)
  const portIndex = updatedLines.findIndex(line => line.includes('PORT='));
  if (portIndex !== -1) {
    updatedLines.splice(portIndex + 3, 0, '', '# MongoDB Configuration', 'MONGODB_URI=mongodb://localhost:27017/medicare');
  } else {
    updatedLines.push('', '# MongoDB Configuration', 'MONGODB_URI=mongodb://localhost:27017/medicare');
  }
}

// Write updated .env
try {
  fs.writeFileSync(envPath, updatedLines.join('\n'));
  console.log('✅ .env file updated successfully!');
  console.log('\n📋 Configuration:');
  console.log('   MONGODB_URI=mongodb://localhost:27017/medicare');
  console.log('   Database: medicare');
  console.log('   Host: localhost:27017');
  console.log('\n📝 Next Steps:');
  console.log('   1. Make sure MongoDB service is running');
  console.log('   2. Open MongoDB Compass and connect to: mongodb://localhost:27017');
  console.log('   3. You should see the "medicare" database after first connection');
  console.log('   4. Restart your backend server: npm run dev');
  console.log('   5. Check for "✅ MongoDB Connected: localhost" message\n');
  console.log('💡 To verify MongoDB is running:');
  console.log('   - Windows: Check Services app for "MongoDB" service');
  console.log('   - Or test: mongosh mongodb://localhost:27017/medicare\n');
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
  process.exit(1);
}


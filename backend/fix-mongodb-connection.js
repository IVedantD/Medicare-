/**
 * Fix MongoDB Connection
 * This script helps you set up the correct MongoDB connection
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixConnection() {
  console.log('\n🔧 MongoDB Connection Fix\n');
  console.log('Your current .env file is set to local MongoDB, but you\'re getting an Atlas error.');
  console.log('This means either:');
  console.log('  1. You want to use local MongoDB (need to install/start it)');
  console.log('  2. You want to use MongoDB Atlas (need to update connection string)\n');

  const choice = await question('Choose option:\n1. Use Local MongoDB\n2. Use MongoDB Atlas\nEnter (1 or 2): ');

  let mongoURI = '';
  let instructions = '';

  if (choice === '1') {
    // Local MongoDB
    mongoURI = 'mongodb://localhost:27017/medicare';
    console.log('\n✅ Setting up for Local MongoDB');
    console.log('\n📋 Instructions:');
    console.log('   1. Install MongoDB Community Server:');
    console.log('      https://www.mongodb.com/try/download/community');
    console.log('   2. Start MongoDB service (Windows: it starts automatically)');
    console.log('   3. Or use Docker: docker run -d -p 27017:27017 --name mongodb mongo:latest');
    console.log('   4. Restart your backend server\n');
  } else if (choice === '2') {
    // MongoDB Atlas
    console.log('\n📝 MongoDB Atlas Setup:\n');
    console.log('If you don\'t have Atlas account:');
    console.log('   1. Go to: https://www.mongodb.com/cloud/atlas');
    console.log('   2. Sign up (free tier available)');
    console.log('   3. Create a cluster (takes 3-5 minutes)');
    console.log('   4. Database Access → Add user (username + password)');
    console.log('   5. Network Access → Add IP (0.0.0.0/0 for development)');
    console.log('   6. Database → Connect → Connect your application');
    console.log('   7. Copy the connection string\n');

    const hasAtlas = await question('Do you already have MongoDB Atlas connection string? (y/N): ');
    
    if (hasAtlas.toLowerCase() === 'y') {
      const connectionString = await question('Paste your Atlas connection string: ');
      
      // Validate and fix connection string
      let uri = connectionString.trim();
      
      // Remove quotes if present
      if (uri.startsWith('"') && uri.endsWith('"')) {
        uri = uri.slice(1, -1);
      }
      if (uri.startsWith("'") && uri.endsWith("'")) {
        uri = uri.slice(1, -1);
      }
      
      // Ensure /medicare is in the path
      if (!uri.includes('/medicare')) {
        if (uri.includes('?')) {
          uri = uri.replace('?', '/medicare?');
        } else {
          uri = uri + '/medicare';
        }
      }
      
      mongoURI = uri;
      console.log('\n✅ Connection string updated');
    } else {
      console.log('\n⚠️  Please set up MongoDB Atlas first, then run this script again.');
      console.log('   Or use local MongoDB (option 1)\n');
      rl.close();
      return;
    }
  } else {
    console.log('❌ Invalid choice. Exiting.');
    rl.close();
    return;
  }

  // Read current .env
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or add MONGODB_URI
  const lines = envContent.split('\n');
  let updated = false;
  const newLines = lines.map(line => {
    if (line.trim().startsWith('MONGODB_URI=') || line.trim().startsWith('# MONGODB_URI=')) {
      updated = true;
      return `MONGODB_URI=${mongoURI}`;
    }
    return line;
  });

  // If MONGODB_URI wasn't found, add it
  if (!updated) {
    // Find where to insert (after PORT or at the end)
    const portIndex = newLines.findIndex(line => line.includes('PORT='));
    if (portIndex !== -1) {
      newLines.splice(portIndex + 1, 0, '', `MONGODB_URI=${mongoURI}`);
    } else {
      newLines.push(`MONGODB_URI=${mongoURI}`);
    }
  }

  // Write updated .env
  try {
    fs.writeFileSync(envPath, newLines.join('\n'));
    console.log('\n✅ .env file updated successfully!');
    console.log(`   MONGODB_URI=${mongoURI.replace(/:([^:@]+)@/, ':****@')}`);
    console.log('\n🚀 Next steps:');
    console.log('   1. Restart your backend server: npm run dev');
    console.log('   2. Look for "✅ MongoDB Connected" message');
    console.log('   3. If you see errors, check the troubleshooting guide\n');
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
  }

  rl.close();
}

fixConnection().catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});


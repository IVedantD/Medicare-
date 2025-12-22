/**
 * Test Registration API
 * Use this to test registration directly
 */

const axios = require('axios');

const testRegister = async () => {
  try {
    console.log('\n🧪 Testing Registration API\n');
    
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@#',
      role: 'patient',
      phone: '' // Optional
    };

    console.log('📤 Sending registration request...');
    console.log('   Email:', testData.email);
    console.log('   Role:', testData.role);
    console.log('   Password:', 'Test123!@# (meets requirements)\n');

    const response = await axios.post('http://localhost:5000/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Registration successful!');
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ You can now login with:');
    console.log(`   Email: ${testData.email}`);
    console.log(`   Password: ${testData.password}\n`);

  } catch (error) {
    console.error('\n❌ Registration failed!\n');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data);
      console.error('\n💡 Error details:');
      console.error('   Message:', error.response.data?.message);
      if (error.response.data?.error) {
        console.error('   Details:', error.response.data.error);
      }
    } else if (error.request) {
      console.error('   No response received from server');
      console.error('   Is the backend server running?');
      console.error('   Check: http://localhost:5000/api/health');
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n');
    process.exit(1);
  }
};

testRegister();


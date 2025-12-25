/**
 * Simple test script to verify password change functionality
 * Run with: node test-password-change.js
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

// Test user credentials (you'll need to create a test user first)
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  newPassword: 'NewTestPassword123!'
};

async function testPasswordChange() {
  try {
    console.log('🧪 Testing Password Change Functionality...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.error('❌ Login failed:', error.message);
      console.log('\n💡 Make sure you have a test user with these credentials:');
      console.log(`   Email: ${TEST_USER.email}`);
      console.log(`   Password: ${TEST_USER.password}`);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // Step 2: Change password
    console.log('\n2. Changing password...');
    const changePasswordResponse = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: TEST_USER.password,
        newPassword: TEST_USER.newPassword
      })
    });

    if (!changePasswordResponse.ok) {
      const error = await changePasswordResponse.json();
      console.error('❌ Password change failed:', error.message);
      return;
    }

    const changePasswordData = await changePasswordResponse.json();
    console.log('✅ Password changed successfully:', changePasswordData.message);

    // Step 3: Test login with new password
    console.log('\n3. Testing login with new password...');
    const newLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.newPassword
      })
    });

    if (!newLoginResponse.ok) {
      const error = await newLoginResponse.json();
      console.error('❌ Login with new password failed:', error.message);
      return;
    }

    console.log('✅ Login with new password successful');

    // Step 4: Change password back to original
    console.log('\n4. Changing password back to original...');
    const newToken = (await newLoginResponse.json()).token;
    const revertPasswordResponse = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newToken}`
      },
      body: JSON.stringify({
        currentPassword: TEST_USER.newPassword,
        newPassword: TEST_USER.password
      })
    });

    if (!revertPasswordResponse.ok) {
      const error = await revertPasswordResponse.json();
      console.error('❌ Password revert failed:', error.message);
      return;
    }

    console.log('✅ Password reverted successfully');

    console.log('\n🎉 All password change tests passed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test validation scenarios
async function testPasswordValidation() {
  try {
    console.log('\n🧪 Testing Password Validation...\n');

    // Login first
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password
      })
    });

    if (!loginResponse.ok) {
      console.log('⚠️  Skipping validation tests - login failed');
      return;
    }

    const token = (await loginResponse.json()).token;

    // Test cases
    const testCases = [
      {
        name: 'Empty current password',
        data: { currentPassword: '', newPassword: 'NewPassword123!' },
        expectedError: 'Please provide current password and new password'
      },
      {
        name: 'Empty new password',
        data: { currentPassword: TEST_USER.password, newPassword: '' },
        expectedError: 'Please provide current password and new password'
      },
      {
        name: 'Weak new password',
        data: { currentPassword: TEST_USER.password, newPassword: 'weak' },
        expectedError: 'New password must be at least 8 characters'
      },
      {
        name: 'Same password',
        data: { currentPassword: TEST_USER.password, newPassword: TEST_USER.password },
        expectedError: 'New password must be different from current password'
      },
      {
        name: 'Wrong current password',
        data: { currentPassword: 'WrongPassword123!', newPassword: 'NewPassword123!' },
        expectedError: 'Current password is incorrect'
      }
    ];

    for (const testCase of testCases) {
      console.log(`Testing: ${testCase.name}`);
      
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`❌ Expected error but got success for: ${testCase.name}`);
      } else if (result.message.includes(testCase.expectedError.split(' ')[0])) {
        console.log(`✅ Correct validation for: ${testCase.name}`);
      } else {
        console.log(`⚠️  Unexpected error for ${testCase.name}: ${result.message}`);
      }
    }

    console.log('\n✅ Password validation tests completed');

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testPasswordChange();
  await testPasswordValidation();
}

runAllTests();
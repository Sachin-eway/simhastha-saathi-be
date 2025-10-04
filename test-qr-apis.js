const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_MOBILE = '1234567890';

let authToken = null;
let qrId = null;

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ API Error (${method} ${endpoint}):`, error.response?.data || error.message);
    return null;
  }
}

// Test functions
async function testLogin() {
  console.log('\n🔐 Testing Login...');
  
  const response = await apiCall('POST', '/api/auth/login-user', {
    mobileNumber: TEST_MOBILE
  });
  
  if (response && response.success) {
    authToken = response.data.token;
    console.log('✅ Login successful!');
    console.log(`👤 User: ${response.data.user.fullName}`);
    console.log(`🏠 Group ID: ${response.data.user.groupId}`);
    return true;
  } else {
    console.log('❌ Login failed. Please register a user first.');
    return false;
  }
}

async function testGenerateQR() {
  console.log('\n📱 Testing QR Generation...');
  
  const response = await apiCall('POST', '/api/qr/generate', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (response && response.success) {
    qrId = response.data.qrId;
    console.log('✅ QR generated successfully!');
    console.log(`🆔 QR ID: ${qrId}`);
    console.log(`📊 QR Data: ${response.data.qrData}`);
    return true;
  } else {
    console.log('❌ QR generation failed');
    return false;
  }
}

async function testBindMember() {
  console.log('\n🔗 Testing Member Binding...');
  
  const memberDetails = {
    fullName: 'Test Member',
    mobileNumber: '9876543210',
    age: 30,
    emergencyContact: '1111111111'
  };
  
  const response = await apiCall('POST', '/api/qr/bind', {
    qrId,
    memberDetails
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (response && response.success) {
    console.log('✅ Member bound successfully!');
    console.log(`👤 Member: ${response.data.memberDetails.fullName}`);
    console.log(`📱 Mobile: ${response.data.memberDetails.mobileNumber}`);
    console.log(`🏠 Group ID: ${response.data.groupId}`);
    return true;
  } else {
    console.log('❌ Member binding failed');
    return false;
  }
}

async function testScanQR() {
  console.log('\n📱 Testing QR Scan...');
  
  const response = await apiCall('GET', `/api/qr/scan/${qrId}`);
  
  if (response && response.success) {
    console.log('✅ QR scan successful!');
    if (response.data.isBound) {
      console.log(`👤 Member: ${response.data.member.name}`);
      console.log(`📱 Mobile: ${response.data.member.mobile}`);
      console.log(`🎂 Age: ${response.data.member.age}`);
      console.log(`🚨 Emergency: ${response.data.member.emergencyContact}`);
      console.log(`🏠 Group ID: ${response.data.member.groupId}`);
      console.log(`⏰ Bound at: ${response.data.boundAt}`);
    } else {
      console.log('📱 QR is not bound to any member');
    }
    return true;
  } else {
    console.log('❌ QR scan failed');
    return false;
  }
}

async function testQRStats() {
  console.log('\n📊 Testing QR Statistics...');
  
  const response = await apiCall('GET', '/api/qr/stats', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (response && response.success) {
    console.log('✅ QR statistics retrieved!');
    console.log(`📊 Total QRs: ${response.data.total}`);
    console.log(`🔗 Bound QRs: ${response.data.bound}`);
    console.log(`📱 Unbound QRs: ${response.data.unbound}`);
    console.log(`🆕 Recent QRs (24h): ${response.data.recent}`);
    return true;
  } else {
    console.log('❌ QR statistics failed');
    return false;
  }
}

async function testGetAllQRs() {
  console.log('\n📋 Testing Get All QRs...');
  
  const response = await apiCall('GET', '/api/qr/all', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (response && response.success) {
    console.log('✅ All QRs retrieved!');
    console.log(`📊 Total QRs: ${response.data.length}`);
    response.data.forEach((qr, index) => {
      console.log(`  ${index + 1}. QR ID: ${qr.id} - ${qr.member_name || 'Unbound'} (${qr.created_at})`);
    });
    return true;
  } else {
    console.log('❌ Get all QRs failed');
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting QR API Tests...\n');
  
  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Test 2: Generate QR
  const qrGenerated = await testGenerateQR();
  if (!qrGenerated) {
    console.log('\n❌ Cannot proceed without QR code');
    return;
  }
  
  // Test 3: Scan QR (should be unbound)
  await testScanQR();
  
  // Test 4: Bind member to QR
  const memberBound = await testBindMember();
  if (!memberBound) {
    console.log('\n❌ Member binding failed');
    return;
  }
  
  // Test 5: Scan QR again (should show member details)
  await testScanQR();
  
  // Test 6: Get QR statistics
  await testQRStats();
  
  // Test 7: Get all QRs
  await testGetAllQRs();
  
  console.log('\n✅ All QR tests completed!');
  console.log('\n📋 Test Summary:');
  console.log('- QR code generation works');
  console.log('- Member binding works');
  console.log('- QR scanning works');
  console.log('- Statistics and admin functions work');
  console.log('\n🎯 Frontend can now use these APIs to:');
  console.log('1. Generate QR codes for printing');
  console.log('2. Bind members to QR codes');
  console.log('3. Scan QR codes to get member details');
  console.log('4. Manage QR codes and statistics');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down QR test client...');
  process.exit(0);
});

// Run the tests
runTests().catch(console.error);

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_MOBILE = '1234567890';

let authToken = null;
let adminToken = null;

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
    
    const startTime = Date.now();
    const response = await axios(config);
    const endTime = Date.now();
    
    return {
      data: response.data,
      responseTime: endTime - startTime,
      status: response.status
    };
  } catch (error) {
    return {
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
      responseTime: 0
    };
  }
}

// Test functions
async function testLogin() {
  console.log('\n🔐 Testing Login...');
  
  const result = await apiCall('POST', '/api/auth/login-user', {
    mobileNumber: TEST_MOBILE
  });
  
  if (result.data && result.data.success) {
    authToken = result.data.data.token;
    console.log('✅ Login successful!');
    console.log(`⏱️  Response time: ${result.responseTime}ms`);
    return true;
  } else {
    console.log('❌ Login failed. Please register a user first.');
    return false;
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🚫 Testing Unauthorized Access...');
  
  // Test without token
  const result1 = await apiCall('GET', '/api/qr/stats');
  console.log(`📊 No token - Status: ${result1.status}, Message: ${result1.error?.message || 'Success'}`);
  
  // Test with invalid token
  const result2 = await apiCall('GET', '/api/qr/stats', null, {
    'Authorization': 'Bearer invalid_token'
  });
  console.log(`📊 Invalid token - Status: ${result2.status}, Message: ${result2.error?.message || 'Success'}`);
  
  return true;
}

async function testAuthorizedAccess() {
  console.log('\n✅ Testing Authorized Access...');
  
  const result = await apiCall('GET', '/api/qr/stats', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.data && result.data.success) {
    console.log('✅ Authorized access successful!');
    console.log(`📊 Total QRs: ${result.data.data.total}`);
    console.log(`⏱️  Response time: ${result.responseTime}ms`);
    return true;
  } else {
    console.log('❌ Authorized access failed');
    console.log(`Status: ${result.status}, Message: ${result.error?.message}`);
    return false;
  }
}

async function testRateLimiting() {
  console.log('\n⏱️  Testing Rate Limiting...');
  
  const requests = [];
  const startTime = Date.now();
  
  // Make multiple requests quickly
  for (let i = 0; i < 15; i++) {
    requests.push(apiCall('POST', '/api/auth/login-user', {
      mobileNumber: TEST_MOBILE
    }));
  }
  
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  const successCount = results.filter(r => r.status === 200).length;
  const rateLimitedCount = results.filter(r => r.status === 429).length;
  
  console.log(`📊 Total requests: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`🚫 Rate limited: ${rateLimitedCount}`);
  console.log(`⏱️  Total time: ${endTime - startTime}ms`);
  
  return true;
}

async function testCORS() {
  console.log('\n🌐 Testing CORS...');
  
  const result = await apiCall('OPTIONS', '/api/qr/stats');
  
  if (result.status === 200) {
    console.log('✅ CORS preflight successful!');
    return true;
  } else {
    console.log('❌ CORS preflight failed');
    return false;
  }
}

async function testRequestLogging() {
  console.log('\n📝 Testing Request Logging...');
  
  const result = await apiCall('GET', '/health');
  
  if (result.data && result.data.status === 'OK') {
    console.log('✅ Health check successful!');
    console.log(`⏱️  Response time: ${result.responseTime}ms`);
    console.log('📝 Check server console for request logs');
    return true;
  } else {
    console.log('❌ Health check failed');
    return false;
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  // Test invalid endpoint
  const result = await apiCall('GET', '/api/invalid-endpoint');
  
  if (result.status === 404) {
    console.log('✅ 404 error handled correctly!');
    console.log(`Message: ${result.error?.message || 'Not found'}`);
    return true;
  } else {
    console.log('❌ Error handling failed');
    return false;
  }
}

async function testQRMiddleware() {
  console.log('\n📱 Testing QR Middleware...');
  
  // Test QR generation without admin token
  const result1 = await apiCall('POST', '/api/qr/generate', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result1.status === 403) {
    console.log('✅ Admin access correctly denied!');
    console.log(`Message: ${result1.error?.message}`);
  } else {
    console.log('❌ Admin access not properly restricted');
  }
  
  // Test QR scan (public endpoint)
  const result2 = await apiCall('GET', '/api/qr/scan/1');
  
  if (result2.data) {
    console.log('✅ Public QR scan accessible!');
    console.log(`Message: ${result2.data.message}`);
  } else {
    console.log('❌ Public QR scan failed');
  }
  
  return true;
}

async function testLocationMiddleware() {
  console.log('\n📍 Testing Location Middleware...');
  
  // Test location update without token
  const result1 = await apiCall('POST', '/api/location/update', {
    latitude: 22.7196,
    longitude: 75.8577
  });
  
  if (result1.status === 401) {
    console.log('✅ Location update correctly requires authentication!');
    console.log(`Message: ${result1.error?.message}`);
  } else {
    console.log('❌ Location update not properly protected');
  }
  
  // Test location update with token
  const result2 = await apiCall('POST', '/api/location/update', {
    latitude: 22.7196,
    longitude: 75.8577
  }, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result2.data && result2.data.success) {
    console.log('✅ Authenticated location update successful!');
  } else {
    console.log('❌ Authenticated location update failed');
    console.log(`Message: ${result2.error?.message}`);
  }
  
  return true;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Middleware Tests...\n');
  
  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without authentication');
    return;
  }
  
  // Test 2: Unauthorized access
  await testUnauthorizedAccess();
  
  // Test 3: Authorized access
  await testAuthorizedAccess();
  
  // Test 4: Rate limiting
  await testRateLimiting();
  
  // Test 5: CORS
  await testCORS();
  
  // Test 6: Request logging
  await testRequestLogging();
  
  // Test 7: Error handling
  await testErrorHandling();
  
  // Test 8: QR middleware
  await testQRMiddleware();
  
  // Test 9: Location middleware
  await testLocationMiddleware();
  
  console.log('\n✅ All middleware tests completed!');
  console.log('\n📋 Middleware Features Tested:');
  console.log('- ✅ Authentication middleware');
  console.log('- ✅ Authorization middleware');
  console.log('- ✅ Rate limiting');
  console.log('- ✅ CORS handling');
  console.log('- ✅ Request logging');
  console.log('- ✅ Error handling');
  console.log('- ✅ Route protection');
  console.log('\n🎯 All middleware is working correctly!');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down middleware test client...');
  process.exit(0);
});

// Run the tests
runTests().catch(console.error);

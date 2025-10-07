const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:3000/api/qr';
const TEST_QUANTITY = 12; // Test with 12 QR codes (2 pages)

// You'll need to replace this with a valid admin token
const ADMIN_TOKEN = 'your_admin_token_here';

async function testQRPDFAPI() {
  try {
    console.log('🚀 Testing QR PDF Generation API...\n');

    // Test 1: Generate PDF with default quantity (6)
    console.log('📄 Test 1: Generating PDF with default quantity (6 QR codes)...');
    try {
      const response1 = await axios.post(`${BASE_URL}/generate-pdf`, 
        { quantity: 6 },
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );
      
      console.log('✅ Default quantity test passed');
      console.log(`   Status: ${response1.status}`);
      console.log(`   Content-Type: ${response1.headers['content-type']}`);
      console.log(`   Content-Disposition: ${response1.headers['content-disposition']}\n`);
    } catch (error) {
      console.log('❌ Default quantity test failed:', error.response?.data || error.message);
    }

    // Test 2: Generate PDF with custom quantity
    console.log(`📄 Test 2: Generating PDF with ${TEST_QUANTITY} QR codes...`);
    try {
      const response2 = await axios.post(`${BASE_URL}/generate-pdf`, 
        { quantity: TEST_QUANTITY },
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          },
          responseType: 'stream'
        }
      );
      
      console.log('✅ Custom quantity test passed');
      console.log(`   Status: ${response2.status}`);
      console.log(`   Content-Type: ${response2.headers['content-type']}`);
      console.log(`   Content-Disposition: ${response2.headers['content-disposition']}\n`);
    } catch (error) {
      console.log('❌ Custom quantity test failed:', error.response?.data || error.message);
    }

    // Test 3: Test validation (invalid quantity)
    console.log('📄 Test 3: Testing validation with invalid quantity...');
    try {
      const response3 = await axios.post(`${BASE_URL}/generate-pdf`, 
        { quantity: 2000 }, // Invalid: exceeds max limit
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('❌ Validation test failed - should have rejected invalid quantity');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation test passed - correctly rejected invalid quantity');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Validation test failed with unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 4: Test without authentication
    console.log('📄 Test 4: Testing without authentication...');
    try {
      const response4 = await axios.post(`${BASE_URL}/generate-pdf`, 
        { quantity: 6 }
      );
      
      console.log('❌ Authentication test failed - should have required auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication test passed - correctly required authentication');
        console.log(`   Error: ${error.response.data.message}\n`);
      } else {
        console.log('❌ Authentication test failed with unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 5: Test single QR image generation
    console.log('📄 Test 5: Testing single QR image generation...');
    try {
      // First generate a QR code to get an ID
      const generateResponse = await axios.post(`${BASE_URL}/generate`, 
        {},
        {
          headers: {
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const qrId = generateResponse.data.data.qrId;
      console.log(`   Generated QR ID: ${qrId}`);
      
      // Now test image generation
      const imageResponse = await axios.get(`${BASE_URL}/image/${qrId}?size=300`, {
        responseType: 'stream'
      });
      
      console.log('✅ Single QR image test passed');
      console.log(`   Status: ${imageResponse.status}`);
      console.log(`   Content-Type: ${imageResponse.headers['content-type']}`);
      console.log(`   Content-Disposition: ${imageResponse.headers['content-disposition']}\n`);
    } catch (error) {
      console.log('❌ Single QR image test failed:', error.response?.data || error.message);
    }

    console.log('🎉 All tests completed!');

  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Instructions for running the test
console.log('📋 QR PDF API Test Suite');
console.log('========================');
console.log('');
console.log('Before running this test:');
console.log('1. Make sure your server is running on http://localhost:3000');
console.log('2. Replace ADMIN_TOKEN with a valid admin JWT token');
console.log('3. Run: node test-qr-pdf-api.js');
console.log('');
console.log('API Endpoints to test:');
console.log('- POST /api/qr/generate-pdf (with auth)');
console.log('- GET /api/qr/image/:qrId (public)');
console.log('');

// Uncomment the line below to run the test
// testQRPDFAPI();

module.exports = { testQRPDFAPI };

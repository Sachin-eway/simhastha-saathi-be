const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const JWT_SECRET = 'your_jwt_secret_key_here'; // Should match your .env file

// Test user configurations
const testUsers = [
  {
    id: 1,
    name: 'User 1 (Admin)',
    isAdmin: true,
    groupId: 1
  },
  {
    id: 2,
    name: 'User 2',
    isAdmin: false,
    groupId: 1
  },
  {
    id: 3,
    name: 'User 3',
    isAdmin: false,
    groupId: 2
  }
];

// Generate JWT token for a user
function generateToken(userId, isAdmin = false) {
  return jwt.sign(
    { userId, isAdmin },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Create socket connection
function createConnection(user) {
  const token = generateToken(user.id, user.isAdmin);
  
  const socket = io(SERVER_URL, {
    query: { token },
    transports: ['websocket']
  });

  socket.user = user;

  // Connection events
  socket.on('connect', () => {
    console.log(`✅ ${user.name} connected successfully`);
  });

  socket.on('connected', (data) => {
    console.log(`📡 ${user.name} received welcome:`, data.message);
  });

  socket.on('error', (error) => {
    console.error(`❌ ${user.name} error:`, error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 ${user.name} disconnected:`, reason);
  });

  // Location events
  socket.on('location_updated', (data) => {
    console.log(`📍 ${user.name} location updated:`, data.message);
  });

  socket.on('location_update', (data) => {
    console.log(`📍 ${user.name} received location update:`, data);
  });

  socket.on('group_locations', (data) => {
    console.log(`👥 ${user.name} received group locations:`, data.data);
  });

  socket.on('all_group_locations', (data) => {
    console.log(`🌍 ${user.name} received all group locations:`, {
      count: data.data ? data.data.length : 0,
      timestamp: data.timestamp
    });
  });

  return socket;
}

// Test functions
function testLocationUpdates(socket) {
  console.log(`\n🧪 Testing location updates for ${socket.user.name}`);
  
  // Simulate location updates
  const locations = [
    { latitude: 22.7196, longitude: 75.8577 }, // Indore
    { latitude: 22.7196, longitude: 75.8577 },
    { latitude: 22.7200, longitude: 75.8580 },
    { latitude: 22.7205, longitude: 75.8585 }
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index < locations.length) {
      const location = locations[index];
      console.log(`📍 ${socket.user.name} sending location:`, location);
      socket.emit('location_update', location);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 2000);
}

function testGroupLocations(socket) {
  console.log(`\n🧪 Testing group locations request for ${socket.user.name}`);
  socket.emit('get_group_locations');
}

function testAllGroupLocations(socket) {
  console.log(`\n🧪 Testing all group locations request for ${socket.user.name}`);
  socket.emit('request_all_locations');
}

// Main test function
async function runTests() {
  console.log('🚀 Starting WebSocket tests...\n');
  
  // Create connections for all test users
  const sockets = testUsers.map(user => createConnection(user));
  
  // Wait for all connections to establish
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\n📊 Connection Status:');
  sockets.forEach(socket => {
    console.log(`${socket.user.name}: ${socket.connected ? 'Connected' : 'Disconnected'}`);
  });

  // Test 1: Location updates from User 1
  console.log('\n=== TEST 1: Location Updates ===');
  testLocationUpdates(sockets[0]);
  
  // Wait for location updates to complete
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Test 2: Request group locations
  console.log('\n=== TEST 2: Group Locations Request ===');
  testGroupLocations(sockets[1]);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Request all group locations
  console.log('\n=== TEST 3: All Group Locations Request ===');
  testAllGroupLocations(sockets[0]);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 4: Location updates from User 2 (same group)
  console.log('\n=== TEST 4: Location Updates from Group Member ===');
  testLocationUpdates(sockets[1]);
  
  // Wait for location updates to complete
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Test 5: Location updates from User 3 (different group)
  console.log('\n=== TEST 5: Location Updates from Different Group ===');
  testLocationUpdates(sockets[2]);
  
  // Wait for location updates to complete
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Test Summary:');
  console.log('- User 1 & User 2 are in the same group (Group 1)');
  console.log('- User 3 is in a different group (Group 2)');
  console.log('- Location updates should be shared within the same group');
  console.log('- Different groups should not receive each other\'s location updates');
  
  // Keep connections alive for a bit to see periodic updates
  console.log('\n⏰ Waiting for periodic location sharing (30s intervals)...');
  console.log('Press Ctrl+C to exit');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down test client...');
  process.exit(0);
});

// Run the tests
runTests().catch(console.error);

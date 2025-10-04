const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Simple WebSocket test - just connect and send a location update
const SERVER_URL = 'http://localhost:3000';
const JWT_SECRET = 'your_jwt_secret_key_here'; // Should match your .env file

// Test user
const testUser = {
  id: 1,
  name: 'Test User',
  isAdmin: true
};

// Generate JWT token
function generateToken(userId, isAdmin = false) {
  return jwt.sign(
    { userId, isAdmin },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Create connection
const token = generateToken(testUser.id, testUser.isAdmin);
const socket = io(SERVER_URL, {
  query: { token },
  transports: ['websocket']
});

console.log('🚀 Connecting to WebSocket server...');

// Event handlers
socket.on('connect', () => {
  console.log('✅ Connected successfully!');
  
  // Send a test location update after 2 seconds
  setTimeout(() => {
    console.log('📍 Sending test location update...');
    socket.emit('location_update', {
      latitude: 22.7196,
      longitude: 75.8577
    });
  }, 2000);
  
  // Request group locations after 5 seconds
  setTimeout(() => {
    console.log('👥 Requesting group locations...');
    socket.emit('get_group_locations');
  }, 5000);
  
  // Request all group locations after 8 seconds
  setTimeout(() => {
    console.log('🌍 Requesting all group locations...');
    socket.emit('request_all_locations');
  }, 8000);
});

socket.on('connected', (data) => {
  console.log('📡 Welcome message:', data.message);
});

socket.on('location_updated', (data) => {
  console.log('✅ Location update confirmed:', data.message);
});

socket.on('location_update', (data) => {
  console.log('📍 Received location update:', data);
});

socket.on('group_locations', (data) => {
  console.log('👥 Group locations received:', data.data);
});

socket.on('all_group_locations', (data) => {
  console.log('🌍 All group locations received:', {
    count: data.data ? data.data.length : 0,
    timestamp: data.timestamp
  });
});

socket.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Disconnecting...');
  socket.disconnect();
  process.exit(0);
});

console.log('Press Ctrl+C to exit');

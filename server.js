const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const { corsMiddleware, requestLogger, errorHandler } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Import services
const WebSocketService = require('./services/websocketService');
const wsService = new WebSocketService(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory
app.use(requestLogger); // Request logging
app.use(corsMiddleware); // CORS middleware

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/location', require('./routes/locationRoutes'));
app.use('/api/qr', require('./routes/qrRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simhastha Saathi API is running' });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  wsService.handleConnection(socket);
});

// Database initialization
async function initializeDatabase() {
  const db = require('./config/database');
  
  try {
    // Create database if not exists
    await db.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'simhastha_saathi'}`);
    
    // Create tables
    await db.execute(`
      CREATE TABLE IF NOT EXISTS groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255),
        mobile_number VARCHAR(15) UNIQUE NOT NULL,
        age INT,
        group_id INT,
        is_admin BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        otp VARCHAR(6),
        otp_expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS qr_codes (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_member_id (member_id),
        INDEX idx_created_at (created_at),
        INDEX idx_member_created (member_id, created_at)
      ) ENGINE=InnoDB
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS qr_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        age INT NOT NULL,
        emergency_contact VARCHAR(15) NOT NULL,
        address VARCHAR(255) default NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups(id)
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Start server
const start = async () => {
  try {
    await initializeDatabase();
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Socket.IO endpoint: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

// Error handling middleware (must be last)
app.use(errorHandler);

start();

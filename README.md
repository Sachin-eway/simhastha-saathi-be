# Simhastha Saathi - Family Tracking App Backend

A Node.js Express backend for family location tracking with real-time Socket.IO support.

## Features

- User (Admin) and Member registration with OTP verification
- JWT-based authentication
- Real-time location tracking via Socket.IO
- Group-based family management
- MySQL database integration

## Project Structure

```
├── config/
│   └── database.js          # Database configuration
├── models/
│   ├── User.js              # User model (Admin)
│   ├── Member.js            # Member model
│   ├── Group.js             # Group model
│   └── Location.js          # Location model
├── controllers/
│   ├── authController.js     # Authentication controller
│   └── locationController.js # Location controller
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── locationRoutes.js    # Location routes
├── services/
│   └── websocketService.js  # WebSocket service
├── utils/
│   ├── otpService.js        # OTP generation and sending
│   └── jwtService.js        # JWT token management
├── server.js                # Main server file
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Install MySQL
2. Create database: `simhastha_saathi`
3. Update `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=simhastha_saathi
JWT_SECRET=your_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 3. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication APIs

#### 1. Register User (Admin)
```
POST /api/auth/register-user
Content-Type: application/json

{
  "fullName": "John Doe",
  "mobileNumber": "1234567890",
  "age": 30
}
```

#### 2. Register Member
```
POST /api/auth/register-member
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "mobileNumber": "0987654321",
  "age": 25,
  "groupId": 1
}
```

#### 3. Login User
```
POST /api/auth/login-user
Content-Type: application/json

{
  "mobileNumber": "1234567890"
}
```

#### 4. Login Member
```
POST /api/auth/login-member
Content-Type: application/json

{
  "mobileNumber": "0987654321"
}
```

#### 5. Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "userId": 1,
  "otp": "123456",
  "userType": "admin" // or "member"
}
```

### Location APIs

#### 1. Update Location
```
POST /api/location/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

#### 2. Get Latest Location
```
GET /api/location/latest
Authorization: Bearer <token>
```

#### 3. Get Group Locations (Admin only)
```
GET /api/location/group
Authorization: Bearer <token>
```

## Socket.IO Connection

### Connect to Socket.IO
```javascript
const socket = io('http://localhost:3000', {
  query: {
    token: 'your_jwt_token_here'
  }
});
```

### Socket.IO Events

#### Send Location Update
```javascript
socket.emit('location_update', {
  latitude: 28.6139,
  longitude: 77.2090
});
```

#### Get Group Locations
```javascript
socket.emit('get_group_locations');
```

#### Request All Group Locations
```javascript
socket.emit('request_all_locations');
```

### Socket.IO Responses

#### Location Update Broadcast
```javascript
socket.on('location_update', (data) => {
  console.log('Location update:', data);
  // data: { userId, latitude, longitude, timestamp }
});
```

#### All Group Locations Broadcast (Real-time)
```javascript
socket.on('all_group_locations', (data) => {
  console.log('All group locations:', data.data);
  // data.data: array of all group members' locations
  // This is automatically sent every 30 seconds and when anyone updates location
});
```

#### Group Locations Response
```javascript
socket.on('group_locations', (data) => {
  console.log('Group locations:', data.data);
  // data.data: array of location objects
});
```

#### Connection Events
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data.message);
});

socket.on('location_updated', (data) => {
  console.log('Location updated:', data.message);
});

socket.on('error', (data) => {
  console.error('Error:', data.message);
});
```

## Database Schema

### Groups Table
- `id` (Primary Key)
- `created_at`

### Users Table
- `id` (Primary Key)
- `full_name`
- `mobile_number` (Unique)
- `age`
- `group_id` (Foreign Key)
- `is_admin` (Boolean)
- `is_verified` (Boolean)
- `otp`
- `otp_expires_at`
- `created_at`

### Locations Table
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `latitude`
- `longitude`
- `created_at`

## Usage Flow

1. **Admin Registration**: Admin registers and gets a group ID
2. **Member Registration**: Members join using the group ID
3. **OTP Verification**: All users verify their mobile numbers
4. **Login**: Users login with mobile number
5. **Location Tracking**: Users send location updates via WebSocket
6. **Real-time Updates**: All group members receive location updates in real-time

## Notes

- OTP is valid for 10 minutes
- JWT tokens expire in 24 hours
- Location updates are broadcast to all group members
- **All group locations are automatically shared every 30 seconds**
- **When any member updates location, all group members get updated locations**
- Database tables are created automatically on first run
- OTP is logged to console (for development) and can be sent via email

## Frontend Integration Example

```javascript
// Install socket.io-client
// npm install socket.io-client

const io = require('socket.io-client');

// Connect to server
const socket = io('http://localhost:3000', {
  query: {
    token: 'your_jwt_token_here'
  }
});

// Listen for connection
socket.on('connected', (data) => {
  console.log('Connected to server:', data.message);
});

// Send location update
function sendLocation(latitude, longitude) {
  socket.emit('location_update', {
    latitude: latitude,
    longitude: longitude
  });
}

// Listen for location updates from other users
socket.on('location_update', (data) => {
  console.log('User location updated:', data);
  // Update map with new location
});

// Listen for all group locations (automatically updated every 30 seconds)
socket.on('all_group_locations', (data) => {
  console.log('All group locations updated:', data.data);
  // Update map with all group members' locations
  // This includes all members: { id, full_name, latitude, longitude, created_at }
});

// Get all group locations on demand
socket.emit('get_group_locations');

socket.on('group_locations', (data) => {
  console.log('Group locations:', data.data);
  // Display all locations on map
});

// Request all group locations
socket.emit('request_all_locations');
```

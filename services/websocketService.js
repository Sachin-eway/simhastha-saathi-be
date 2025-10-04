const JWTService = require('../utils/jwtService');
const Location = require('../models/Location');
const User = require('../models/User');

class WebSocketService {
  constructor(io) {
    this.io = io;
    this.connections = new Map(); // userId -> socket
    this.groupConnections = new Map(); // groupId -> Set of userIds
    this.locationIntervals = new Map(); // groupId -> interval
    this.startPeriodicLocationSharing();
  }

  // Handle new Socket.IO connection
  handleConnection(socket) {
    const token = socket.handshake.query.token;

    if (!token) {
      socket.emit('error', { message: 'Token required' });
      socket.disconnect();
      return;
    }

    const decoded = JWTService.verifyToken(token);
    if (!decoded) {
      socket.emit('error', { message: 'Invalid token' });
      socket.disconnect();
      return;
    }

    // Store connection
    this.connections.set(decoded.userId, socket);
    
    // Get user's group and add to group connections
    this.addToGroup(decoded.userId, decoded.isAdmin);

    // Handle location update
    socket.on('location_update', async (data) => {
      await this.handleLocationUpdate(decoded.userId, data, socket);
    });

    // Handle get group locations request
    socket.on('get_group_locations', async () => {
      await this.handleGetGroupLocations(decoded.userId, socket);
    });

    // Handle request for all group locations
    socket.on('request_all_locations', async () => {
      await this.handleGetAllGroupLocations(decoded.userId, socket);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.connections.delete(decoded.userId);
      this.removeFromGroup(decoded.userId);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to location tracking service'
    });

    // Automatically send all group locations when user connects
    await this.sendAllGroupLocationsToUser(decoded.userId, socket);
  }

  // Add user to group connections
  async addToGroup(userId, isAdmin) {
    try {
      const user = await User.findById(userId);
      if (user && user.group_id) {
        if (!this.groupConnections.has(user.group_id)) {
          this.groupConnections.set(user.group_id, new Set());
        }
        this.groupConnections.get(user.group_id).add(userId);
      }
    } catch (error) {
      console.error('Error adding user to group:', error);
    }
  }

  // Remove user from group connections
  removeFromGroup(userId) {
    for (const [groupId, userIds] of this.groupConnections.entries()) {
      userIds.delete(userId);
      if (userIds.size === 0) {
        this.groupConnections.delete(groupId);
      }
    }
  }

  // Handle location update
  async handleLocationUpdate(userId, data, socket) {
    try {
      const { latitude, longitude } = data;
      
      if (!latitude || !longitude) {
        socket.emit('error', {
          message: 'Latitude and longitude required'
        });
        return;
      }

      // Save location to database
      await Location.updateLocation(userId, latitude, longitude);

      // Get user's group
      const user = await User.findById(userId);
      if (user && user.group_id) {
        // Get all group members' latest locations
        const allGroupLocations = await Location.getGroupLocations(user.group_id);
        
        // Broadcast all group locations to all group members
        await this.broadcastAllGroupLocations(user.group_id, allGroupLocations);
        
        // Also send individual location update
        await this.broadcastToGroup(user.group_id, {
          type: 'location_update',
          userId: userId,
          latitude: latitude,
          longitude: longitude,
          timestamp: new Date().toISOString()
        });
      }

      socket.emit('location_updated', {
        message: 'Location updated successfully'
      });
    } catch (error) {
      socket.emit('error', {
        message: 'Failed to update location'
      });
    }
  }

  // Handle get group locations request
  async handleGetGroupLocations(userId, socket) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.group_id) {
        socket.emit('error', {
          message: 'User not found or not in a group'
        });
        return;
      }

      const locations = await Location.getGroupLocations(user.group_id);
      
      socket.emit('group_locations', {
        data: locations
      });
    } catch (error) {
      socket.emit('error', {
        message: 'Failed to get group locations'
      });
    }
  }

  // Handle get all group locations request
  async handleGetAllGroupLocations(userId, socket) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.group_id) {
        socket.emit('error', {
          message: 'User not found or not in a group'
        });
        return;
      }

      const locations = await Location.getGroupLocations(user.group_id);
      
      // Send all locations to the requesting user
      socket.emit('all_group_locations', {
        type: 'all_group_locations',
        data: locations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('error', {
        message: 'Failed to get all group locations'
      });
    }
  }

  // Broadcast message to all members of a group
  async broadcastToGroup(groupId, message) {
    const groupMembers = this.groupConnections.get(groupId);
    if (!groupMembers) return;

    for (const userId of groupMembers) {
      const socket = this.connections.get(userId);
      if (socket && socket.connected) {
        try {
          socket.emit(message.type, message);
        } catch (error) {
          console.error(`Error sending message to user ${userId}:`, error);
          this.connections.delete(userId);
          groupMembers.delete(userId);
        }
      }
    }
  }

  // Broadcast all group locations to all group members
  async broadcastAllGroupLocations(groupId, locations) {
    const groupMembers = this.groupConnections.get(groupId);
    if (!groupMembers) return;

    for (const userId of groupMembers) {
      const socket = this.connections.get(userId);
      if (socket && socket.connected) {
        try {
          socket.emit('all_group_locations', {
            type: 'all_group_locations',
            data: locations,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error sending group locations to user ${userId}:`, error);
          this.connections.delete(userId);
          groupMembers.delete(userId);
        }
      }
    }
  }

  // Send all group locations to a specific user
  async sendAllGroupLocationsToUser(userId, socket) {
    try {
      const user = await User.findById(userId);
      if (user && user.group_id) {
        const locations = await Location.getGroupLocations(user.group_id);
        socket.emit('all_group_locations', {
          type: 'all_group_locations',
          data: locations,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending group locations to user:', error);
    }
  }

  // Start periodic location sharing for all groups
  startPeriodicLocationSharing() {
    // Share locations every 30 seconds
    setInterval(async () => {
      await this.shareAllGroupLocations();
    }, 30000);
  }

  // Share all group locations periodically
  async shareAllGroupLocations() {
    try {
      for (const [groupId, userIds] of this.groupConnections.entries()) {
        if (userIds.size > 0) {
          const locations = await Location.getGroupLocations(groupId);
          await this.broadcastAllGroupLocations(groupId, locations);
        }
      }
    } catch (error) {
      console.error('Error in periodic location sharing:', error);
    }
  }

  // Send message to specific user
  sendToUser(userId, event, message) {
    const socket = this.connections.get(userId);
    if (socket && socket.connected) {
      socket.emit(event, message);
    }
  }
}

module.exports = WebSocketService;
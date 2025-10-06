const Location = require('../models/Location');
const User = require('../models/User');
const JWTService = require('../utils/jwtService');

class LocationController {
  // Update user location
  static async updateLocation(req, res) {
    try {
      const { latitude, longitude } = req.body;
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token required'
        });
      }

      const decoded = JWTService.verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }

      await Location.updateLocation(decoded.userId, latitude, longitude);

      return res.json({
        success: true,
        message: 'Location updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Location update failed',
        error: error.message
      });
    }
  }

  // Get latest location of a user
  // static async getLatestLocation(req, res) {
  //   try {
  //     const token = req.headers.authorization?.replace('Bearer ', '');
      
  //     if (!token) {
  //       return res.status(401).json({
  //         success: false,
  //         message: 'Token required'
  //       });
  //     }

  //     const decoded = JWTService.verifyToken(token);
  //     if (!decoded) {
  //       return res.status(401).json({
  //         success: false,
  //         message: 'Invalid token'
  //       });
  //     }

  //     const location = await Location.getLatestLocation(decoded.userId);

  //     return res.json({
  //       success: true,
  //       data: location
  //     });
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: 'Failed to get location',
  //       error: error.message
  //     });
  //   }
  // }

  // Get group locations (for admin)
  static async getGroupLocations(req, res) {
    try {
      const { groupId } = req.body;
      
      const locations = await Location.getGroupLocations(groupId);

      return res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get group locations',
        error: error.message
      });
    }
  }
}

module.exports = LocationController;
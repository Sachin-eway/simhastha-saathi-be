const jwt = require('jsonwebtoken');
require('dotenv').config();

class JWTService {
  static generateToken(userId, isAdmin = false) {
    return jwt.sign(
      { userId, isAdmin },
      process.env.JWT_SECRET || 'your_secret_key_here',
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key_here');
    } catch (error) {
      return null;
    }
  }
}

module.exports = JWTService;

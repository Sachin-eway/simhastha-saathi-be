const db = require('../config/database');

class Location {
  static async updateLocation(userId, latitude, longitude) {
    await db.execute(
      'INSERT INTO locations (user_id, latitude, longitude, created_at) VALUES (?, ?, ?, NOW())',
      [userId, latitude, longitude]
    );
  }

  static async getLatestLocation(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM locations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return rows[0];
  }

  static async getGroupLocations(groupId) {
    const [rows] = await db.execute(
      `SELECT u.id, u.full_name, l.latitude, l.longitude, l.created_at 
       FROM users u 
       LEFT JOIN locations l ON u.id = l.user_id 
       WHERE u.group_id = ? AND l.id IS NOT NULL
       ORDER BY l.created_at DESC`,
      [groupId]
    );
    return rows;
  }
}

module.exports = Location;

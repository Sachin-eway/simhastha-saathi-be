const db = require('../config/database');

class Location {
  static async updateLocation(userId, latitude, longitude) {
    // if location already exists for the user, update it
    
    try {
      const [rows] = await db.execute(
        'SELECT * FROM locations WHERE user_id = ?',
        [userId]
      );
      if (rows.length > 0) {
        await db.execute(
          'UPDATE locations SET latitude = ?, longitude = ?, created_at = NOW() WHERE user_id = ?',
          [latitude, longitude, userId]
        );
      } else {
        await db.execute(
          'INSERT INTO locations (user_id, latitude, longitude, created_at) VALUES (?, ?, ?, NOW())',
          [userId, latitude, longitude]
        );
      }
    } catch (error) {
      throw new Error(`Failed to update location: ${error.message}`);
    }
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
      `SELECT u.id, u.full_name , u.is_admin, l.latitude, l.longitude, l.created_at 
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

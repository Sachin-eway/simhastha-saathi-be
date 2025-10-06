const db = require('../config/database');

class SOSAlert {
  static async create({ userId, groupId }) {
    const [result] = await db.execute(
      'INSERT INTO sos_alerts (user_id, group_id, created_at) VALUES (?, ?, NOW())',
      [userId, groupId]
    );
    return result.insertId;
  }

  static async getByGroup(groupId, limit = 50) {
    const [rows] = await db.execute(
      `SELECT sa.id, sa.user_id, sa.group_id, sa.created_at,
              u.full_name, u.mobile_number
       FROM sos_alerts sa
       LEFT JOIN users u ON sa.user_id = u.id
       WHERE sa.group_id = ?
       ORDER BY sa.created_at DESC
       LIMIT ?`,
      [groupId, limit]
    );
    return rows;
  }
}

module.exports = SOSAlert;



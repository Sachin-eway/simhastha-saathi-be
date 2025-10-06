const db = require('../config/database');

class Alert {
  static async create(alertData) {
    const { userId, alertType, groupId } = alertData;
    const [result] = await db.execute(
      'INSERT INTO alerts (user_id, alert_type, seen, group_id) VALUES (?, ?, ?, ?)',
      [userId, alertType, false, groupId]
    );
    return result.insertId;
  }

  static async findByGroupId(groupId) {
    const [rows] = await db.execute(
      'SELECT * FROM alerts WHERE group_id = ?',
      [groupId]
    );
    return rows;
  }
}

module.exports = Alert;
const db = require('../config/database');

class Group {
  static async create() {
    const [result] = await db.execute(
      'INSERT INTO groups (created_at) VALUES (NOW())',
      []
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM groups WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getGroupMembers(groupId) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE group_id = ?',
      [groupId]
    );
    return rows;
  }
}

module.exports = Group;

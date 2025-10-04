const db = require('../config/database');

class Group {
  static async create() {
    console.log("create group");
    try {
  // Get next auto_increment value
      const [rows] = await db.execute(`
        SELECT AUTO_INCREMENT 
        FROM information_schema.tables 
        WHERE table_name = 'groups' AND table_schema = DATABASE()
      `);
      const nextId = rows[0].AUTO_INCREMENT;

      const [result] = await db.execute(
        'INSERT INTO groups (group_id, created_at) VALUES (?, NOW())',
        [`GR${String(nextId).padStart(5, '0')}`]
      );

      return `GR${String(nextId).padStart(5, '0')}`;
    } catch (error) {
      console.log(error,"error");
      return null;
    }
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

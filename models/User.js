const db = require('../config/database');

class User {
  static async create(userData) {
    const { fullName, mobileNumber, age } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (full_name, mobile_number, age, is_admin, created_at) VALUES (?, ?, ?, ?, NOW())',
      [fullName, mobileNumber, age, true]
    );
    return result.insertId;
  }

  static async findByMobile(mobileNumber) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE mobile_number = ?',
      [mobileNumber]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updateOtp(id, otp) {
    await db.execute(
      'UPDATE users SET otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?',
      [otp, id]
    );
  }

  static async verifyOtp(id, otp) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ? AND otp = ? AND otp_expires_at > NOW()',
      [id, otp]
    );
    return rows[0];
  }

  static async markVerified(id) {
    await db.execute(
      'UPDATE users SET is_verified = true, otp = NULL, otp_expires_at = NULL WHERE id = ?',
      [id]
    );
  }

  static async getGroupMembers(groupId) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE group_id = ? AND is_admin = false',
      [groupId]
    );
    return rows;
  }
}

module.exports = User;

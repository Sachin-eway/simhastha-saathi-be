const db = require('../config/database');

class Member {
  static async create(memberData) {
    const { fullName, mobileNumber, age, groupId } = memberData;
    const [result] = await db.execute(
      'INSERT INTO users (full_name, mobile_number, age, group_id, is_admin, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [fullName, mobileNumber, age, groupId, false]
    );
    return result.insertId;
  }

  static async findByMobile(mobileNumber) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE mobile_number = ? AND is_admin = false',
      [mobileNumber]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ? AND is_admin = false',
      [id]
    );
    return rows[0];
  }

  static async updateOtp(id, otp) {
    await db.execute(
      'UPDATE users SET otp = ?, otp_expires_at = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?',
      [id, otp]
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
}

module.exports = Member;

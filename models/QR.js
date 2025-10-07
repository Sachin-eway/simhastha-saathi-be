const db = require('../config/database');

class QR {
  // Create a new QR code - optimized for bulk inserts
  static async create() {
    try {
      const [result] = await db.execute(
        'INSERT INTO qr_codes () VALUES ()'
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Failed to create QR code: ${error.message}`);
    }
  }

  // Optimized method: getQRWithUser
  static async getQRWithUser(qrId) {
    try {
      const [rows] = await db.execute(
        `SELECT 
           qr.id, qr.created_at, 
           qr.member_id IS NOT NULL AS isBound,
           u.id AS userId, u.full_name, u.group_id, u.age, u.emergency_contact, u.address
         FROM qr_codes qr
         LEFT JOIN qr_users u ON qr.member_id = u.id
         WHERE qr.id = ? LIMIT 1`,
        [qrId]
      );
  
      if (!rows[0]) return null;
  
      const qr = rows[0];
      return {
        id: qr.id,
        createdAt: qr.created_at,
        isBound: qr.isBound,
        user: qr.userId
          ? {
              id: qr.userId,
              fullName: qr.full_name,
              groupId: qr.group_id,
              age: qr.age,
              emergencyContact: qr.emergency_contact,
              address: qr.address
            }
          : null,
      };
    } catch (error) {
      throw new Error(`Failed to get QR with user: ${error.message}`);
    }
  }
  
  

  // Get QR code by ID - optimized with primary key lookup
  static async findById(qrId) {
    try {
      const [rows] = await db.execute(
        'SELECT id, member_id, created_at FROM qr_codes WHERE id = ? LIMIT 1',
        [qrId]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to find QR code: ${error.message}`);
    }
  }

  static async bindUser(qrData) {
    try {
      const { qrId, groupId, fullName, age, emergencyContact, address } = qrData;
  
      // Create user first
      const [memberResult] = await db.execute(
        'INSERT INTO qr_users (group_id, full_name, age, emergency_contact, address) VALUES (?, ?, ?, ?, ?)',
        [groupId, fullName, age, emergencyContact, address]
      );
  
      if (!memberResult || !memberResult.insertId) {
        return false;
      }
  
      // Then update qr_codes table to bind user
      const [updateResult] = await db.execute(
        'UPDATE qr_codes SET member_id = ? WHERE id = ? AND member_id IS NULL',
        [memberResult.insertId, qrId]
      );
  
      // Check if update affected any row i.e. binding successful
      if (!updateResult || updateResult.affectedRows === 0) {
        return false;
      }
  
      return memberResult.insertId;
    } catch (error) {
      throw new Error(`Failed to bind user to QR: ${error.message}`);
    }
  }
  


  // Check if QR is bound - optimized single field check
  static async isBound(qrId) {
    try {
      const [rows] = await db.execute(
        'SELECT user_id FROM qr_codes WHERE id = ? LIMIT 1',
        [qrId]
      );
      return rows[0] ? !!rows[0].user_id : false;
    } catch (error) {
      throw new Error(`Failed to check if QR is bound: ${error.message}`);
    }
  }

  // Get QR statistics - optimized with COUNT queries
  static async getStats() {
    try {
      const [totalResult] = await db.execute('SELECT COUNT(*) as total FROM qr_codes');
      const [boundResult] = await db.execute('SELECT COUNT(*) as bound FROM qr_codes WHERE user_id IS NOT NULL');
      const [recentResult] = await db.execute(
        'SELECT COUNT(*) as recent FROM qr_codes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      );
      
      return {
        total: totalResult[0].total,
        bound: boundResult[0].bound,
        unbound: totalResult[0].total - boundResult[0].bound,
        recent: recentResult[0].recent
      };
    } catch (error) {
      throw new Error(`Failed to get QR stats: ${error.message}`);
    }
  }

  // Get QRs with pagination - optimized for large datasets
  static async getQRsWithPagination(page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      
      const [rows] = await db.execute(
        `SELECT qr.id, qr.user_id, qr.created_at,
                u.full_name, u.mobile_number, u.group_id
         FROM qr_codes qr
         LEFT JOIN users u ON qr.user_id = u.id
         ORDER BY qr.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Failed to get QRs with pagination: ${error.message}`);
    }
  }

  // Unbind user from QR - optimized single field update
  static async unbindUser(qrId) {
    try {
      const [result] = await db.execute(
        'UPDATE qr_codes SET user_id = NULL WHERE id = ?',
        [qrId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to unbind user: ${error.message}`);
    }
  }

  // Bulk create QRs - optimized for mass generation
  static async bulkCreate(count = 1000) {
    try {
      const values = Array(count).fill('()').join(', ');
      const [result] = await db.execute(
        `INSERT INTO qr_codes () VALUES ${values}`
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Failed to bulk create QRs: ${error.message}`);
    }
  }

  // Get QRs by user - optimized with index
  static async getQRsByUser(userId, limit = 10) {
    try {
      const [rows] = await db.execute(
        `SELECT id, created_at FROM qr_codes 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      throw new Error(`Failed to get QRs by user: ${error.message}`);
    }
  }

  // Search QRs - optimized with full-text search
  static async searchQRs(searchTerm, limit = 20) {
    try {
      const [rows] = await db.execute(
        `SELECT qr.id, qr.user_id, qr.created_at,
                u.full_name, u.mobile_number
         FROM qr_codes qr
         LEFT JOIN users u ON qr.user_id = u.id
         WHERE qr.id LIKE ? OR u.full_name LIKE ? OR u.mobile_number LIKE ?
         ORDER BY qr.created_at DESC
         LIMIT ?`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit]
      );
      return rows;
    } catch (error) {
      throw new Error(`Failed to search QRs: ${error.message}`);
    }
  }

  static async getMemberByGroupId(groupId) {
    const [rows] = await db.execute(
      'SELECT * FROM qr_users WHERE group_id = ?',
      [groupId]
    );
    return rows[0];
  }

  // Generate bulk QR codes and return their details for PDF generation
  static async generateBulkQRsForPDF(count = 6) {
    try {
      // Generate QR codes
      const qrIds = [];
      for (let i = 0; i < count; i++) {
        const qrId = await QR.create();
        qrIds.push(qrId);
      }
      
      // Get all generated QR codes with their details
      const placeholders = qrIds.map(() => '?').join(',');
      const [rows] = await db.execute(
        `SELECT id, created_at FROM qr_codes WHERE id IN (${placeholders}) ORDER BY id`,
        qrIds
      );
      
      return rows;
    } catch (error) {
      throw new Error(`Failed to generate bulk QRs for PDF: ${error.message}`);
    }
  }
}

module.exports = QR;

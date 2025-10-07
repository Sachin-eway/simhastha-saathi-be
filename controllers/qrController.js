const QR = require('../models/QR');
const User = require('../models/User');
const PDFService = require('../services/pdfService');

class QRController {
  // Generate a new QR code - optimized
  static async generateQR(req, res) {
    try {
      const qrId = await QR.create();
      
      return res.json({
        success: true,
        message: 'QR code generated successfully',
        data: {
          qrId,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: error.message
      });
    }
  }

  // Bulk generate QR codes - optimized for mass generation
  static async bulkGenerateQR(req, res) {
    try {
      const { count = 1000 } = req.body;
      
      if (count > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 10,000 QRs can be generated at once'
        });
      }

      const createdCount = await QR.bulkCreate(count);
      
      return res.json({
        success: true,
        message: `${createdCount} QR codes generated successfully`,
        data: { createdCount }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to bulk generate QR codes',
        error: error.message
      });
    }
  }

  // Bind user to QR code - simplified and optimized
  static async bindUser(req, res) {
    try {
      const { qrId, userId } = req.body;
  
      // Validate QR ID
      if (!qrId) {
        return res.status(400).json({
          success: false,
          message: 'QR ID is required'
        });
      }
  
      // Check if QR exists
      const qr = await QR.findById(qrId);
      if (!qr) {
        return res.status(404).json({
          success: false,
          message: 'QR code not found'
        });
      }
  
      // Check if QR is already bound to a user
      if (qr.member_id) {  // Assuming qr has member_id field for bound user
        return res.status(400).json({
          success: false,
          message: 'QR code is already bound to a user'
        });
      }
  
      // Bind user to QR (calls model method)
      const bindResult = await QR.bindUser(req.body);
  
      if (!bindResult) {
        return res.status(400).json({
          success: false,
          message: 'Failed to bind user to QR code'
        });
      }
  
      return res.json({
        success: true,
        message: 'User bound to QR code successfully',
        data: { qrId, userId: bindResult }
      });
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to bind user to QR',
        error: error.message
      });
    }
  }
  

  // Scan QR code and get user details - optimized
  static async scanQR(req, res) {
    try {
      const { qrId } = req.params;

      // Get QR with user details - single optimized query
      const qrData = await QR.getQRWithUser(qrId);
      
      if (!qrData) {
        return res.status(404).json({
          success: false,
          message: 'QR code not found'
        });
      }

      if (!qrData.isBound) {
        return res.json({
          success: true,
          message: 'QR code is not bound to any user',
          data: {
            qrId: qrData.id,
            isBound: false,
            createdAt: qrData.createdAt
          }
        });
      }

      // Return user details
      return res.json({
        success: true,
        message: 'User details retrieved successfully',
        data: {
          qrId: qrData.id,
          isBound: true,
          user: qrData.user,
          createdAt: qrData.createdAt
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to scan QR code',
        error: error.message
      });
    }
  }

  // Get QRs with pagination - optimized for large datasets
  static async getQRs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 per page
      
      const qrs = await QR.getQRsWithPagination(page, limit);
      
      return res.json({
        success: true,
        message: 'QR codes retrieved successfully',
        data: {
          qrs,
          pagination: {
            page,
            limit,
            hasMore: qrs.length === limit
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get QR codes',
        error: error.message
      });
    }
  }

  // Search QRs - optimized with indexes
  static async searchQRs(req, res) {
    try {
      const { q } = req.query;
      const limit = Math.min(parseInt(req.query.limit) || 20, 50);
      
      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search term must be at least 2 characters'
        });
      }

      const qrs = await QR.searchQRs(q, limit);
      
      return res.json({
        success: true,
        message: 'QR search completed',
        data: qrs
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to search QR codes',
        error: error.message
      });
    }
  }

  // Get user's QRs - optimized
  static async getUserQRs(req, res) {
    try {
      const userId = req.user.id;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      
      const qrs = await QR.getQRsByUser(userId, limit);
      
      return res.json({
        success: true,
        message: 'User QR codes retrieved successfully',
        data: qrs
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get user QR codes',
        error: error.message
      });
    }
  }

  // Unbind user from QR - optimized
  static async unbindUser(req, res) {
    try {
      const { qrId } = req.params;

      // Check if QR exists
      const qr = await QR.findById(qrId);
      if (!qr) {
        return res.status(404).json({
          success: false,
          message: 'QR code not found'
        });
      }

      // Check if QR is bound
      if (!qr.user_id) {
        return res.status(400).json({
          success: false,
          message: 'QR code is not bound to any user'
        });
      }

      // Unbind user
      const success = await QR.unbindUser(qrId);
      
      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Failed to unbind user from QR code'
        });
      }

      return res.json({
        success: true,
        message: 'User unbound from QR code successfully',
        data: { qrId }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to unbind user',
        error: error.message
      });
    }
  }

  // Get QR statistics - optimized with COUNT queries
  static async getQRStats(req, res) {
    try {
      const stats = await QR.getStats();
      
      return res.json({
        success: true,
        message: 'QR statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to get QR statistics',
        error: error.message
      });
    }
  }

  // Generate bulk QR codes and download as PDF
  static async generateBulkQRPDF(req, res) {
    try {
      const { quantity = 6 } = req.body;
      
      // Validate quantity
      if (quantity < 1 || quantity > 1000) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be between 1 and 1000'
        });
      }

      // Generate QR codes
      const qrData = await QR.generateBulkQRsForPDF(quantity);
      
      if (!qrData || qrData.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate QR codes'
        });
      }

      // Generate and send PDF
      await PDFService.generateQRPDF(qrData, res);

    } catch (error) {
      console.error('Bulk QR PDF generation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR PDF',
        error: error.message
      });
    }
  }

  // Generate single QR code as image
  static async generateQRImage(req, res) {
    try {
      const { qrId } = req.params;
      const { size = 200 } = req.query;

      // Validate QR ID
      if (!qrId) {
        return res.status(400).json({
          success: false,
          message: 'QR ID is required'
        });
      }

      // Check if QR exists
      const qr = await QR.findById(qrId);
      if (!qr) {
        return res.status(404).json({
          success: false,
          message: 'QR code not found'
        });
      }

      // Generate QR code as data URL
      const qrDataURL = await PDFService.generateQRDataURL(qrId, {
        width: parseInt(size)
      });

      // Return QR code as image
      const base64Data = qrDataURL.split(',')[1];
      const imgBuffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="qr-${qrId}.png"`);
      res.send(imgBuffer);

    } catch (error) {
      console.error('QR image generation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR image',
        error: error.message
      });
    }
  }
}

module.exports = QRController;

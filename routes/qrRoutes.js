const express = require('express');
const router = express.Router();
const QRController = require('../controllers/qrController');
const { authenticateToken, requireAdmin, rateLimit } = require('../middleware/auth');

// Generate new QR code (admin only)
router.post('/generate', authenticateToken, requireAdmin, QRController.generateQR);

// Bulk generate QR codes (admin only)
router.post('/bulk-generate', authenticateToken, requireAdmin, QRController.bulkGenerateQR);

// Bind user to QR code (authenticated user)
router.post('/bind', authenticateToken, QRController.bindUser);

// Scan QR code and get user details (public)
router.get('/scan/:qrId', QRController.scanQR);

// Get QRs with pagination (admin only)
router.get('/', authenticateToken, requireAdmin, QRController.getQRs);

// Search QRs (admin only)
router.get('/search', authenticateToken, requireAdmin, QRController.searchQRs);

// Get user's QRs (authenticated user)
router.get('/my-qrs', authenticateToken, QRController.getUserQRs);

// Unbind user from QR (admin only)
router.delete('/unbind/:qrId', authenticateToken, requireAdmin, QRController.unbindUser);

// Get QR statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, QRController.getQRStats);

// Generate bulk QR codes and download as PDF (admin only)
router.post('/generate-pdf', authenticateToken, QRController.generateBulkQRPDF);

// Generate single QR code as image (public)
router.get('/image/:qrId', QRController.generateQRImage);

module.exports = router;

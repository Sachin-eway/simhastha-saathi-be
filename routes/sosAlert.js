const express = require('express');
const sosAlertRoutes = express.Router();
const SosAlertController = require('../controllers/sosAlertController');
const { authenticateToken, requireAdmin, rateLimit } = require('../middleware/auth');

// Generate new QR code (admin only)
sosAlertRoutes.post('/send-alert', authenticateToken, SosAlertController.sendAlert);
// Get alerts (admin only)
sosAlertRoutes.post('/get-alerts', authenticateToken, SosAlertController.getAlerts);



module.exports = sosAlertRoutes;

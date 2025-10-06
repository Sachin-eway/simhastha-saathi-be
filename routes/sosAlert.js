const express = require('express');
const sosAlertRoutes = express.Router();
const SosAlertController = require('../controllers/sosAlertController');
const { authenticateToken, corsMiddleware } = require('../middleware/auth');

// Apply CORS middleware to all auth routes
sosAlertRoutes.use(corsMiddleware);

// Generate new QR code (admin only)
sosAlertRoutes.post('/send-alert', authenticateToken, SosAlertController.sendAlert);
// Get alerts (admin only)
sosAlertRoutes.post('/get-alerts', authenticateToken, SosAlertController.getAlerts);



module.exports = sosAlertRoutes;

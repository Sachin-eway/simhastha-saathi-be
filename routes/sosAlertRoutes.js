const express = require('express');
const router = express.Router();
const SOSAlertController = require('../controllers/sosAlertController');
const { authenticateToken, corsMiddleware } = require('../middleware/auth');

// Apply CORS middleware
router.use(corsMiddleware);

// Send SOS alert
router.post('/send-alert', authenticateToken, SOSAlertController.sendAlert);

// Get SOS alerts for a group
router.post('/get-alerts', authenticateToken, SOSAlertController.getAlerts);

module.exports = router;



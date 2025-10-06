const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Update location (authenticated users only)
router.post('/update', authenticateToken, LocationController.updateLocation);

// Get latest location (authenticated users only)
// router.get('/latest', authenticateToken, LocationController.getLatestLocation);

// Get group locations (admin only)
router.post('/group', authenticateToken, LocationController.getGroupLocations);

module.exports = router;

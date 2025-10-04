const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const { authenticateToken, requireAdmin, rateLimit } = require('../middleware/auth');

// Apply rate limiting to location routes
router.use(rateLimit(100, 60 * 1000)); // 100 requests per minute

// Update location (authenticated users only)
router.post('/update', authenticateToken, LocationController.updateLocation);

// Get latest location (authenticated users only)
router.get('/latest', authenticateToken, LocationController.getLatestLocation);

// Get group locations (admin only)
router.get('/group', authenticateToken, requireAdmin, LocationController.getGroupLocations);

module.exports = router;

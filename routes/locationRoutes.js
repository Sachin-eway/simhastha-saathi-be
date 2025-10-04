const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');

// Update location
router.post('/update', LocationController.updateLocation);

// Get latest location
router.get('/latest', LocationController.getLatestLocation);

// Get group locations (admin only)
router.get('/group', LocationController.getGroupLocations);

module.exports = router;

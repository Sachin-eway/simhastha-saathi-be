const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { rateLimit, corsMiddleware } = require('../middleware/auth');

// Apply CORS middleware to all auth routes
router.use(corsMiddleware);

// Apply rate limiting to auth routes
router.use(rateLimit(10, 15 * 60 * 1000)); // 10 requests per 15 minutes

// User registration (Admin)
router.post('/register-user', AuthController.registerUser);

// Member registration
router.post('/register-member', AuthController.registerMember);

// User login
router.post('/login-user', AuthController.loginUser);

// Member login
router.post('/login-member', AuthController.loginMember);

// OTP verification
router.post('/verify-otp', AuthController.verifyOTP);

module.exports = router;

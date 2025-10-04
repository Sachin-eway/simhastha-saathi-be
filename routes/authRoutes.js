const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

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

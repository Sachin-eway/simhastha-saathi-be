const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { corsMiddleware } = require('../middleware/auth');

// Apply CORS middleware to all auth routes
router.use(corsMiddleware);

// User registration (Admin)
router.post('/register-user', AuthController.registerUser);

router.post('/register-ofline-user', AuthController.registerOfflineUser);

// Member registration
// router.post('/register-member', AuthController.registerMember);

//create group
router.post('/create-group', AuthController.createGroup);

//join-existing-group
router.post('/join-existing-group', AuthController.joinExistingGroup);

// User login
router.post('/login-user', AuthController.loginUser);

// Member login
// router.post('/login-member', AuthController.loginMember);

// OTP verification
router.post('/verify-otp', AuthController.verifyOTP);

// Get group users
router.post('/get-group-users', AuthController.getGroupUsers);

module.exports = router;

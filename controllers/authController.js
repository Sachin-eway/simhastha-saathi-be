const User = require('../models/User');
const Member = require('../models/Member');
const Group = require('../models/Group');
const OTPService = require('../utils/otpService');
const JWTService = require('../utils/jwtService');

class AuthController {
  // User registration (Admin)
  static async registerUser(req, res) {
    try {
      const { fullName, mobileNumber, age } = req.body;

      // Check if user already exists
      const existingUser = await User.findByMobile(mobileNumber);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this mobile number'
        });
      }

      // Create group first
      const groupId = await Group.create();

      // Create user
      const userId = await User.create({
        fullName,
        mobileNumber,
        age,
        groupId
      });

      // Generate and send OTP
      // const otp = OTPService.generateOTP();
      const otp = 123456;
      await User.updateOtp(userId, otp);
      await OTPService.sendOTP(mobileNumber, otp);

      return res.json({
        success: true,
        message: 'User registered successfully. OTP sent to mobile number.',
        data: { userId, groupId }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  // Member registration
  static async registerMember(req, res) {
    try {
      const { fullName, mobileNumber, age, groupId } = req.body;

      // Check if group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(400).json({
          success: false,
          message: 'Invalid group ID'
        });
      }

      // Check if member already exists
      const existingMember = await Member.findByMobile(mobileNumber);
      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'Member already exists with this mobile number'
        });
      }

      // Create member
      const memberId = await Member.create({
        fullName,
        mobileNumber,
        age,
        groupId
      });

      // Generate and send OTP
      const otp = OTPService.generateOTP();
      await Member.updateOtp(memberId, otp);
      await OTPService.sendOTP(mobileNumber, otp);

      return res.json({
        success: true,
        message: 'Member registered successfully. OTP sent to mobile number.',
        data: { memberId, groupId }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Member registration failed',
        error: error.message
      });
    }
  }

  // User login
  static async loginUser(req, res) {
    try {
      const { mobileNumber } = req.body;

      const user = await User.findByMobile(mobileNumber);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'User not verified. Please verify OTP first.'
        });
      }

      const token = JWTService.generateToken(user.id, true);
      const groupMembers = await User.getGroupMembers(user.group_id);

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            fullName: user.full_name,
            mobileNumber: user.mobile_number,
            age: user.age,
            groupId: user.group_id,
            isAdmin: true
          },
          groupMembers
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Login member
  static async loginMember(req, res) {
    try {
      const { mobileNumber } = req.body;

      const member = await Member.findByMobile(mobileNumber);
      if (!member) {
        return res.status(400).json({
          success: false,
          message: 'Member not found'
        });
      }

      if (!member.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'Member not verified. Please verify OTP first.'
        });
      }

      const token = JWTService.generateToken(member.id, false);

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          member: {
            id: member.id,
            fullName: member.full_name,
            mobileNumber: member.mobile_number,
            age: member.age,
            groupId: member.group_id,
            isAdmin: false
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Verify OTP
  static async verifyOTP(req, res) {
    try {
      const { userId, otp, userType } = req.body;

      let user;
      if (userType === 'admin') {
        user = await User.verifyOtp(userId, otp);
      } else {
        user = await Member.verifyOtp(userId, otp);
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
      }

      // Mark user as verified
      if (userType === 'admin') {
        await User.markVerified(userId);
      } else {
        await Member.markVerified(userId);
      }
      user.token = JWTService.generateToken(user.id, userType === 'admin');
       
      return res.json({
        success: true,
        message: 'OTP verified successfully',
        user
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'OTP verification failed',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;
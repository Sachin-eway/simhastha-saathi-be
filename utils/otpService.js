const nodemailer = require('nodemailer');
require('dotenv').config();

class OTPService {
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(mobileNumber, otp) {
    // For demo purposes, we'll just log the OTP
    // In production, you would integrate with SMS service like Twilio
    console.log(`OTP for ${mobileNumber}: ${otp}`);
    
    // Email OTP (optional)
    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: `${mobileNumber}@example.com`, // This is just for demo
        subject: 'Your OTP for Simhastha Saathi',
        text: `Your OTP is: ${otp}. Valid for 10 minutes.`
      });
    } catch (error) {
      console.log('Email sending failed:', error.message);
    }
  }
}

module.exports = OTPService;

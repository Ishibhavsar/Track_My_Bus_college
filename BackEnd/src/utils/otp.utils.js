const OTP = require('../models/OTP.model');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPViaSMS = async (phone, otp) => {
  try {
    // In production, integrate with SMS service like Twilio
    // For development, just log the OTP
    console.log(`✅ SMS sent to ${phone}: ${otp}`);
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
    console.log(`📱 SMS OTP (Fallback) to ${phone}: ${otp}`);
  }
};

const createOTP = async (phone, purpose) => {
  const otp = generateOTP();
  const otpRecord = new OTP({
    phone,
    code: otp,
    purpose,
  });

  await otpRecord.save();
  await sendOTPViaSMS(phone, otp);

  return otp;
};

const verifyOTP = async (phone, code) => {
  const query = { isUsed: false, code, phone };

  const otpRecord = await OTP.findOne(query);

  if (!otpRecord) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }

  otpRecord.isUsed = true;
  await otpRecord.save();

  return { valid: true, message: 'OTP verified' };
};

module.exports = { createOTP, verifyOTP };

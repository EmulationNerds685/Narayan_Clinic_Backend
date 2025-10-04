// src/controllers/otpController.js
import Otp from '../models/otp.js';
import { generateOtp } from '../utils/otpHelper.js';
import { sendOtpEmail } from '../utils/emailService.js';

export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const otp = generateOtp();

  try {
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, expiresAt: new Date(Date.now() + 5 * 60000) }, // 5 minutes expiry
      { upsert: true, new: true }
    );
    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
  try {
    const record = await Otp.findOne({ email, otp });
    if (!record || record.expiresAt < new Date()) {
      await Otp.deleteOne({ email }); // Clean up expired or invalid attempts
      return res.status(400).json({ error: record ? "OTP expired" : "Invalid OTP" });
    }
    await Otp.deleteOne({ email }); // Clean up after success
    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("❌ OTP verification error:", err);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};
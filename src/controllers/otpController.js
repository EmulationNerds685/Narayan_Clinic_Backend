import Otp from '../models/otp.js';
import { generateOtp } from '../utils/otpHelper.js';
import { sendOtpEmail } from '../utils/emailService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * @desc    Sends OTP for email verification
 * @route   POST /api/otp/send
 * @access  Public
 */
export const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const otp = generateOtp();

  const record = await Otp.findOneAndUpdate(
    { email },
    { email, otp, expiresAt: new Date(Date.now() + 5 * 60000) }, // 5 minutes expiry
    { upsert: true, new: true }
  );

  if (!record) {
    throw new ApiError(500, "Failed to create OTP record");
  }

  await sendOtpEmail(email, otp);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully"));
});

/**
 * @desc    Verifies the email OTP
 * @route   POST /api/otp/verify
 * @access  Public
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const record = await Otp.findOne({ email, otp });

  if (!record || record.expiresAt < new Date()) {
    if (record) {
      await Otp.deleteOne({ email }); // Clean up expired record
    }
    throw new ApiError(400, record ? "OTP expired" : "Invalid OTP");
  }

  await Otp.deleteOne({ email }); // Clean up after success

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP verified successfully"));
});
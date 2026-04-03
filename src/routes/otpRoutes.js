import express from 'express';
import { sendOTP, verifyOTP } from '../controllers/otpController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { sendOtpSchema, verifyOtpSchema } from '../validations/otpValidation.js';

const router = express.Router();

router.post('/send', validate(sendOtpSchema), sendOTP);
router.post('/verify', validate(verifyOtpSchema), verifyOTP);

export default router;
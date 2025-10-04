// src/utils/emailService.js
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(to, name, appointmentDate, timeSlot, service) {
  try {
    await resend.emails.send({
      from: 'Appointments@narayanheartandmaternitycentre.com',
      to: `${to}`,
      subject: 'Appointment Confirmation',
      html: `
        <p>Dear ${name},</p>
        <p>We are pleased to confirm your appointment at <strong>Narayan Heart & Maternity Centre</strong>.</p>
        <ul>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${timeSlot}</li>
          <li><strong>Service:</strong> ${service}</li>
        </ul>
        <p>We look forward to seeing you.</p>
        <p>Warm regards,<br/>The Narayan Heart & Maternity Centre Team</p>
      `,
    });
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw error;
  }
}

export async function sendOtpEmail(to, otp) {
  try {
    await resend.emails.send({
      from: 'verify@narayanheartandmaternitycentre.com',
      to,
      subject: 'Your OTP for Email Verification',
      html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
    });
  } catch (error) {
    console.error("❌ OTP Email Send Error:", error);
    throw error;
  }
}
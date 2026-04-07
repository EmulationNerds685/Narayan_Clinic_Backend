import { Resend } from 'resend';

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is not defined in environment variables");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

// Initialize resend only when needed or at least check key
const resend = getResendClient();


export async function sendConfirmationEmail(to, name, appointmentDate, timeSlot, service) {
  if (!resend) {
    console.error("❌ Email client not initialized. Check your RESEND_API_KEY.");
    return;
  }
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
  if (!resend) {
    console.error("❌ Email client not initialized. Check your RESEND_API_KEY.");
    return;
  }
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

export async function sendClinicNotificationEmail(patientName, appointmentDate, timeSlot, service, phone) {
  if (!resend) {
    console.error("❌ Email client not initialized. Check your RESEND_API_KEY.");
    return;
  }
  try {
    await resend.emails.send({
      from: 'Notifications@narayanheartandmaternitycentre.com',
      to: 'narayanheartmaternitycentre@gmail.com',
      subject: `New Appointment: ${patientName}`,
      html: `
        <h3>New Appointment Booked</h3>
        <p>A new appointment has been scheduled at the clinic.</p>
        <ul>
          <li><strong>Patient:</strong> ${patientName}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Date:</strong> ${appointmentDate}</li>
          <li><strong>Time:</strong> ${timeSlot}</li>
          <li><strong>Service:</strong> ${service}</li>
        </ul>
        <p>Please check the admin panel for more details.</p>
      `,
    });
  } catch (error) {
    console.error('❌ Clinic Notification Email error:', error);
  }
}
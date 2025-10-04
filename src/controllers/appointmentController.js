import Appointment from '../models/appointment.js';
import { sendConfirmationEmail } from '../utils/emailService.js';
import { getNextPatientNumber } from '../utils/appointmentHelper.js';
export const bookAppointment = async (req, res) => {
  try {
    const { name, email, ph_number, address, service, appointment_date, appointment_time } = req.body;
    const patientNumber = await getNextPatientNumber();

    const newAppointment = new Appointment({
      name,
      email,
      ph_number,
      address,
      service,
      appointment_date,
      appointment_time,
      patient_number: patientNumber,
    });

    await newAppointment.save();
    await sendConfirmationEmail(email, name, appointment_date, appointment_time, service);

    res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Failed to book appointment' });
  }
};
export const getAppointments = async (req, res) => {
  try {

    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};
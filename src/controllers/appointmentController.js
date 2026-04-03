import Appointment from '../models/appointment.js';
import { sendConfirmationEmail } from '../utils/emailService.js';
import { getNextPatientNumber } from '../utils/appointmentHelper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * @desc    Books a new doctor's appointment
 * @route   POST /api/appointments/book
 * @access  Public
 */
export const bookAppointment = asyncHandler(async (req, res) => {
    const { name, email, ph_number, address, service, appointment_date, appointment_time } = req.body;
    
    const patientNumber = await getNextPatientNumber();

    const newAppointment = await Appointment.create({
        name,
        email,
        ph_number,
        address,
        service,
        appointment_date,
        appointment_time,
        patient_number: patientNumber,
    });

    if (!newAppointment) {
        throw new ApiError(500, "Failed to book appointment");
    }

    await sendConfirmationEmail(email, name, appointment_date, appointment_time, service);

    return res
        .status(201)
        .json(new ApiResponse(201, newAppointment, "Appointment booked successfully"));
});

/**
 * @desc    Retrieves all doctor's appointments
 * @route   GET /api/appointments/
 * @access  Private (Admin)
 */
export const getAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, appointments, "Appointments fetched successfully"));
});
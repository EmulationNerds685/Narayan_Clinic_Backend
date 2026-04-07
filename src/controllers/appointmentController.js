import Appointment from '../models/appointment.js';
import { sendConfirmationEmail, sendClinicNotificationEmail } from '../utils/emailService.js';
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
        status: 'Pending'
    });

    if (!newAppointment) {
        throw new ApiError(500, "Failed to book appointment");
    }

    // Send confirmation to patient
    await sendConfirmationEmail(email, name, appointment_date, appointment_time, service);
    
    // Notify clinic staff
    await sendClinicNotificationEmail(name, appointment_date, appointment_time, service, ph_number);

    return res
        .status(201)
        .json(new ApiResponse(201, newAppointment, "Appointment booked successfully"));
});

/**
 * @desc    Retrieves filtered doctor's appointments
 * @route   GET /api/appointments/
 * @access  Private (Admin)
 */
export const getAppointments = asyncHandler(async (req, res) => {
    const { search, service, date, status } = req.query;
    
    let query = {};
    
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { ph_number: { $regex: search, $options: 'i' } }
        ];
    }
    
    if (service && service !== 'All') query.service = service;
    if (date) query.appointment_date = date;
    if (status && status !== 'All') query.status = status;

    const appointments = await Appointment.find(query).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, appointments, "Appointments fetched successfully"));
});

/**
 * @desc    Updates appointment status
 * @route   PATCH /api/appointments/:id/status
 * @access  Private (Admin)
 */
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true }
    );

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, appointment, "Status updated successfully"));
});

/**
 * @desc    Deletes an appointment
 * @route   DELETE /api/appointments/:id
 * @access  Private (Admin)
 */
export const deleteAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Appointment deleted successfully"));
});

/**
 * @desc    Generates appointment statistics
 * @route   GET /api/appointments/stats
 * @access  Private (Admin)
 */
export const getAppointmentStats = asyncHandler(async (req, res) => {
    const total = await Appointment.countDocuments();
    
    // Today's date in local format or whatever your app uses (e.g. DD/MM/YYYY)
    // For simplicity, let's just get counts by status and service
    const statusCounts = await Appointment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    const serviceCounts = await Appointment.aggregate([
        { $group: { _id: "$service", count: { $sum: 1 } } }
    ]);

    // Format for easier consumption
    const stats = {
        total,
        byStatus: statusCounts.reduce((acc, curr) => {
            const statusKey = curr._id || 'Pending'; // Treat untagged records as Pending
            const count = Number(acc[statusKey] || 0) + Number(curr.count);
            return { ...acc, [statusKey]: count };
        }, {}),
        byService: serviceCounts.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {})
    };

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Stats fetched successfully"));
});
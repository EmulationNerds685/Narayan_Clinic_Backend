import Appointment from '../models/appointment.js';
export const getNextPatientNumber = async () => {

  const lastAppointment = await Appointment.findOne().sort({ patient_number: -1 });
  if (lastAppointment && lastAppointment.patient_number) {
    return lastAppointment.patient_number + 1;
  }
  return 1;
};
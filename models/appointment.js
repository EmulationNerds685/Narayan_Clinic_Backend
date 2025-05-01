import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  name:String,
  ph_number: Number,
  address: String,
  service:String,
  appointment_date: String,
  appointment_time:String
}, {
  timestamps: true // ✅ This enables both createdAt and updatedAt
});

export default mongoose.model('Appointments', AppointmentSchema);

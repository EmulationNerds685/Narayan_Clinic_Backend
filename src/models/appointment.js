import mongoose from 'mongoose';

const AppointmentSchema = new mongoose.Schema({
  name:String,
  email:String,
  ph_number: Number,
  address: String,
  service:String,
  appointment_date: String,
  appointment_time:String,
  patient_number: Number, 
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  }
}, {
  timestamps: true // ✅ This enables both createdAt and updatedAt
});

export default mongoose.model('Appointments', AppointmentSchema);

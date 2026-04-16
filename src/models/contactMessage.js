import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  readStatus: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('ContactMessage', ContactMessageSchema);

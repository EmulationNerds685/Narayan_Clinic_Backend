import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Resend } from 'resend';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bcrypt from 'bcrypt';
import Admin from './models/admin.js';
import Appointments from './models/appointment.js'
dotenv.config()

const app = express()
const port = process.env.PORT

app.set('trust proxy', 1);
const allowedOrigins = [
  process.env.CLINIC_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json())
const resend = new Resend(process.env.RESEND_API_KEY);



mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to Mongo")
  }).catch((err) => {
    console.log("Error Connecting:", err)
  })


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions',
    ttl: 60 * 60
  }),
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true,
    secure: true, // set to true in production (HTTPS)
    sameSite: 'none'
  }
}));

function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Admin login required' });
}


async function sendConfirmationEmail(to, name, appointmentDate, timeSlot, service) {
  try {
    await resend.emails.send({
      from: 'Appointments@narayanheartandmaternitycentre.com', // your verified domain
      to: `${to}`,
      subject: 'Appointment Confirmation',
      html: `
  <p>Dear ${name},</p>
  <p>Thank you for choosing <strong>Narayan Heart & Maternity Centre</strong>.</p>
  <p>We are pleased to confirm your appointment as per the following details:</p>
  <ul>
    <li><strong>Date:</strong> ${appointmentDate}</li>
    <li><strong>Time:</strong> ${timeSlot}</li>
    <li><strong>Service:</strong> ${service}</li>
  </ul>
  <p>If you have any questions or need to make changes to your appointment, please feel free to contact us at <a href="mailto:narayanheartmaternitycentre@gmail.com">narayanheartmaternitycentre@gmail.com</a> or call us at <strong>+91-9708441467</strong> or <strong>+91-9836197624</strong>.</p>
  <p>We look forward to seeing you.</p>
  <p>Warm regards,<br/>
  Narayan Heart & Maternity Centre<br/>
  <a href="https://narayanheartandmaternitycentre.com">narayanheartandmaternitycentre.com</a></p>
`
      ,
    });
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
}



app.post('/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    req.session.adminId = admin._id;
    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/', (req, res) => {
  res.send("Hello")
})
app.post('/book', async (req, res) => {
  const { name, email, phoneNumber, service, address, appointmentDate, timeSlot } = req.body;

  try {
    // Count existing patients
    const count = await Appointments.countDocuments();

    const patient_info = {
      name: name,
      email: email,
      ph_number: phoneNumber,
      address: address,
      service: service,
      appointment_date: appointmentDate,
      appointment_time: timeSlot,
      patient_number: count + 1, // Set the next patient number
    };

    const newPatient = new Appointments(patient_info);
    await newPatient.save();
    try {
      await sendConfirmationEmail(email, name, appointmentDate, timeSlot, service);
    } catch (emailErr) {
      console.error("Failed to send email, but booking saved.");
    }
    res.status(201).json({ message: "Appointment Booked Successfully! You'll receive the confirmation Email shortly. " });
  } catch (err) {
    res.status(500).json({ message: "Failed to save post", err });
  }
});


app.get('/appointments', requireAdmin, async (req, res) => {
  try {
    const patients = await Appointments.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to fetch appointments' });
  }
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // or whatever cookie name you use
    res.json({ message: 'Logged out successfully' });
  });
});
/*
app.post('/admin/create', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const newAdmin = new Admin({ email, password }); // password will be hashed automatically
    await newAdmin.save();
    res.status(201).json({ message: 'Admin created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating admin' });
  }
});
*/

app.put('/admin/update', async (req, res) => {
  const { currentEmail, newEmail, newPassword } = req.body;

  try {
    const admin = await Admin.findOne({ email: currentEmail });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Optional: check if new email is already taken
    if (newEmail && newEmail !== currentEmail) {
      const emailTaken = await Admin.findOne({ email: newEmail });
      if (emailTaken) {
        return res.status(400).json({ message: 'New email already in use' });
      }
      admin.email = newEmail;
    }

    // Update password if provided
    if (newPassword) {
      admin.password = newPassword; // will be hashed by pre-save hook
    }

    await admin.save();

    res.json({ message: 'Credentials updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating credentials' });
  }
});

app.get('/admin/check', (req, res) => {
  if (req.session && req.session.adminId) {
    return res.json({ loggedIn: true });
  }
  res.json({ loggedIn: false });
});


app.post('/contact', (req, res) => {
  console.log(req.body)
  res.json({ message: "Thanks for contacting" })
})
app.post('/feedback', (req, res) => {
  console.log(req.body)
  res.status(200).json({ message: "Thanks for your feedback" });

})
app.listen(port, () => {
  console.log(`Server is listening on port:${port}`)
})

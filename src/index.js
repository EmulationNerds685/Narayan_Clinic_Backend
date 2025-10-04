// src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './config/db.js';

// Import routes
import adminRoutes from './routes/adminRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import otpRoutes from './routes/otpRoutes.js';

// --- INITIAL SETUP ---
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// --- DATABASE CONNECTION ---
connectDB();

// --- MIDDLEWARE ---
app.set('trust proxy', 1);
const allowedOrigins = [
  process.env.CLINIC_FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// --- SESSION MANAGEMENT ---
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions',
    ttl: 60 * 60 // 1 hour
  }),
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'none'
  }
}));

// --- API ROUTES ---
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/otp', otpRoutes);

// --- START SERVER ---
app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
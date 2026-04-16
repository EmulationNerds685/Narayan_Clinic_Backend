import './config/env.js';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import connectDB from './config/db.js';
import adminRoutes from './routes/adminRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import shortsRoutes from './routes/shortsRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

const port = process.env.PORT || 5000;
connectDB();
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
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.get('/', (req, res) => {
  res.status(200).json({ message: "Server is awake and running!" });
});

app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/shorts', shortsRoutes);
app.use('/api/feedback-contact', feedbackRoutes);

// Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
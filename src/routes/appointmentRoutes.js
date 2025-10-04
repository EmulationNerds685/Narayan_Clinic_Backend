// src/routes/appointmentRoutes.js
import express from 'express';
import { bookAppointment, getAppointments } from '../controllers/appointmentController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/book', bookAppointment);
router.get('/', requireAdmin, getAppointments); // Protected route

export default router;
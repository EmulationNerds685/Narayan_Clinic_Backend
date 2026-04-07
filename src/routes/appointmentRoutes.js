import express from 'express';
import { 
  bookAppointment, 
  getAppointments, 
  updateAppointmentStatus, 
  deleteAppointment,
  getAppointmentStats
} from '../controllers/appointmentController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { bookAppointmentSchema } from '../validations/appointmentValidation.js';

const router = express.Router();

router.post('/book', validate(bookAppointmentSchema), bookAppointment);
router.get('/', requireAdmin, getAppointments);
router.get('/stats', requireAdmin, getAppointmentStats);
router.patch('/:id/status', requireAdmin, updateAppointmentStatus);
router.delete('/:id', requireAdmin, deleteAppointment);

export default router;
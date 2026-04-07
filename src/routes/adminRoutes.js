import express from 'express';
import {
  loginAdmin,
  logoutAdmin,
  updateAdminCredentials,
  checkAuthStatus,
  createAdmin,
  getAllAdmins,
  deleteAdmin
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { loginAdminSchema, updateAdminSchema } from '../validations/adminValidation.js';

const router = express.Router();

router.post('/login', validate(loginAdminSchema), loginAdmin);
router.get('/check', checkAuthStatus);
router.post('/create', requireAdmin, createAdmin);
router.post('/logout', requireAdmin, logoutAdmin);
router.put('/update', requireAdmin, validate(updateAdminSchema), updateAdminCredentials);
router.get('/', requireAdmin, getAllAdmins);
router.delete('/:id', requireAdmin, deleteAdmin);

export default router;
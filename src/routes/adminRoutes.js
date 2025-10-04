import express from 'express';
import {
  loginAdmin,
  logoutAdmin,
  updateAdminCredentials,
  checkAuthStatus,
  createAdmin
} from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/login', loginAdmin);
router.get('/check', checkAuthStatus);
router.post('/create', createAdmin);
router.post('/logout', requireAdmin, logoutAdmin);
router.put('/update', requireAdmin, updateAdminCredentials);
export default router;
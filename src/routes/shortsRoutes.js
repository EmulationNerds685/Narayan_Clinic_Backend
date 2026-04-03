import express from 'express';
import { getShorts } from '../controllers/shortsController.js';

const router = express.Router();

/**
 * @route   GET /api/shorts
 * @desc    Fetch and cache YouTube Shorts from the configured channel
 * @access  Public
 */
router.get('/', getShorts);

export default router;

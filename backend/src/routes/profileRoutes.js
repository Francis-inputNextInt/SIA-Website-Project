/**
 * Profile routes — PATCH /api/profile
 */
import { Router } from 'express';
import { updateProfile } from '../controllers/authController.js';

const router = Router();

router.patch('/profile', updateProfile);

export default router;
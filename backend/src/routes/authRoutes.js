/**
 * Authentication routes — POST /api/auth/*
 */
import { Router } from 'express';
import { register, login, forgotPassword, me } from '../controllers/authController.js';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPassword);
router.get('/auth/me', me);

export default router;
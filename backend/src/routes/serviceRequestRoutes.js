/**
 * Service Request routes — /api/service-requests/*
 * Handles CRUD for student service requests with role-based access.
 */
import { Router } from 'express';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  getRequestStats,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getAllUsers,
  updateUserRole,
  getSystemLogs
} from '../controllers/serviceRequestController.js';

const router = Router();

// Student endpoints
router.post('/service-requests', createRequest);
router.get('/service-requests/mine', getMyRequests);

// Staff/Faculty endpoints
router.get('/service-requests', getAllRequests);
router.patch('/service-requests/:id/status', updateRequestStatus);

// Stats (Admin)
router.get('/service-requests/stats', getRequestStats);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Admin: user management
router.get('/admin/users', getAllUsers);
router.patch('/admin/users/:id/role', updateUserRole);

// Admin: system logs
router.get('/admin/logs', getSystemLogs);

export default router;

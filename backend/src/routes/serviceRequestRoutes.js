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
  createUser,
  updateUserRole,
  deleteUser,
  getSystemLogs,
  getSystemSettings,
  updateSystemSettings,
  getSystemAnalytics
} from '../controllers/serviceRequestController.js';

const router = Router();

// Student endpoints
router.post('/service-requests', createRequest);
router.get('/service-requests/mine', getMyRequests);
router.get('/service-requests/stats', getRequestStats);

// Staff/Faculty endpoints
router.get('/service-requests', getAllRequests);
router.patch('/service-requests/:id/status', updateRequestStatus);

// Announcements
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

// Admin: user management & analytics & settings
router.get('/admin/users', getAllUsers);
router.post('/admin/users', createUser);
router.patch('/admin/users/:id/role', updateUserRole);
router.delete('/admin/users/:id', deleteUser);
router.get('/admin/logs', getSystemLogs);
router.get('/admin/analytics', getSystemAnalytics);
router.get('/admin/settings', getSystemSettings);
router.patch('/admin/settings', updateSystemSettings);

export default router;

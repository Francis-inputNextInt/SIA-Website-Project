/**
 * Service Request, Announcement, User Management & Log Controllers
 */
import { getAdminClient } from '../config/supabase.js';
import { AppError } from '../utils/appError.js';
import * as authService from '../services/authService.js';

function bearerToken(req) {
  const header = req.headers?.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

async function requireUser(req) {
  const token = bearerToken(req);
  if (!token) throw new AppError(401, 'Authentication required.');
  return authService.getSessionUser(token);
}

function requireRole(user, allowed) {
  if (!allowed.includes(user.role)) {
    throw new AppError(403, `Access denied. Required role: ${allowed.join(' or ')}.`);
  }
}

function requireClient() {
  const client = getAdminClient();
  if (!client) throw new AppError(500, 'Database not configured.');
  return client;
}

async function logAction(supabase, userEmail, eventType, description) {
  try {
    await supabase.from('system_logs').insert({ user_email: userEmail, event_type: eventType, description });
  } catch (err) {
    console.warn('[logAction]', err.message);
  }
}

/** POST /api/service-requests */
export async function createRequest(req, res, next) {
  try {
    const user = await requireUser(req);
    const supabase = requireClient();
    const { service_type, title, details, metadata } = req.body || {};
    if (!service_type || !title) throw new AppError(400, 'service_type and title are required.');
    const { data, error } = await supabase.from('service_requests').insert({
      user_id: user.id, student_name: user.name, student_email: user.email,
      student_id: user.studentId || '', service_type, title,
      details: details || '', metadata: metadata || {}, status: 'Pending',
    }).select().single();
    if (error) throw new AppError(400, error.message);
    await logAction(supabase, user.email, 'request_created', `New ${service_type} request: ${title}`);
    res.status(201).json({ request: data });
  } catch (err) { next(err); }
}

/** GET /api/service-requests/mine */
export async function getMyRequests(req, res, next) {
  try {
    const user = await requireUser(req);
    const supabase = requireClient();
    const { data, error } = await supabase.from('service_requests')
      .select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw new AppError(400, error.message);
    res.json({ requests: data || [] });
  } catch (err) { next(err); }
}

/** GET /api/service-requests */
export async function getAllRequests(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Staff', 'Faculty', 'Admin']);
    const supabase = requireClient();
    const { status, service_type } = req.query || {};
    let query = supabase.from('service_requests').select('*').order('created_at', { ascending: false });
    if (status && status !== 'All') query = query.eq('status', status);
    if (service_type && service_type !== 'All') query = query.eq('service_type', service_type);
    const { data, error } = await query;
    if (error) throw new AppError(400, error.message);
    res.json({ requests: data || [] });
  } catch (err) { next(err); }
}

/** PATCH /api/service-requests/:id/status */
export async function updateRequestStatus(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Staff', 'Faculty', 'Admin']);
    const supabase = requireClient();
    const { id } = req.params;
    const { status, staff_notes } = req.body || {};
    if (!status) throw new AppError(400, 'status is required.');
    const validStatuses = ['Pending', 'Processing', 'In Review', 'Approved', 'Rejected', 'Completed'];
    if (!validStatuses.includes(status)) throw new AppError(400, `Invalid status.`);
    const updateObj = { status, updated_at: new Date().toISOString(), handled_by: user.name, handled_by_email: user.email };
    if (staff_notes !== undefined) updateObj.staff_notes = staff_notes;
    const { data, error } = await supabase.from('service_requests').update(updateObj).eq('id', id).select().single();
    if (error) throw new AppError(400, error.message);
    await logAction(supabase, user.email, 'request_updated', `Request ${id} → ${status}`);
    res.json({ request: data });
  } catch (err) { next(err); }
}

/** GET /api/service-requests/stats */
export async function getRequestStats(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin', 'Staff']);
    const supabase = requireClient();
    const { data: all, error } = await supabase.from('service_requests').select('status, service_type, created_at');
    if (error) throw new AppError(400, error.message);
    const total = all?.length || 0;
    const pending = all?.filter(r => r.status === 'Pending').length || 0;
    const processing = all?.filter(r => ['Processing', 'In Review'].includes(r.status)).length || 0;
    const completed = all?.filter(r => ['Completed', 'Approved'].includes(r.status)).length || 0;
    const rejected = all?.filter(r => r.status === 'Rejected').length || 0;
    const byType = {};
    (all || []).forEach(r => { byType[r.service_type] = (byType[r.service_type] || 0) + 1; });
    res.json({ stats: { total, pending, processing, completed, rejected, byType } });
  } catch (err) { next(err); }
}

/** GET /api/announcements */
export async function getAnnouncements(req, res, next) {
  try {
    await requireUser(req);
    const supabase = requireClient();
    const { data, error } = await supabase.from('announcements')
      .select('*').order('created_at', { ascending: false }).limit(20);
    if (error) throw new AppError(400, error.message);
    res.json({ announcements: data || [] });
  } catch (err) { next(err); }
}

/** POST /api/announcements */
export async function createAnnouncement(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Faculty', 'Staff', 'Admin']);
    const supabase = requireClient();
    const { title, body, priority, category, target_roles } = req.body || {};
    if (!title || !body) throw new AppError(400, 'title and body are required.');
    const { data, error } = await supabase.from('announcements').insert({
      title, body, priority: priority || 'medium', category: category || 'General',
      target_roles: target_roles || ['Student', 'Faculty', 'Staff', 'Admin'],
      posted_by: user.name, posted_by_email: user.email,
    }).select().single();
    if (error) throw new AppError(400, error.message);
    await logAction(supabase, user.email, 'announcement_created', `Announcement: ${title}`);
    res.status(201).json({ announcement: data });
  } catch (err) { next(err); }
}

/** DELETE /api/announcements/:id */
export async function deleteAnnouncement(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();
    const { error } = await supabase.from('announcements').delete().eq('id', req.params.id);
    if (error) throw new AppError(400, error.message);
    await logAction(supabase, user.email, 'announcement_deleted', `Deleted announcement ${req.params.id}`);
    res.json({ success: true });
  } catch (err) { next(err); }
}

/** GET /api/admin/users */
export async function getAllUsers(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();
    const { data, error } = await supabase.from('profiles')
      .select('id, full_name, email, role, department, student_id, year_level, avatar_color, initials, enrolled, created_at')
      .order('created_at', { ascending: false });
    if (error) throw new AppError(400, error.message);
    res.json({ users: data || [] });
  } catch (err) { next(err); }
}

/** POST /api/admin/users */
export async function createUser(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();
    const { full_name, email, role, department, student_id, year_level } = req.body || {};
    if (!full_name || !email) throw new AppError(400, 'full_name and email are required.');
    const validRoles = ['Student', 'Faculty', 'Staff', 'Admin', 'Applicant'];
    const assignedRole = validRoles.includes(role) ? role : 'Student';
    const enrolled = ['Student', 'Faculty', 'Staff', 'Admin'].includes(assignedRole);
    
    const newId = crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-0000-0000-' + Math.random().toString(36).slice(2, 14);
    const initials = full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const { data, error } = await supabase.from('profiles').insert({
      id: newId,
      full_name,
      email,
      role: assignedRole,
      department: department || 'General',
      student_id: student_id || '',
      year_level: year_level || '1st Year',
      initials,
      enrolled
    }).select().single();

    if (error) throw new AppError(400, error.message);
    await logAction(supabase, user.email, 'user_created', `Created user account: ${email} (${assignedRole})`);
    res.status(201).json({ user: data });
  } catch (err) { next(err); }
}

/** PATCH /api/admin/users/:id/role */
export async function updateUserRole(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();
    const { id } = req.params;
    const { role } = req.body || {};
    if (!role) throw new AppError(400, 'role is required.');
    const validRoles = ['Student', 'Faculty', 'Staff', 'Admin', 'Applicant'];
    if (!validRoles.includes(role)) throw new AppError(400, `Invalid role.`);
    const enrolled = ['Student', 'Faculty', 'Staff', 'Admin'].includes(role);
    const { data, error } = await supabase.from('profiles').update({ role, enrolled }).eq('id', id).select().single();
    if (error) throw new AppError(400, error.message);
    await logAction(supabase, user.email, 'role_updated', `Changed role of ${data.email} to ${role}`);
    res.json({ user: data });
  } catch (err) { next(err); }
}

/** DELETE /api/admin/users/:id */
export async function deleteUser(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();
    const { id } = req.params;
    const { data: targetUser } = await supabase.from('profiles').select('email').eq('id', id).single();
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw new AppError(400, error.message);
    await logAction(supabase, user.email, 'user_deleted', `Deleted user account: ${targetUser?.email || id}`);
    res.json({ success: true });
/** GET /api/admin/settings */
export async function getSystemSettings(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();
    const { data, error } = await supabase.from('system_settings').select('*');
    if (error || !data || data.length === 0) {
      return res.json({
        settings: {
          maintenance_mode: false,
          self_registration: true,
          ai_response_mode: 'standard',
          academic_term: 'Fall 2026',
          notification_email: 'admin@campus.edu'
        }
      });
    }
    const settingsObj = {};
    data.forEach(row => {
      settingsObj[row.key] = row.value;
    });
    res.json({ settings: settingsObj.general || settingsObj });
  } catch (err) { next(err); }
}

/** PATCH /api/admin/settings */
export async function updateSystemSettings(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();
    const newSettings = req.body || {};
    
    const { data, error } = await supabase.from('system_settings').upsert({
      key: 'general',
      value: newSettings,
      updated_at: new Date().toISOString()
    }).select().single();

    if (error) throw new AppError(400, error.message);
    await logAction(supabase, user.email, 'settings_updated', 'Updated system configuration settings');
    res.json({ settings: data.value });
  } catch (err) { next(err); }
}

/** GET /api/admin/analytics */
export async function getSystemAnalytics(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();

    const [usersRes, requestsRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('role, department, enrolled'),
      supabase.from('service_requests').select('status, service_type'),
      supabase.from('system_logs').select('event_type, created_at')
    ]);

    const users = usersRes.data || [];
    const requests = requestsRes.data || [];
    const logs = logsRes.data || [];

    const roleBreakdown = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    const requestStatusBreakdown = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const requestTypeBreakdown = requests.reduce((acc, r) => {
      acc[r.service_type] = (acc[r.service_type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      analytics: {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.enrolled).length,
        totalRequests: requests.length,
        pendingRequests: requestStatusBreakdown['Pending'] || 0,
        completedRequests: (requestStatusBreakdown['Completed'] || 0) + (requestStatusBreakdown['Approved'] || 0),
        totalLogs: logs.length,
        roleBreakdown,
        requestStatusBreakdown,
        requestTypeBreakdown,
        systemUptime: '99.98%'
      }
    });
  } catch (err) { next(err); }
}
  } catch (err) { next(err); }
}

/** GET /api/admin/logs */
export async function getSystemLogs(req, res, next) {
  try {
    const user = await requireUser(req);
    requireRole(user, ['Admin']);
    const supabase = requireClient();
    const { data, error } = await supabase.from('system_logs')
      .select('*').order('created_at', { ascending: false }).limit(50);
    if (error) throw new AppError(400, error.message);
    res.json({ logs: data || [] });
  } catch (err) { next(err); }
}


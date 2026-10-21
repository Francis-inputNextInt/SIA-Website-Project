/**
 * Service Request API Client
 * Communicates with /api/service-requests, /api/announcements, /api/admin/*
 */
import { supabase } from './supabase.js';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api';

async function getAccessToken() {
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch (err) {
    return null;
  }
}

async function apiRequest(path, options = {}) {
  const token = await getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });
  } catch (err) {
    throw new Error('Unable to reach campus server.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}

export async function createServiceRequest({ service_type, title, details, metadata }) {
  const data = await apiRequest('/service-requests', {
    method: 'POST',
    body: JSON.stringify({ service_type, title, details, metadata })
  });
  return data.request;
}

export async function getMyServiceRequests() {
  const data = await apiRequest('/service-requests/mine');
  return data.requests || [];
}

export async function getAllServiceRequests(status = 'All', service_type = 'All') {
  const params = new URLSearchParams();
  if (status !== 'All') params.append('status', status);
  if (service_type !== 'All') params.append('service_type', service_type);
  const data = await apiRequest(`/service-requests?${params.toString()}`);
  return data.requests || [];
}

export async function updateServiceRequestStatus(id, status, staff_notes = '') {
  const data = await apiRequest(`/service-requests/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, staff_notes })
  });
  return data.request;
}

export async function getRequestStats() {
  const data = await apiRequest('/service-requests/stats');
  return data.stats;
}

export async function getAnnouncements() {
  const data = await apiRequest('/announcements');
  return data.announcements || [];
}

export async function createAnnouncement({ title, body, priority, category, target_roles }) {
  const data = await apiRequest('/announcements', {
    method: 'POST',
    body: JSON.stringify({ title, body, priority, category, target_roles })
  });
  return data.announcement;
}

export async function deleteAnnouncement(id) {
  return apiRequest(`/announcements/${id}`, { method: 'DELETE' });
}

export async function getAllUsers() {
  const data = await apiRequest('/admin/users');
  return data.users || [];
}

export async function createUser(userData) {
  const data = await apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return data.user;
}

export async function deleteUser(id) {
  return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
}

export async function getSystemAnalytics() {
  const data = await apiRequest('/admin/analytics');
  return data.analytics;
}

export async function getSystemSettings() {
  const data = await apiRequest('/admin/settings');
  return data.settings;
}

export async function updateSystemSettings(settings) {
  const data = await apiRequest('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings)
  });
  return data.settings;
}

export async function updateUserRole(id, role) {
  const data = await apiRequest(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
  return data.user;
}

export async function getSystemLogs() {
  const data = await apiRequest('/admin/logs');
  return data.logs || [];
}

export async function getFacultyStudents() {
  try {
    const data = await apiRequest('/faculty/students');
    return data.students || [];
  } catch (err) {
    return [];
  }
}

export async function getMyGrades() {
  try {
    const data = await apiRequest('/grades');
    return data.grades || [];
  } catch (err) {
    return [];
  }
}

export async function upsertGrade(gradeData) {
  const data = await apiRequest('/grades', {
    method: 'POST',
    body: JSON.stringify(gradeData)
  });
  return data.grade;
}

export async function getMyPayments() {
  try {
    const data = await apiRequest('/payments');
    return data.payments || [];
  } catch (err) {
    return [];
  }
}

export async function upsertPayment(paymentData) {
  const data = await apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });
  return data.payment;
}

import React, { useState, useEffect } from 'react';
import {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
  getSystemLogs,
  getAllServiceRequests,
  updateServiceRequestStatus,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  getSystemAnalytics,
  getSystemSettings,
  updateSystemSettings
} from '../../services/serviceRequestService';
import {
  Shield, Users, Database, Activity, RefreshCw, AlertTriangle,
  FileText, Megaphone, Settings, Plus, Trash2, CheckCircle2, Clock, Search, Filter, X, Send, Check
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const [usersList, setUsersList] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [announcementsList, setAnnouncementsList] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalLogs: 0,
    roleBreakdown: {},
    requestStatusBreakdown: {},
    requestTypeBreakdown: {},
    systemUptime: '99.98%'
  });
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    self_registration: true,
    ai_response_mode: 'standard',
    academic_term: 'Fall 2026',
    notification_email: 'admin@campus.edu'
  });

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [requestStatusFilter, setRequestStatusFilter] = useState('All');
  const [requestTypeFilter, setRequestTypeFilter] = useState('All');

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Student');
  const [newUserDept, setNewUserDept] = useState('Computer Science');
  const [newUserStudentId, setNewUserStudentId] = useState('');

  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annPriority, setAnnPriority] = useState('medium');
  const [annCategory, setAnnCategory] = useState('Academic');

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [staffNotes, setStaffNotes] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [usrRes, logRes, reqRes, annRes, anlyRes, setRes] = await Promise.all([
        getAllUsers().catch(() => []),
        getSystemLogs().catch(() => []),
        getAllServiceRequests('All', 'All').catch(() => []),
        getAnnouncements().catch(() => []),
        getSystemAnalytics().catch(() => ({})),
        getSystemSettings().catch(() => ({}))
      ]);

      if (usrRes) setUsersList(usrRes);
      if (logRes) setSystemLogs(logRes);
      if (reqRes) setRequestsList(reqRes);
      if (annRes) setAnnouncementsList(annRes);
      if (anlyRes && anlyRes.totalUsers !== undefined) setAnalytics(anlyRes);
      if (setRes && typeof setRes === 'object') setSettings(prev => ({ ...prev, ...setRes }));
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      showToast('User role updated successfully.');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      await deleteUser(id);
      setUsersList(prev => prev.filter(u => u.id !== id));
      showToast('User account deleted.');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser({
        full_name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        department: newUserDept,
        student_id: newUserStudentId
      });
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserStudentId('');
      showToast('New user account created successfully.');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to create user.');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title: annTitle,
        body: annBody,
        priority: annPriority,
        category: annCategory,
        target_roles: ['Student', 'Faculty', 'Staff', 'Admin']
      });
      setShowAnnModal(false);
      setAnnTitle('');
      setAnnBody('');
      showToast('Announcement posted successfully.');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to post announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncementsList(prev => prev.filter(a => a.id !== id));
      showToast('Announcement deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete announcement.');
    }
  };

  const handleUpdateRequestStatus = async (id, newStatus) => {
    try {
      await updateServiceRequestStatus(id, newStatus, staffNotes);
      setRequestsList(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, staff_notes: staffNotes } : r));
      showToast(`Request status updated to ${newStatus}.`);
      setSelectedRequest(null);
      setStaffNotes('');
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to update request status.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateSystemSettings(settings);
      showToast('System configuration saved successfully.');
    } catch (err) {
      alert(err.message || 'Failed to save settings.');
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = !search || (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredRequests = requestsList.filter(r => {
    const matchesSearch = !search || (r.student_name || '').toLowerCase().includes(search.toLowerCase()) || (r.title || '').toLowerCase().includes(search.toLowerCase()) || (r.student_id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = requestStatusFilter === 'All' || r.status === requestStatusFilter;
    const matchesType = requestTypeFilter === 'All' || r.service_type === requestTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wider uppercase mb-2">
              <Shield className="w-3.5 h-3.5" /> University Administrator
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{getGreeting()}, {user.name}!</h1>
            <p className="mt-1 text-sm text-rose-100 font-medium">AI Campus Assistant — Advanced Administration &amp; Control Center</p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/25 hover:bg-white/35 text-white text-xs font-bold transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Supabase DB
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users, count: usersList.length },
          { id: 'requests', label: 'Service Requests', icon: FileText, count: requestsList.length },
          { id: 'announcements', label: 'Announcements', icon: Megaphone, count: announcementsList.length },
          { id: 'logs', label: 'Audit Logs', icon: Database, count: systemLogs.length },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(''); }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                active ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-rose-400' : 'text-slate-400'}`} />
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Users</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{analytics.totalUsers || usersList.length}</p>
              <p className="text-[11px] font-semibold text-emerald-600">Active: {analytics.activeUsers || usersList.filter(u => u.enrolled).length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Service Requests</span>
                <FileText className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{analytics.totalRequests || requestsList.length}</p>
              <p className="text-[11px] font-semibold text-amber-600">Pending: {analytics.pendingRequests || requestsList.filter(r => r.status === 'Pending').length}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">System Uptime</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{analytics.systemUptime}</p>
              <p className="text-[11px] font-semibold text-emerald-600">All services operational</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Audit Logs</span>
                <Database className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{systemLogs.length}</p>
              <p className="text-[11px] font-semibold text-slate-500">Secured &amp; immutable</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">User Role Distribution</h2>
              <div className="space-y-3">
                {Object.entries(analytics.roleBreakdown || { Student: usersList.filter(u => u.role === 'Student').length, Faculty: usersList.filter(u => u.role === 'Faculty').length, Staff: usersList.filter(u => u.role === 'Staff').length, Admin: usersList.filter(u => u.role === 'Admin').length }).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <span className="font-bold text-slate-800">{role}</span>
                    <span className="px-2.5 py-1 rounded-full font-bold bg-white text-slate-700 shadow-sm">{count} users</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900">Service Request Status Breakdown</h2>
              <div className="space-y-3">
                {Object.entries(analytics.requestStatusBreakdown || { Pending: 0, Processing: 0, Completed: 0 }).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <span className="font-bold text-slate-800">{status}</span>
                    <span className={`px-2.5 py-1 rounded-full font-bold shadow-sm ${
                      status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {count} requests
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Account &amp; Role Management</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage campus user roles, permissions, and database profiles.</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none"
              >
                <option value="All">All Roles</option>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
                <option value="Applicant">Applicant</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-3">Name &amp; Email</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Student ID</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{u.full_name || u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{u.department || 'General'}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{u.student_id || 'N/A'}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        u.role === 'Admin' ? 'bg-rose-100 text-rose-800' :
                        u.role === 'Staff' ? 'bg-emerald-100 text-emerald-800' :
                        u.role === 'Faculty' ? 'bg-violet-100 text-violet-800' :
                        u.role === 'Applicant' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2 py-1 rounded border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none"
                      >
                        <option value="Student">Student</option>
                        <option value="Faculty">Faculty</option>
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                        <option value="Applicant">Applicant</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Service Request Monitoring &amp; Processing</h2>
              <p className="text-xs text-slate-500 mt-0.5">Review and process student service tickets across all campus offices.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={requestStatusFilter}
                onChange={e => setRequestStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={requestTypeFilter}
                onChange={e => setRequestTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700"
              >
                <option value="All">All Service Types</option>
                <option value="Transcript">Transcript (TOR)</option>
                <option value="Enrollment">Enrollment / Add-Drop</option>
                <option value="Clearance">Clearance</option>
                <option value="ID">Student ID</option>
                <option value="Tech Support">Tech Support</option>
                <option value="Scholarship">Scholarship</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50">
                  <th className="py-3 px-3">Student</th>
                  <th className="py-3 px-3">Service &amp; Title</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{req.student_name}</div>
                      <div className="text-[11px] text-slate-400">{req.student_email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{req.title}</div>
                      <div className="text-[11px] text-indigo-600">{req.service_type}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        req.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        req.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{new Date(req.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Campus Announcements &amp; Broadcasts</h2>
              <p className="text-xs text-slate-500 mt-0.5">Post and manage official announcements visible across all user dashboards.</p>
            </div>
            <button
              onClick={() => setShowAnnModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" /> Post Announcement
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcementsList.map(ann => (
              <div key={ann.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 mr-2">
                      {ann.category || 'General'}
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(ann.created_at).toLocaleDateString()}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{ann.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>
                <div className="text-[11px] font-semibold text-slate-400 pt-2 border-t border-slate-200/60 flex justify-between">
                  <span>Posted by: {ann.posted_by || 'Admin'}</span>
                  <span className="uppercase text-rose-600">{ann.priority} priority</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">System Security &amp; Audit Logs</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time immutable log of admin actions, security events, and user activities.</p>
            </div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {systemLogs.map(log => (
              <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-200 text-slate-800">{log.event_type || 'info'}</span>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(log.created_at || log.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="font-semibold text-slate-800">{log.description || log.event}</p>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">User: {log.user_email || log.user || 'System'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm max-w-3xl space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">System Configuration &amp; Parameters</h2>
            <p className="text-xs text-slate-500 mt-0.5">Configure campus-wide platform toggles, academic terms, and security settings.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="font-bold text-slate-900 block">System Maintenance Mode</label>
                <span className="text-slate-500">Disable non-admin logins and display maintenance notice.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenance_mode}
                onChange={e => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="font-bold text-slate-900 block">Open Self-Registration</label>
                <span className="text-slate-500">Allow new students and applicants to register accounts.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.self_registration}
                onChange={e => setSettings({ ...settings, self_registration: e.target.checked })}
                className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Current Academic Term</label>
              <input
                type="text"
                value={settings.academic_term}
                onChange={e => setSettings({ ...settings, academic_term: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 block">Admin Notification Email</label>
              <input
                type="email"
                value={settings.notification_email}
                onChange={e => setSettings({ ...settings, notification_email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Save Configuration Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateUser} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New User Account</h3>
              <button type="button" onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="e.g. jane.doe@campus.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold bg-white"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Staff">Staff</option>
                  <option value="Admin">Admin</option>
                  <option value="Applicant">Applicant</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Department</label>
                <input
                  type="text"
                  value={newUserDept}
                  onChange={e => setNewUserDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student / Employee ID (Optional)</label>
                <input
                  type="text"
                  value={newUserStudentId}
                  onChange={e => setNewUserStudentId(e.target.value)}
                  placeholder="e.g. 2024-00991"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateAnnouncement} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Post Campus Announcement</h3>
              <button type="button" onClick={() => setShowAnnModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  placeholder="Announcement title..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={annCategory}
                    onChange={e => setAnnCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold bg-white"
                  >
                    <option value="Academic">Academic</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Campus Life">Campus Life</option>
                    <option value="Registrar">Registrar</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={annPriority}
                    onChange={e => setAnnPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Announcement Body</label>
                <textarea
                  rows={4}
                  value={annBody}
                  onChange={e => setAnnBody(e.target.value)}
                  placeholder="Detailed announcement content..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAnnModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm"
              >
                Publish Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">{selectedRequest.service_type}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedRequest.title}</h3>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Student Details</span>
                <div className="font-bold text-slate-900">{selectedRequest.student_name} ({selectedRequest.student_email})</div>
                <div className="text-slate-500 font-mono">ID: {selectedRequest.student_id || 'N/A'}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-400 uppercase text-[10px]">Request Details</span>
                <p className="text-slate-700 leading-relaxed">{selectedRequest.details || 'No additional details provided.'}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Staff / Admin Notes</label>
                <input
                  type="text"
                  value={staffNotes}
                  onChange={e => setStaffNotes(e.target.value)}
                  placeholder="Optional review notes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateRequestStatus(selectedRequest.id, 'Processing')}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  Set Processing
                </button>
                <button
                  onClick={() => handleUpdateRequestStatus(selectedRequest.id, 'Completed')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Mark Completed
                </button>
              </div>
              <button
                onClick={() => handleUpdateRequestStatus(selectedRequest.id, 'Rejected')}
                className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


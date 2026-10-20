import React, { useState, useEffect } from 'react';
import {
  ADMIN_METRICS,
  ADMIN_USERS,
  ADMIN_SYSTEM_LOGS
} from '../../data/dashboardData';
import {
  getAllUsers,
  updateUserRole,
  getSystemLogs,
  getRequestStats
} from '../../services/serviceRequestService';
import { Shield, Users, Database, Activity, RefreshCw, AlertTriangle } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [usersList, setUsersList] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, pending: 0, completed: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [usrRes, logRes, stRes] = await Promise.all([
        getAllUsers().catch(() => []),
        getSystemLogs().catch(() => []),
        getRequestStats().catch(() => ({ total: 0, pending: 0, completed: 0 }))
      ]);

      if (usrRes && usrRes.length > 0) {
        setUsersList(usrRes.map(u => ({
          id: u.id,
          name: u.full_name || u.email?.split('@')[0] || 'User',
          email: u.email,
          role: u.role || 'Student',
          department: u.department || 'General'
        })));
      } else {
        setUsersList(ADMIN_USERS);
      }

      if (logRes && logRes.length > 0) {
        setSystemLogs(logRes);
      } else {
        setSystemLogs(ADMIN_SYSTEM_LOGS);
      }

      setStats(stRes);
    } catch (err) {
      setUsersList(ADMIN_USERS);
      setSystemLogs(ADMIN_SYSTEM_LOGS);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleRole = async (id, currentRole) => {
    const nextRole = currentRole === 'Student' ? 'Staff' : currentRole === 'Staff' ? 'Admin' : 'Student';
    try {
      await updateUserRole(id, nextRole);
    } catch (err) {
      console.warn('Role update fallback:', err);
    }
    setUsersList(prev => prev.map(u => u.id === id ? { ...u, role: nextRole } : u));
  };

  const filteredUsers = usersList.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getGreeting()}, {user.name}!</h1>
            <p className="mt-1 text-sm text-rose-100 font-medium">University Administration &amp; System Management Portal</p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Supabase
          </button>
        </div>
      </div>

      {/* Admin Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Registered Accounts</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{usersList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Service Requests</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{stats.total || stats.totalRequests || ADMIN_METRICS.pendingServiceTickets}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">System Status</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">Operational</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Security Audit Logs</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{systemLogs.length}</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">User Account & Role Management</h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">{usersList.length} Accounts</span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
              <th className="py-3 px-3">Name & Email</th>
              <th className="py-3 px-3">Department</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {usersList.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{u.name}</div>
                  <div className="text-[10px] text-slate-400">{u.email}</div>
                </td>
                <td className="py-3 px-3 text-slate-500">{u.department}</td>
                <td className="py-3 px-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'Admin' ? 'bg-rose-100 text-rose-800' : u.role === 'Staff' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button onClick={() => toggleUserRole(u.id)} className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold">Cycle Role</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900">System Security & Audit Logs</h2>
        <div className="space-y-2 text-xs">
          {ADMIN_SYSTEM_LOGS.map(log => (
            <div key={log.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200/60">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 mr-2">{log.timestamp}</span>
                <span className="font-medium text-slate-800">{log.event}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-700">{log.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

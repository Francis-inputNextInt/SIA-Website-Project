import React, { useState } from 'react';
import {
  ADMIN_METRICS,
  ADMIN_USERS,
  ADMIN_SYSTEM_LOGS
} from '../../data/dashboardData';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [usersList, setUsersList] = useState(ADMIN_USERS);

  const toggleUserRole = (id) => {
    setUsersList(usersList.map(u => {
      if (u.id === id) {
        const nextRole = u.role === 'Student' ? 'Staff' : u.role === 'Staff' ? 'Admin' : 'Student';
        return { ...u, role: nextRole };
      }
      return u;
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="bg-white-900/90 text-white px-4 py-2 ">
        
        
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getGreeting()}, {user.name}!</h1>
        <p className="mt-1 text-sm text-rose-100 font-medium">University Administration & System Management Portal</p>
      </div>

      {/* Admin Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Students</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{ADMIN_METRICS.totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Faculty & Staff</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{ADMIN_METRICS.totalStaff}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Service Tickets</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{ADMIN_METRICS.pendingServiceTickets}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">System Health</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{ADMIN_METRICS.systemHealth}</p>
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

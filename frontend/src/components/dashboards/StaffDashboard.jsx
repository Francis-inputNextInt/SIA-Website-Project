import React, { useState } from 'react';
import {
  STAFF_METRICS,
  STAFF_TICKETS,
  STAFF_ANNOUNCEMENTS
} from '../../data/dashboardData';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StaffDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [tickets, setTickets] = useState(STAFF_TICKETS);
  const [filter, setFilter] = useState('All');

  const updateStatus = (id, newStatus) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const filteredTickets = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getGreeting()}, {user.name}!</h1>
        <p className="mt-1 text-sm text-emerald-100 font-medium">Office Staff Portal & Service Inquiry Queue</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Pending Requests</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{STAFF_METRICS.pendingRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Processing</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{STAFF_METRICS.processingRequests}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Completed Today</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{STAFF_METRICS.completedToday}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Urgent Escalations</p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{STAFF_METRICS.urgentEscalations}</p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900">Student Service Queue</h2>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['All', 'Pending', 'Processing'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg font-semibold ${filter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
              <th className="py-3 px-3">ID</th>
              <th className="py-3 px-3">Student</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredTickets.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="py-3 px-3 font-mono font-bold text-blue-600">{t.id}</td>
                <td className="py-3 px-3 font-bold text-slate-900">{t.student}</td>
                <td className="py-3 px-3">{t.type}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right space-x-1">
                  {t.status === 'Pending' && (
                    <button onClick={() => updateStatus(t.id, 'Processing')} className="px-2 py-1 bg-blue-600 text-white rounded text-[11px]">Process</button>
                  )}
                  {t.status === 'Processing' && (
                    <button onClick={() => updateStatus(t.id, 'Completed')} className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px]">Complete</button>
                  )}
                  {t.status === 'Completed' && <span className="text-emerald-600 font-bold">Done ✓</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

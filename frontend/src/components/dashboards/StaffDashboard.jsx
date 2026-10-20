import React, { useState, useEffect } from 'react';
import { STAFF_METRICS, STAFF_TICKETS, STAFF_ANNOUNCEMENTS } from '../../data/dashboardData';
import { getAllServiceRequests, updateServiceRequestStatus, createAnnouncement, getAnnouncements } from '../../services/serviceRequestService';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, Send, Search, Filter, RefreshCw, Building2, Megaphone } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StaffDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [reqs, anns] = await Promise.all([
        getAllServiceRequests().catch(() => []),
        getAnnouncements().catch(() => [])
      ]);
      if (reqs && reqs.length > 0) {
        setTickets(reqs.map(r => ({
          id: r.id,
          student: r.student_name || 'Student',
          studentId: r.student_id || 'ID Pending',
          type: r.title || r.service_type,
          status: r.status,
          date: new Date(r.created_at).toLocaleDateString(),
          details: r.details
        })));
      } else {
        setTickets(STAFF_TICKETS);
      }
      if (anns && anns.length > 0) setAnnouncements(anns);
      else setAnnouncements(STAFF_ANNOUNCEMENTS);
    } catch (err) {
      setTickets(STAFF_TICKETS);
      setAnnouncements(STAFF_ANNOUNCEMENTS);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateServiceRequestStatus(id, newStatus);
    } catch (err) {
      console.warn('Update fallback:', err);
    }
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const pendingCount = tickets.filter(t => t.status === 'Pending').length;
  const processingCount = tickets.filter(t => ['Processing', 'In Review'].includes(t.status)).length;
  const completedCount = tickets.filter(t => ['Completed', 'Approved'].includes(t.status)).length;

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === 'All' ? true : t.status === filter;
    const matchesSearch = !search
      ? true
      : t.student.toLowerCase().includes(search.toLowerCase()) ||
        t.type.toLowerCase().includes(search.toLowerCase()) ||
        t.studentId.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{getGreeting()}, {user.name}!</h1>
            <p className="mt-1 text-sm text-emerald-100 font-medium">Office Staff Portal · Student Service Processing Queue</p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Queue
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Pending Requests</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Processing</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{processingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Completed</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total in Queue</p>
          <p className="text-2xl font-extrabold text-slate-700 mt-1">{tickets.length}</p>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Student Service Queue</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student or request..."
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {['All', 'Pending', 'Processing', 'Completed'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2.5 py-1 rounded-lg ${filter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Request Type</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                    No requests match this filter.
                  </td>
                </tr>
              ) : filteredTickets.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{t.student}</div>
                    <div className="text-[10px] font-mono text-slate-400">{t.studentId}</div>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-slate-800 truncate">{t.type}</div>
                    {t.details && <div className="text-[11px] text-slate-500 truncate">{t.details}</div>}
                  </td>
                  <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{t.date}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'Pending'    ? 'bg-amber-100 text-amber-800' :
                      t.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                      t.status === 'In Review'  ? 'bg-violet-100 text-violet-800' :
                      t.status === 'Rejected'   ? 'bg-rose-100 text-rose-800' :
                                                  'bg-emerald-100 text-emerald-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                    {t.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'Processing')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Process
                      </button>
                    )}
                    {t.status === 'Processing' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'Completed')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Complete
                      </button>
                    )}
                    {t.status !== 'Rejected' && t.status !== 'Completed' && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, 'Rejected')}
                        className="px-2 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-lg text-[11px] font-medium transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    {t.status === 'Completed' && (
                      <span className="text-emerald-600 font-bold text-[11px]">Done ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { STAFF_METRICS, STAFF_TICKETS, STAFF_ANNOUNCEMENTS } from '../../data/dashboardData';
import { getAllServiceRequests, updateServiceRequestStatus, createAnnouncement, getAnnouncements, getPayments, upsertPayment, getFacultyStudents } from '../../services/serviceRequestService';
import { supabase } from '../../services/supabase';
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, Send, Search, Filter, RefreshCw, Building2, Megaphone, CircleDollarSign, Plus, Edit3 } from 'lucide-react';
import PaymentModal from './PaymentModal';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function StaffDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [activeTab, setActiveTab] = useState('queue');
  const [tickets, setTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [studentError, setStudentError] = useState(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
      setStudentError(null);
      const [reqs, pyms, studs, anns] = await Promise.all([
        getAllServiceRequests().catch(() => []),
        getPayments().catch(() => []),
        getFacultyStudents().catch(err => { 
          console.error('[StaffDashboard] getFacultyStudents error caught:', err.message);
          setStudentError(err.message || 'Failed to load students'); 
          return []; 
        }),
        getAnnouncements().catch(() => [])
      ]);
      console.log('[StaffDashboard] loaded students from API:', studs);
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
      setPayments(pyms || []);
      setStudents(studs || []);
      if (anns && anns.length > 0) setAnnouncements(anns);
      else setAnnouncements(STAFF_ANNOUNCEMENTS);
    } catch (err) {
      console.error('[StaffDashboard] loadData general error:', err.message);
      setStudentError(err.message || 'Failed to sync dashboard.');
      setTickets(STAFF_TICKETS);
      setPayments([]);
      setStudents([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    let subscription = null;
    if (supabase) {
      subscription = supabase
        .channel('public:staff_dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => { loadData(); })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => { loadData(); })
        .subscribe();
    }
    return () => {
      if (subscription && supabase) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateServiceRequestStatus(id, newStatus);
    } catch (err) {
      console.warn('Update fallback:', err);
    }
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleSavePayment = async (paymentData) => {
    await upsertPayment(paymentData);
    await loadData();
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
            <p className="mt-1 text-sm text-emerald-100 font-medium">Office Staff Portal · Student Service Processing & Payment Management</p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'queue'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Service Request Queue ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CircleDollarSign className="w-4 h-4" />
          Payment Management ({payments.length})
        </button>
      </div>

      {activeTab === 'queue' && (
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
      )}

      {activeTab === 'queue' && (
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
      )}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {studentError && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-800">
              <div>
                <span className="font-bold">⚠️ Student Fetch Notice:</span> {studentError}. Ensure student profiles are created in Supabase.
              </div>
              <button onClick={loadData} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors">
                Retry Loading Students
              </button>
            </div>
          )}
          {students.length === 0 && !studentError && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-800">
              <div>
                <span className="font-bold">ℹ️ No Registered Students Found:</span> No student profiles (role: 'Student') were found in the database. Please register student accounts to record payments.
              </div>
              <button onClick={loadData} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                Refresh
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Billed</p>
              <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">₱{payments.reduce((s, p) => s + Number(p.total_amount || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Collected</p>
              <p className="text-2xl font-extrabold font-mono text-emerald-600 mt-1">₱{payments.reduce((s, p) => s + Number(p.amount_paid || 0), 0).toLocaleString()}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase">Balance</p>
              <p className="text-2xl font-extrabold font-mono text-amber-600 mt-1">₱{payments.reduce((s, p) => s + Number(p.remaining_balance || 0), 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Student Account Payments</h2>
                <p className="text-xs text-slate-500">Search student accounts, record payments, and manage balances</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student or fee..."
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={() => { setSelectedPayment(null); setShowPaymentModal(true); }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> Record Payment
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/50">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Fee & Term</th>
                    <th className="py-3 px-3">Total Billed</th>
                    <th className="py-3 px-3">Amount Paid</th>
                    <th className="py-3 px-3">Balance</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                        No payment records found. Click "Record Payment" to add one.
                      </td>
                    </tr>
                  ) : payments.map(p => {
                    const stud = students.find(s => s.id === p.user_id);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{stud?.full_name || 'Student'}</div>
                          <div className="text-[10px] font-mono text-slate-400">{p.student_id || stud?.student_id || 'ID Pending'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{p.fee_type}</div>
                          <div className="text-[10px] text-slate-400">{p.academic_year} · {p.semester}</div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">₱{Number(p.total_amount).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">₱{Number(p.amount_paid).toLocaleString()}</td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-700">₱{Number(p.remaining_balance).toLocaleString()}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            p.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => { setSelectedPayment(p); setShowPaymentModal(true); }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 ml-auto transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <PaymentModal
          paymentData={selectedPayment}
          students={students}
          onClose={() => { setShowPaymentModal(false); setSelectedPayment(null); }}
          onSave={handleSavePayment}
        />
      )}
    </div>
  );
}

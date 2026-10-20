import React, { useState, useEffect } from 'react';
import {
  FACULTY_METRICS,
  FACULTY_CLASSES,
  FACULTY_INQUIRIES,
  FACULTY_ANNOUNCEMENTS
} from '../../data/dashboardData';
import {
  getAllServiceRequests,
  updateServiceRequestStatus,
  createAnnouncement,
  getAnnouncements
} from '../../services/serviceRequestService';
import {
  BookOpen, Users, Megaphone, MessageSquare, Building2, Clock, RefreshCw, CheckCircle2
} from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function FacultyDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [inquiries, setInquiries] = useState([]);
  const [filter, setFilter] = useState('All');
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [reqs, anns] = await Promise.all([
        getAllServiceRequests().catch(() => []),
        getAnnouncements().catch(() => [])
      ]);
      if (reqs && reqs.length > 0) {
        setInquiries(reqs.map(r => ({
          id: r.id,
          student: r.student_name || 'Student',
          studentId: r.student_id || '',
          subject: r.title || r.service_type,
          date: new Date(r.created_at).toLocaleDateString(),
          status: r.status,
          details: r.details
        })));
      } else {
        setInquiries(FACULTY_INQUIRIES);
      }
      if (anns && anns.length > 0) setAnnouncements(anns);
      else setAnnouncements(FACULTY_ANNOUNCEMENTS);
    } catch {
      setInquiries(FACULTY_INQUIRIES);
      setAnnouncements(FACULTY_ANNOUNCEMENTS);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try { await updateServiceRequestStatus(id, newStatus); } catch (e) { console.warn(e); }
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    try {
      const ann = await createAnnouncement({ title: newTitle.trim(), body: newBody.trim(), category: 'Faculty Notice' });
      setAnnouncements(prev => [ann, ...prev]);
    } catch (err) { alert(err.message || 'Failed to post.'); }
    setNewTitle(''); setNewBody(''); setShowAnnModal(false);
  };

  const filteredInquiries = filter === 'All' ? inquiries : inquiries.filter(i => i.status === filter);


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {getGreeting()}, {user.name}!
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-indigo-100 font-medium">
              Faculty Portal &amp; Academic Advising Center
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20">
                <BookOpen className="w-3.5 h-3.5" />
                {user.role} ({user.studentId || 'Faculty'})
              </span>
              {user.department && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20">
                  <Building2 className="w-3.5 h-3.5" />
                  {user.department}
                </span>
              )}
            </div>
          </div>
          <button onClick={loadData} disabled={refreshing} className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync Data
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Classes', value: FACULTY_CLASSES.length, color: 'text-indigo-600' },
          { label: 'Pending Inquiries', value: inquiries.filter(i => i.status === 'Pending').length, color: 'text-amber-600' },
          { label: 'In Review', value: inquiries.filter(i => i.status === 'In Review').length, color: 'text-blue-600' },
          { label: 'Approved', value: inquiries.filter(i => i.status === 'Approved').length, color: 'text-emerald-600' },
        ].map(m => (
          <div key={m.label} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase">{m.label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Faculty Quick Access Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-3">Faculty Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              const el = document.getElementById('faculty-classes-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-3 p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl hover:bg-indigo-100/70 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">My Classes</div>
              <div className="text-[10px] text-slate-500">{FACULTY_CLASSES.length} active courses</div>
            </div>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('faculty-inquiries-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl hover:bg-blue-100/70 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Student Inquiries</div>
              <div className="text-[10px] text-slate-500">{inquiries.filter(i => i.status === 'Pending').length} pending review</div>
            </div>
          </button>

          <button
            onClick={onGoToChat}
            className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl hover:bg-emerald-100/70 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">AI Assistant</div>
              <div className="text-[10px] text-slate-500">Ask campus policies</div>
            </div>
          </button>

          <button
            onClick={onGoToProfile}
            className="flex items-center gap-3 p-3 bg-violet-50/70 border border-violet-200/80 rounded-xl hover:bg-violet-100/70 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-violet-600 text-white shadow-sm">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Faculty Profile</div>
              <div className="text-[10px] text-slate-500">Credentials & settings</div>
            </div>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Assigned Classes</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{FACULTY_METRICS.assignedClasses}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Student Inquiries</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{inquiries.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Pending Tasks</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{FACULTY_METRICS.pendingTasks}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Dept. Announcements</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{FACULTY_ANNOUNCEMENTS.length}</p>
        </div>
      </div>


      {/* Classes & Schedule Section */}
      <div id="faculty-classes-section" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100">
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Assigned Classes & Teaching Timetable</h2>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">Current Semester</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FACULTY_CLASSES.map(cls => (
            <div key={cls.id} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-300 transition-all space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cls.subject}</h3>
                  <p className="text-xs font-semibold text-indigo-600">{cls.code}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">
                  {cls.studentsEnrolled} Students
                </span>
              </div>
              <div className="flex flex-col gap-1 text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{cls.room}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Student Inquiries & Consultation Queue */}
      <div id="faculty-inquiries-section" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Student Inquiries & Consultation Queue</h2>
          </div>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['All', 'Pending', 'In Review', 'Approved'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${filter === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Inquiry / Subject</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInquiries.map(inq => (
                <tr key={inq.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{inq.student}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inq.studentId}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{inq.subject}</td>
                  <td className="py-3 px-3 text-slate-500">{inq.date}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inq.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                      inq.status === 'In Review' ? 'bg-blue-100 text-blue-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {inq.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5">
                    {inq.status === 'Pending' && (
                      <button
                        onClick={() => updateInquiryStatus(inq.id, 'In Review')}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                      >
                        Review
                      </button>
                    )}
                    {inq.status !== 'Approved' && (
                      <button
                        onClick={() => updateInquiryStatus(inq.id, 'Approved')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {inq.status === 'Approved' && (
                      <span className="text-emerald-600 font-bold text-[11px]">Approved ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


      {/* Announcements */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100">
            <Megaphone className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Faculty & Department Announcements</h2>
        </div>
        <div className="space-y-3">
          {FACULTY_ANNOUNCEMENTS.map(ann => (
            <div key={ann.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                  {ann.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>
              <p className="text-[10px] text-slate-400 font-medium pt-1">{ann.date}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}


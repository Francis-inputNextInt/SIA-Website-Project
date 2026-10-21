import React, { useState, useEffect } from 'react';
import {
  FACULTY_CLASSES
} from '../../data/dashboardData';
import {
  createAnnouncement,
  getAnnouncements,
  getMyGrades,
  upsertGrade,
  getFacultyStudents
} from '../../services/serviceRequestService';
import { supabase } from '../../services/supabase';
import {
  BookOpen, Users, Megaphone, Building2, Clock, RefreshCw,
  CheckCircle2, AlertCircle, X, Send, ChevronRight, FileText, Check, ShieldCheck, Award, Edit3
} from 'lucide-react';
import GradeModal from './GradeModal';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function ClassDetailModal({ cls, onClose }) {
  if (!cls) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{cls.code}</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{cls.subject}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Schedule</div>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              {cls.schedule}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Room & Location</div>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              {cls.room}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            Course Syllabus & Objectives
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
            {cls.syllabus || 'Comprehensive coverage of core concepts, laboratory problem-solving sessions, mid-term project evaluations, and final comprehensive examinations designed to meet departmental accreditation standards.'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Enrolled Student Roster ({cls.studentsEnrolled || cls.roster?.length || 24})
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Active Semester</span>
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {(cls.roster || [
                  { name: 'Alex Johnson', id: 'S-2024-001', standing: 'Junior' },
                  { name: 'Maria Santos', id: 'S-2024-014', standing: 'Senior' },
                  { name: 'Liam Chen', id: 'S-2024-022', standing: 'Junior' },
                  { name: 'Sophia Rodriguez', id: 'S-2024-039', standing: 'Sophomore' },
                  { name: 'Ethan Hunt', id: 'S-2024-055', standing: 'Junior' }
                ]).map((st, i) => (
                  <tr key={st.id || i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{st.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{st.id}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                        {st.standing || 'Regular'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Close Roster
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FacultyDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [announcements, setAnnouncements] = useState([]);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [gradeModalData, setGradeModalData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [anns, grds, stds] = await Promise.all([
        getAnnouncements().catch(() => []),
        getMyGrades().catch(() => []),
        getFacultyStudents().catch(() => [])
      ]);
      setAnnouncements(anns || []);
      setGrades(grds || []);
      setStudents(stds || []);
    } catch (err) {
      console.error('Failed to load faculty dashboard data:', err);
      setAnnouncements([]);
      setGrades([]);
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
        .channel('faculty-dashboard-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
          loadData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'grades' }, () => {
          loadData();
        })
        .subscribe();
    }

    return () => {
      if (subscription && supabase) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const handleSaveGrade = async (gradePayload) => {
    try {
      await upsertGrade(gradePayload);
      await loadData();
    } catch (e) {
      alert(e.message || 'Failed to save grade.');
      throw e;
    }
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    try {
      await createAnnouncement({
        title: newTitle.trim(),
        body: newBody.trim(),
        category: 'Faculty Notice',
        priority: 'medium',
        target_roles: ['Student', 'Faculty', 'Staff', 'Admin']
      });
      await loadData();
      setNewTitle('');
      setNewBody('');
      setShowAnnModal(false);
    } catch (err) {
      alert(err.message || 'Failed to post announcement to database.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {getGreeting()}, {user?.name || 'Dr. Eleanor Vance'}
            </h1>
            <p className="text-indigo-100 text-sm mt-1">
              {user?.department || 'Department of Computer Science'} · Faculty Portal & Department Hub
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 backdrop-blur-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowAnnModal(true)}
              className="px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              Post Notice
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Assigned Classes</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{FACULTY_CLASSES.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Encoded Grades</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{grades.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Dept. Announcements</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">{announcements.length}</p>
        </div>
      </div>

      <div id="faculty-classes-section" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100">
              <BookOpen className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Assigned Classes & Teaching Timetable</h2>
              <p className="text-xs text-slate-500">Click any class or timetable entry to view roster, schedule details, and syllabus.</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">Current Semester</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FACULTY_CLASSES.map(cls => (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-400 hover:bg-white hover:shadow-md transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{cls.subject}</h3>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cls.room}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    View Roster <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="faculty-grades-section" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100">
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Grade Management & Encoding</h2>
              <p className="text-xs text-slate-500">Encode, update, and publish official midterm and final grades for enrolled students.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGradeModalData({})}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Encode New Grade
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3 px-3">Student</th>
                <th className="py-3 px-3">Subject</th>
                <th className="py-3 px-3 text-center">Units</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3">Period & Term</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 font-medium">
                    No grades encoded yet. Click "Encode New Grade" to add records.
                  </td>
                </tr>
              ) : (
                grades.map(g => {
                  const studentObj = students.find(s => s.id === g.user_id);
                  return (
                    <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {studentObj?.full_name || g.student_id || 'Student ID: ' + (g.user_id?.slice(0, 8) || 'N/A')}
                        <div className="text-[10px] text-slate-400 font-mono font-normal">{g.student_id}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-indigo-600">{g.subject_code}</div>
                        <div className="text-[11px] text-slate-600">{g.subject_title}</div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono">{g.units}</td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-indigo-700 text-sm">
                        {g.grade !== null && g.grade !== undefined ? g.grade : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{g.grading_period || 'Midterm'}</div>
                        <div className="text-[10px] text-slate-500">{g.semester} · {g.academic_year}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setGradeModalData(g)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>



      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-100">
              <Megaphone className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Faculty & Department Announcements</h2>
          </div>
        </div>
        <div className="space-y-3">
          {announcements.map(ann => (
            <div key={ann.id || ann.title} className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                  {ann.category || 'Academic'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>
              <p className="text-[10px] text-slate-400 font-medium pt-1">
                {ann.date || (ann.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Recently')} {ann.posted_by ? `— Posted by ${ann.posted_by}` : ''}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Post Department Notice</h3>
              <button onClick={() => setShowAnnModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Midterm Consultation Hours Update"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Details / Body:</label>
                <textarea
                  rows={4}
                  required
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder="Enter notice details for faculty and students..."
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAnnModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Post Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ClassDetailModal cls={selectedClass} onClose={() => setSelectedClass(null)} />
      {gradeModalData !== null && (
        <GradeModal
          gradeData={gradeModalData}
          students={students}
          onClose={() => setGradeModalData(null)}
          onSave={handleSaveGrade}
        />
      )}

    </div>
  );
}


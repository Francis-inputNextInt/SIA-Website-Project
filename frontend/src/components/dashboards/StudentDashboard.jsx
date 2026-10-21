import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  MessageSquare,
  BookOpen,
  User,
  Building2,
  AlertTriangle,
  CalendarDays,
  MapPin,
  Megaphone,
  Star,
  Award,
  CircleDollarSign,
  CheckCircle2,
  Download,
  FileText,
  Printer,
  X,
} from 'lucide-react';
import {
  SCHEDULE,
  DEADLINES,
  QUICK_ACTIONS,
} from '../../data/dashboardData';
import { getAnnouncements, getMyGrades, getMyPayments } from '../../services/serviceRequestService';
import { supabase } from '../../services/supabase';

/* ── Helpers ──────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ── Icon / colour maps ───────────────────────────────────── */

const ACTION_ICONS = { MessageSquare, CalendarDays, User, Building2 };

const ACTION_COLORS = {
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'bg-blue-600 text-white',    hover: 'hover:border-blue-400' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-600 text-white', hover: 'hover:border-emerald-400' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  icon: 'bg-violet-600 text-white',  hover: 'hover:border-violet-400' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'bg-amber-500 text-white',   hover: 'hover:border-amber-400' },
};

const PRIORITY_STYLES = {
  high:   'bg-rose-50 text-rose-700 border border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low:    'bg-blue-50 text-blue-700 border border-blue-200',
};

const TYPE_STYLES = {
  assignment:   'bg-blue-100 text-blue-700',
  exam:         'bg-rose-100 text-rose-700',
  project:      'bg-violet-100 text-violet-700',
  registration: 'bg-emerald-100 text-emerald-700',
};

/* ── Section: Welcome ─────────────────────────────────────── */

function WelcomeSection({ user }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-600/20">
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, {user.name.split(' ')[0]}!
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-blue-100 font-medium">
            {getFormattedDate()}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20">
              <GraduationCap className="w-3.5 h-3.5" />
              {user.role}
            </span>
            {user.department && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20">
                <BookOpen className="w-3.5 h-3.5" />
                {user.department}
              </span>
            )}
          </div>
        </div>
        <div className="hidden sm:flex items-center justify-center">
          <div className={`w-16 h-16 rounded-2xl ${user.avatarColor || 'bg-white/20'} text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-2 ring-white/20`}>
            {user.initials || user.name.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Section: Today's Schedule ────────────────────────────── */

function ScheduleSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Today's Schedule</h2>
        </div>
        <span className="text-xs font-medium text-slate-500">{SCHEDULE.length} classes</span>
      </div>
      <div className="space-y-2.5">
        {SCHEDULE.map((item, idx) => (
          <div
            key={item.id}
            className="group flex items-start gap-3 sm:gap-4 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm transition-all duration-150"
          >
            <div className="flex flex-col items-center shrink-0 min-w-[56px] pt-0.5">
              <span className="text-xs font-bold text-blue-600">{item.time.split('\u2013')[0].trim()}</span>
              <span className="text-[10px] text-slate-400 font-medium">{item.time.split('\u2013')[1]?.trim()}</span>
              {idx === 0 && (
                <span className="mt-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 rounded-md">
                  Now
                </span>
              )}
            </div>
            <div className="w-px self-stretch bg-slate-200 group-hover:bg-blue-300 transition-colors shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{item.subject}</h3>
                  <p className="text-xs text-slate-500 font-medium">{item.code}</p>
                </div>
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-600 border border-slate-200">
                  {item.type}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {item.room}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {item.instructor}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Section: Upcoming Deadlines ──────────────────────────── */

function DeadlinesSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-100">
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Upcoming Deadlines</h2>
        </div>
        <span className="text-xs font-medium text-slate-500">{DEADLINES.length} due</span>
      </div>
      <div className="space-y-2.5">
        {DEADLINES.map((dl) => (
          <div
            key={dl.id}
            className={`p-3.5 bg-slate-50/80 rounded-xl border transition-all duration-150 hover:shadow-sm ${
              dl.urgent
                ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/60'
                : 'border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{dl.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{dl.course}</p>
              </div>
              {dl.urgent && (
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-2.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${TYPE_STYLES[dl.type] || 'bg-slate-100 text-slate-600'}`}>
                {dl.type.charAt(0).toUpperCase() + dl.type.slice(1)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">{dl.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Section: Announcements ───────────────────────────────── */

function AnnouncementsSection({ announcements = [], loading = false, error = null, onRefresh }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100">
            <Megaphone className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Announcements</h2>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Refresh
            </button>
          )}
          <span className="text-xs font-medium text-slate-500">
            {loading ? 'Loading...' : `${announcements.length} published`}
          </span>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          Loading published announcements from database...
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          {onRefresh && (
            <button onClick={onRefresh} className="underline font-semibold">Retry</button>
          )}
        </div>
      )}

      {!loading && !error && announcements.length === 0 && (
        <div className="py-8 text-center text-slate-400 text-xs">
          No announcements published for students at this time.
        </div>
      )}

      {!loading && !error && announcements.length > 0 && (
        <div className="space-y-2.5">
          {announcements.map((ann) => {
            const dateStr = ann.date || (ann.created_at ? new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent');
            const priorityVal = ann.priority || 'medium';
            const categoryVal = ann.category || 'General';
            const authorVal = ann.posted_by || ann.posted_by_email;
            return (
              <div
                key={ann.id || ann.title}
                className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{ann.title}</h3>
                  <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRIORITY_STYLES[priorityVal] || PRIORITY_STYLES.low}`}>
                    {priorityVal}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{ann.body}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full font-semibold bg-white text-slate-600 border border-slate-200">
                    {categoryVal}
                  </span>
                  <span className="text-slate-400 font-medium">{dateStr}</span>
                  {authorVal && (
                    <span className="text-slate-500 font-medium ml-auto">
                      Posted by <strong className="text-slate-700">{authorVal}</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ── Section: Quick Actions ───────────────────────────────── */

function QuickActionsSection({ onGoToChat, onGoToProfile, onGoToServices }) {
  const [expandedId, setExpandedId] = useState(null);

  const actions = [
    { ...QUICK_ACTIONS[0], onClick: onGoToChat },
    { ...QUICK_ACTIONS[1], onClick: () => {} },
    { ...QUICK_ACTIONS[2], onClick: onGoToProfile },
    { ...QUICK_ACTIONS[3], onClick: onGoToServices },
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-emerald-100">
          <Star className="w-4 h-4 text-emerald-600" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {actions.map((action) => {
          const IconComp = ACTION_ICONS[action.icon] || MessageSquare;
          const colors = ACTION_COLORS[action.color] || ACTION_COLORS.blue;
          const isExpanded = expandedId === action.id;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                setExpandedId((prev) => (prev === action.id ? null : action.id));
                action.onClick();
              }}
              onMouseEnter={() => setExpandedId(action.id)}
              onMouseLeave={() => setExpandedId(null)}
              className={`group flex flex-col items-center text-center p-3 sm:p-4 rounded-xl border ${colors.bg} ${colors.border} ${colors.hover} transition-all duration-200 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${isExpanded ? 'shadow-sm' : ''}`}
            >
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${colors.icon} flex items-center justify-center mb-1.5 sm:mb-2 shadow-sm group-hover:scale-105 transition-transform`}>
                <IconComp className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 leading-tight">{action.title}</h3>
              {/* Description — hidden by default, expands on hover (desktop) or tap (mobile) */}
              <div
                className={`grid transition-all duration-200 ease-in-out group-hover:grid-rows-[1fr] group-hover:opacity-100 ${
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-snug pt-1.5">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SummaryCardsSection({ grades, payments }) {
  const validGrades = grades.filter(g => g.grade !== null && g.grade !== undefined && !isNaN(Number(g.grade)));
  const avgGrade = validGrades.length > 0
    ? (validGrades.reduce((sum, g) => sum + Number(g.grade), 0) / validGrades.length).toFixed(2)
    : 'N.A.';

  const totalFees = payments.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
  const totalBalance = payments.reduce((sum, p) => sum + Number(p.remaining_balance || 0), 0);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GPA / Average</div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{avgGrade}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">● Excellent Standing</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <CircleDollarSign className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Fees</div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">₱{totalFees.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">1st Sem AY 2026-2027</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Paid</div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-0.5">₱{totalPaid.toLocaleString()}</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Verified Receipts</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Balance Due</div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-700 mt-0.5">₱{totalBalance.toLocaleString()}</div>
          <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Due: Nov 15, 2026</div>
        </div>
      </div>
    </div>
  );
}

function PdfModal({ type, data, user, onClose }) {
  if (!type) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-extrabold text-slate-900">
              {type === 'grades' ? 'Official Grade Report Preview' : 'Official Statement of Account'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors">
              <Printer className="w-4 h-4" /> Print PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-6 text-slate-800">
          <div className="text-center space-y-1 pb-4 border-b border-slate-200">
            <h3 className="text-lg font-black tracking-tight text-slate-900">UNIVERSITY OF ADVANCED TECHNOLOGY</h3>
            <p className="text-xs text-slate-500 font-medium">Office of the Registrar & Accounting</p>
            <p className="text-xs font-bold text-blue-600 uppercase pt-1">
              {type === 'grades' ? 'CERTIFIED STUDENT GRADE REPORT' : 'STUDENT STATEMENT OF ACCOUNT'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div><span className="text-slate-400 block font-bold uppercase text-[10px]">Student Name</span><span className="font-extrabold text-slate-900 text-sm">{user.name}</span></div>
            <div><span className="text-slate-400 block font-bold uppercase text-[10px]">Student ID</span><span className="font-mono font-bold text-slate-900 text-sm">{user.studentId || '2024-00842'}</span></div>
          </div>

          {type === 'grades' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 bg-slate-50">
                  <th className="py-2 px-2">Code</th><th className="py-2 px-2">Title</th><th className="py-2 px-2 text-center">Units</th><th className="py-2 px-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.grades || []).map(g => (
                  <tr key={g.subject_code}>
                    <td className="py-2 px-2 font-mono font-bold">{g.subject_code}</td>
                    <td className="py-2 px-2 font-semibold">{g.subject_title}</td>
                    <td className="py-2 px-2 text-center font-mono">{g.units}</td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-blue-600">{g.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 bg-slate-50">
                  <th className="py-2 px-2">Fee Type</th><th className="py-2 px-2 text-right">Total</th><th className="py-2 px-2 text-right">Paid</th><th className="py-2 px-2 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data.payments || []).map(p => (
                  <tr key={p.fee_type}>
                    <td className="py-2 px-2 font-semibold">{p.fee_type}</td>
                    <td className="py-2 px-2 text-right font-mono">₱{Number(p.total_amount).toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-mono text-emerald-700">₱{Number(p.amount_paid).toLocaleString()}</td>
                    <td className="py-2 px-2 text-right font-mono text-amber-700">₱{Number(p.remaining_balance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────── */

export default function StudentDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [announcements, setAnnouncements] = useState([]);
  const [grades, setGrades] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfModalType, setPdfModalType] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [anns, grds, pyms] = await Promise.all([
        getAnnouncements().catch(() => []),
        getMyGrades().catch(() => []),
        getMyPayments().catch(() => [])
      ]);

      const filteredAnns = (anns || []).filter(ann => {
        if (!ann.target_roles || ann.target_roles.length === 0) return true;
        return ann.target_roles.includes('Student') || ann.target_roles.includes('All');
      });
      setAnnouncements(filteredAnns);
      setGrades(grds || []);
      setPayments(pyms || []);
    } catch (err) {
      setError(err.message || 'Failed to load student data.');
      setGrades([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    let subscription = null;
    if (supabase) {
      subscription = supabase
        .channel('public:student_data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
          fetchData();
        })
        .subscribe();
    }

    return () => {
      if (subscription && supabase) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <WelcomeSection user={user} />

      <SummaryCardsSection grades={grades} payments={payments} />

      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview & Schedule
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'grades'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          My Grades
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CircleDollarSign className="w-4 h-4" />
          My Payments
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
            <QuickActionsSection onGoToChat={onGoToChat} onGoToProfile={onGoToProfile} onGoToServices={onGoToServices} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
                <ScheduleSection />
              </div>
            </div>
            <div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
                <DeadlinesSection />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
            <AnnouncementsSection
              announcements={announcements}
              loading={loading}
              error={error}
              onRefresh={fetchData}
            />
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Academic Grades & Records</h2>
              <p className="text-xs text-slate-500">1st Semester, Academic Year 2026–2027</p>
            </div>
            <button
              onClick={() => setPdfModalType('grades')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Grade Report (PDF)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-400 bg-slate-50/70">
                  <th className="py-3 px-3">Subject Code</th>
                  <th className="py-3 px-3">Subject Title</th>
                  <th className="py-3 px-3 text-center">Units</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-center">Letter</th>
                  <th className="py-3 px-3">Grading Period</th>
                  <th className="py-3 px-3">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No grade records found.
                    </td>
                  </tr>
                ) : grades.map((g) => (
                  <tr key={g.id || g.subject_code} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{g.subject_code}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{g.subject_title}</td>
                    <td className="py-3 px-3 text-center font-mono">{g.units}</td>
                    <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-600 text-sm">{g.grade}</td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">{g.letter_grade}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{g.grading_period || 'Midterm'}</td>
                    <td className="py-3 px-3 text-slate-600">{g.faculty_name || 'Dr. Faculty'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Tuition & Financial Payments</h2>
              <p className="text-xs text-slate-500">Account Status & Payment History</p>
            </div>
            <button
              onClick={() => setPdfModalType('payments')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Statement (PDF)
            </button>
          </div>

          <div className="space-y-4">
            {payments.map((p) => (
              <div key={p.id || p.fee_type} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{p.academic_year} · {p.semester}</span>
                    <h3 className="text-base font-extrabold text-slate-900">{p.fee_type}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Total Amount</span>
                    <div className="text-sm font-extrabold font-mono text-slate-900 mt-0.5">₱{Number(p.total_amount).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Amount Paid</span>
                    <div className="text-sm font-extrabold font-mono text-emerald-700 mt-0.5">₱{Number(p.amount_paid).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Remaining Balance</span>
                    <div className="text-sm font-extrabold font-mono text-amber-700 mt-0.5">₱{Number(p.remaining_balance).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Due Date</span>
                    <div className="text-xs font-semibold text-slate-700 mt-0.5">{p.due_date || 'Nov 15, 2026'}</div>
                  </div>
                </div>

                {p.payment_history && p.payment_history.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase">Payment Transaction History</h4>
                    <div className="space-y-1.5">
                      {p.payment_history.map((hist, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span className="font-semibold text-slate-800">{hist.channel}</span>
                            <span className="text-slate-400 font-mono text-[11px]">({hist.reference_no})</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-700">₱{Number(hist.amount).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{hist.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <PdfModal
        type={pdfModalType}
        data={{ grades, payments }}
        user={user}
        onClose={() => setPdfModalType(null)}
      />
    </div>
  );
}


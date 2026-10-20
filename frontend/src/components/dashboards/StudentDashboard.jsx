import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  SCHEDULE,
  DEADLINES,
  ANNOUNCEMENTS,
  QUICK_ACTIONS,
} from '../../data/dashboardData';

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

function AnnouncementsSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-100">
            <Megaphone className="w-4 h-4 text-violet-600" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Announcements</h2>
        </div>
        <span className="text-xs font-medium text-slate-500">{ANNOUNCEMENTS.length} new</span>
      </div>
      <div className="space-y-2.5">
        {ANNOUNCEMENTS.map((ann) => (
          <div
            key={ann.id}
            className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm transition-all duration-150"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{ann.title}</h3>
              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.low}`}>
                {ann.priority}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{ann.body}</p>
            <div className="flex items-center gap-2 mt-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-600 border border-slate-200">
                {ann.category}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{ann.date}</span>
            </div>
          </div>
        ))}
      </div>
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

/* ── Main Dashboard ───────────────────────────────────────── */

export default function StudentDashboard({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <WelcomeSection user={user} />
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
        <AnnouncementsSection />
      </div>
    </div>
  );
}


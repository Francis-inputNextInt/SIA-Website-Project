import React from 'react';
import { ShieldX, GraduationCap, LogOut, Info } from 'lucide-react';

/**
 * Access Restricted screen — shown after sign-in when the user is NOT enrolled
 * (e.g. Applicants / prospective students or personal-email accounts).
 * Communicates that the AI Campus Assistant is exclusive to enrolled
 * students and faculty staff, and blocks access to the chat.
 */
export default function AccessDenied({ user, onLogout }) {
  if (!user) return null;

  return (
    <main className="flex-1 flex items-center justify-center min-h-0 bg-slate-50/50 p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 p-6 sm:p-8 text-center animate-slide-up">
        {/* Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <ShieldX className="w-7 h-7 text-rose-500" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          The AI Campus Assistant is <span className="font-semibold text-slate-800">exclusive</span> to
          enrolled students and faculty staff. Your account isn't listed as an enrolled
          campus member, so the assistant is unavailable to you.
        </p>

        {/* Access severity banner */}
        <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-left flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <span className="font-semibold">Exclusive access:</span> only enrolled students and
            teachers / faculty staff can use the Campus Assistant — unenrolled students are not allowed.
          </p>
        </div>

        {/* Signed-in as card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${user.avatarColor || 'bg-slate-500'} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
              {user.initials || user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-600 border border-slate-200">
              {user.role}
            </span>
            {user.studentId ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-600 border border-slate-200">
                {user.studentId}
              </span>
            ) : null}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              Not Enrolled
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500 leading-relaxed">
          If you believe this is a mistake, please contact the campus registrar or IT office
          to verify your enrollment status.
        </p>

        {/* Sign out */}
        <button
          type="button"
          onClick={onLogout}
          className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-700 rounded-xl shadow-md shadow-slate-900/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900/30"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <p className="mt-4 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5" />
          Campus AI Assistant · Enrolled members only
        </p>
      </div>
    </main>
  );
}
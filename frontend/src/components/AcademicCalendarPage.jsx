import React, { useState } from 'react';
import { ArrowLeft, CalendarDays, Calendar, Search, Download, AlertTriangle } from 'lucide-react';
import { ACADEMIC_CALENDAR_EVENTS } from '../data/dashboardData';

const CAT = { Academic: 'bg-blue-100 text-blue-700', Examinations: 'bg-rose-100 text-rose-700', Registration: 'bg-emerald-100 text-emerald-700', Holidays: 'bg-amber-100 text-amber-700' };

export default function AcademicCalendarPage({ user, onBack, showToast }) {
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('All');

  const list = ACADEMIC_CALENDAR_EVENTS.filter(e => 
    (e.title.toLowerCase().includes(q.toLowerCase()) || e.description.toLowerCase().includes(q.toLowerCase())) &&
    (term === 'All' || e.term === term)
  );

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <button type="button" onClick={onBack} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </button>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center shrink-0"><CalendarDays className="w-5 h-5 text-white" /></div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Academic Calendar</h1>
              </div>
              <p className="text-emerald-100 text-sm sm:text-base font-medium max-w-xl">
                Official schedule of academic terms, registration periods, examinations, and holidays for AY 2026–2027.
              </p>
            </div>
            <button type="button" onClick={() => showToast?.({ type: 'success', title: 'Calendar Exported', message: 'Calendar downloaded successfully.' })}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-xs sm:text-sm hover:bg-emerald-50 shadow-sm shrink-0">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search events..." value={q} onChange={(e) => setQ(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium" />
            </div>
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {['All', '1st Semester', '2nd Semester', 'Summer'].map((t) => (
                <button key={t} type="button" onClick={() => setTerm(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${term === t ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-600 uppercase tracking-wider">Showing {list.length} Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {list.map((ev) => (
              <div key={ev.id} onClick={() => showToast?.({ type: 'success', title: ev.title, message: `${ev.date} — ${ev.description}` })}
                className="group bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${CAT[ev.category] || 'bg-slate-100 text-slate-700'}`}>{ev.category}</span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{ev.term}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{ev.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-2">{ev.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold"><Calendar className="w-3.5 h-3.5" /> <span>{ev.date}</span></div>
                  {ev.urgent && <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-[10px] flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Important</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

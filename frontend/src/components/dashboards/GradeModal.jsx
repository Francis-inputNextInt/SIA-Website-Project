import React, { useState } from 'react';
import { X, Check, RefreshCw, BookOpen } from 'lucide-react';

export default function GradeModal({ gradeData, students, onClose, onSave }) {
  const [form, setForm] = useState(gradeData?.id ? gradeData : {
    id: null, user_id: '', student_id: '', subject_code: 'CS 101', subject_title: 'Intro to Computing',
    units: 3.0, grade: '1.25', letter_grade: 'A', grading_period: 'Midterm', semester: '1st Semester', academic_year: '2026–2027'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_id || !form.subject_code) { setError('Select student & code.'); return; }
    try { setSaving(true); setError(null); await onSave(form); onClose(); }
    catch (err) { setError(err.message || 'Save failed.'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-600"/><h2 className="text-lg font-extrabold text-slate-900">{form.id ? 'Edit Grade' : 'Encode Grade'}</h2></div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student</label>
            <select value={form.user_id} onChange={e => {
              const s = students.find(st => st.id === e.target.value);
              setForm({ ...form, user_id: e.target.value, student_id: s?.student_id || form.student_id });
            }} required className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <option value="">-- Choose Student --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Code</label>
              <input type="text" value={form.subject_code} onChange={e => setForm({ ...form, subject_code: e.target.value })} required placeholder="CS 101" className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Units</label>
              <input type="number" step="0.5" min="1" max="6" value={form.units} onChange={e => setForm({ ...form, units: parseFloat(e.target.value) || 3.0 })} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
            <input type="text" value={form.subject_title} onChange={e => setForm({ ...form, subject_title: e.target.value })} required placeholder="Intro to Computing" className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
              <input type="text" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="1.25" className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-indigo-600" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Letter</label>
              <select value={form.letter_grade} onChange={e => setForm({ ...form, letter_grade: e.target.value })} className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                {['A', 'B', 'C', 'D', 'F'].map(lg => <option key={lg} value={lg}>{lg}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
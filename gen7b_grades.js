const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part7b_grades = `
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
`;

fs.appendFileSync(path, part7b_grades, 'utf8');
console.log('gen7b_grades done');

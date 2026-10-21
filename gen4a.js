const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part4a = `
function PdfModal({ type, data, user, onClose }) {
  if (!type) return null;

  const handlePrint = () => {
    window.print();
  };

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
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white border border-slate-200 space-y-6 text-slate-800">
          <div className="text-center space-y-1 pb-4 border-b border-slate-200">
            <h3 className="text-lg font-black tracking-tight text-slate-900">UNIVERSITY OF ADVANCED TECHNOLOGY</h3>
            <p className="text-xs text-slate-500 font-medium">Office of the Registrar & Accounting Services</p>
            <p className="text-xs font-bold text-blue-600 uppercase pt-1">
              {type === 'grades' ? 'CERTIFIED STUDENT GRADE REPORT' : 'STUDENT STATEMENT OF ACCOUNT & PAYMENTS'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Student Name</span>
              <span className="font-extrabold text-slate-900 text-sm">{user.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Student ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{user.studentId || '2024-00842'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Department / Program</span>
              <span className="font-semibold text-slate-800">{user.department || 'College of Computing Studies'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold uppercase text-[10px]">Academic Term</span>
              <span className="font-semibold text-slate-800">1st Semester, AY 2026–2027</span>
            </div>
          </div>
`;

fs.appendFileSync(path, part4a, 'utf8');
console.log('gen4a done');

const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part3 = `
function SummaryCardsSection({ grades, payments }) {
  const validGrades = grades.filter(g => g.grade !== null && !isNaN(g.grade));
  const avgGrade = validGrades.length > 0
    ? (validGrades.reduce((sum, g) => sum + Number(g.grade), 0) / validGrades.length).toFixed(2)
    : '1.45';

  const totalFees = payments.reduce((sum, p) => sum + Number(p.total_amount || 0), 0) || 43700;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0) || 30500;
  const totalBalance = payments.reduce((sum, p) => sum + Number(p.remaining_balance || 0), 0) || 13200;

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
`;

fs.appendFileSync(path, part3, 'utf8');
console.log('gen3 done');

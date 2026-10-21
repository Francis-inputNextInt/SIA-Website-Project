const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part4b = `
          {type === 'grades' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500">Enrolled Courses & Final Grades</h4>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Subject Title</th>
                    <th className="py-2.5 px-3 text-center">Units</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                    <th className="py-2.5 px-3">Instructor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.grades || []).map(g => (
                    <tr key={g.id || g.subject_code}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{g.subject_code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{g.subject_title}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{g.units}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-600">{g.grade}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px]">{g.faculty_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pt-2 flex justify-between items-center text-xs font-bold text-slate-700 border-t border-slate-200">
                <span>General Point Average (GPA): <strong className="text-blue-600 font-mono text-sm">1.44</strong></span>
                <span>Status: <strong className="text-emerald-600">Regular / Good Standing</strong></span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-500">Tuition & Fee Breakdown</h4>
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase text-slate-500 bg-slate-50">
                    <th className="py-2.5 px-3">Fee Description</th>
                    <th className="py-2.5 px-3 text-right">Total Amount</th>
                    <th className="py-2.5 px-3 text-right">Amount Paid</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data.payments || []).map(p => (
                    <tr key={p.id || p.fee_type}>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.fee_type}</td>
                      <td className="py-2.5 px-3 text-right font-mono">₱{Number(p.total_amount).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-700">₱{Number(p.amount_paid).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-700">₱{Number(p.remaining_balance).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-[11px]">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
            <div>
              <p className="font-semibold text-slate-800">Generated via AI Campus Student Portal</p>
              <p>Date Generated: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-center space-y-4">
              <div className="border-b border-slate-400 w-48 pb-1 font-bold text-slate-900">ATTY. MARIE SANTOS</div>
              <p className="text-[10px] text-slate-400 uppercase">Registrar / Cashier Authorized Signature</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
`;

fs.appendFileSync(path, part4b, 'utf8');
console.log('gen4b done');

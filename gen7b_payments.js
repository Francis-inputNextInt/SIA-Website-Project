const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part7b_payments = `
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
                  <span className={\`px-3 py-1 rounded-full text-xs font-bold \${
                    p.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    p.status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }\`}>
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
`;

fs.appendFileSync(path, part7b_payments, 'utf8');
console.log('gen7b_payments done');

import React, { useState } from 'react';
import { X, Check, RefreshCw, CircleDollarSign } from 'lucide-react';

export default function PaymentModal({ paymentData, students = [], onClose, onSave }) {
  const [form, setForm] = useState(paymentData?.id ? paymentData : {
    id: null,
    user_id: '',
    student_id: '',
    fee_type: 'Tuition Fee',
    total_amount: 25000,
    amount_paid: 0,
    due_date: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
    semester: '1st Semester',
    academic_year: '2026–2027',
    payment_history: []
  });
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [paymentChannel, setPaymentChannel] = useState('Campus Cashier');
  const [referenceNo, setReferenceNo] = useState(`OR-${Math.floor(100000 + Math.random() * 900000)}`);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_id) { setError('Please select a student.'); return; }
    try {
      setSaving(true);
      setError(null);
      let updatedHistory = [...(form.payment_history || [])];
      let paid = parseFloat(form.amount_paid) || 0;

      if (newPaymentAmount && parseFloat(newPaymentAmount) > 0) {
        const addAmount = parseFloat(newPaymentAmount);
        paid += addAmount;
        updatedHistory.unshift({
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          amount: addAmount,
          reference_no: referenceNo || `OR-${Math.floor(100000 + Math.random() * 900000)}`,
          channel: paymentChannel || 'Campus Cashier'
        });
      }

      await onSave({ ...form, amount_paid: paid, payment_history: updatedHistory });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save payment record.');
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-extrabold text-slate-900">
              {form.id ? 'Update Payment Record' : 'Record New Student Payment'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Student *</label>
            <select
              value={form.user_id}
              onChange={e => {
                const s = students.find(st => st.id === e.target.value);
                setForm({ ...form, user_id: e.target.value, student_id: s?.student_id || form.student_id });
              }}
              required
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800"
            >
              <option value="">-- Choose Student --</option>
              {students && students.length > 0 ? (
                students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} {s.student_id ? `(${s.student_id})` : s.email ? `(${s.email})` : ''}
                  </option>
                ))
              ) : (
                <option value="" disabled>No students found in database</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fee Type</label>
              <select
                value={form.fee_type}
                onChange={e => setForm({ ...form, fee_type: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800"
              >
                {['Tuition Fee', 'Laboratory Fee', 'Miscellaneous Fee', 'Graduation Fee', 'Dormitory Fee', 'Other'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Amount (₱)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.total_amount}
                onChange={e => setForm({ ...form, total_amount: parseFloat(e.target.value) || 0 })}
                required
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">Record Payment (₱)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newPaymentAmount}
                onChange={e => setNewPaymentAmount(e.target.value)}
                placeholder="Amount to pay now"
                className="w-full p-2 rounded-xl border border-emerald-200 bg-white text-xs font-mono font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">Payment Channel</label>
              <select
                value={paymentChannel}
                onChange={e => setPaymentChannel(e.target.value)}
                className="w-full p-2 rounded-xl border border-emerald-200 bg-white text-xs text-slate-800"
              >
                {['Campus Cashier', 'Online Banking (BPI)', 'GCash Gateway', 'Maya Wallet', 'Bank Deposit'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reference No.</label>
              <input
                type="text"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                placeholder="OR-123456"
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={form.due_date ? form.due_date.split('T')[0] : ''}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={form.semester}
                onChange={e => setForm({ ...form, semester: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              >
                {['1st Semester', '2nd Semester', 'Summer Term'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                value={form.academic_year}
                onChange={e => setForm({ ...form, academic_year: e.target.value })}
                className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


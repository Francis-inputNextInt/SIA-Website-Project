import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle2, Loader2, FileText, Info } from 'lucide-react';
import { createServiceRequest } from '../services/serviceRequestService';


const INPUT = 'w-full bg-white text-slate-800 placeholder-slate-400 text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-slate-50 disabled:opacity-60';
const SELECT = INPUT + ' cursor-pointer';
const LABEL = 'block text-sm font-semibold text-slate-700 mb-1.5';

function Field({ label, hint, children }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function SuccessBanner({ title, message, onDone }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 font-medium mt-1 max-w-sm">{message}</p>
      </div>
      <button type="button" onClick={onDone}
        className="mt-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30">
        Back to Services
      </button>
    </div>
  );
}

function SubmitBtn({ busy }) {
  return (
    <button type="submit" disabled={busy}
      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30">
      {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Request</>}
    </button>
  );
}

function FormWrap({ service, children, onSubmit, busy, done, doneTitle, doneMsg, onBack }) {
  const Icon = service && service.icon ? service.icon : FileText;
  if (done) return <SuccessBanner title={doneTitle} message={doneMsg} onDone={onBack} />;
  const border = service && service.color ? service.color.border : 'border-blue-200';
  const bg = service && service.color ? service.color.bg : 'bg-blue-50';
  const icon = service && service.color ? service.color.icon : 'bg-blue-600';
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${border} ${bg}`}>
        <div className={`w-9 h-9 rounded-xl ${icon} text-white flex items-center justify-center shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{service && service.title}</p>
          <p className="text-xs text-slate-500 font-medium">{service && service.description}</p>
        </div>
      </div>
      {children}
      <SubmitBtn busy={busy} />
    </form>
  );
}

function EnrollmentForm({ service, onBack, onSubmitted }) {
  const [sem, setSem] = useState('1st Semester');
  const [ay, setAy] = useState('2026-2027');
  const [type, setType] = useState('Regular Enrollment');
  const [subjects, setSubjects] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const title = `Enrollment - ${sem} ${ay} (${type})`;
      const details = `Type: ${type}\nSubjects:\n${subjects || 'None'}\nNotes: ${notes || 'None'}`;
      const metadata = { sem, ay, enrollment_type: type, subjects, notes };
      const req = await createServiceRequest({ service_type: 'enrollment', title, details, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit enrollment request.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="Enrollment Request Submitted" doneMsg="Your enrollment request has been received. Please wait for confirmation.">
      <Field label="Semester">
        <select value={sem} onChange={e => setSem(e.target.value)} className={SELECT}>
          {["1st Semester","2nd Semester","Summer"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Academic Year">
        <select value={ay} onChange={e => setAy(e.target.value)} className={SELECT}>
          {["2025-2026","2026-2027","2027-2028"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Enrollment Type">
        <select value={type} onChange={e => setType(e.target.value)} className={SELECT}>
          {["Regular Enrollment","Irregular Enrollment","Adding of Subject","Dropping of Subject","Cross-Enrollment"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Subjects (optional)" hint="List subject codes to add or drop, one per line.">
        <textarea value={subjects} onChange={e => setSubjects(e.target.value)} rows={3} placeholder="e.g. CS 301, MATH 210" className={INPUT} />
      </Field>
      <Field label="Additional Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special instructions..." className={INPUT} />
      </Field>
    </FormWrap>
  );
}

function RequestDocumentsForm({ service, onBack, onSubmitted }) {
  const [docType, setDocType] = useState('Certificate of Registration (COR)');
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState('1');
  const [release, setRelease] = useState('On-site Pickup');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!purpose.trim()) return;
    setBusy(true);
    try {
      const title = `Document - ${docType}`;
      const details = `Purpose: ${purpose}\nCopies: ${copies}\nRelease: ${release}\nNotes: ${notes || 'None'}`;
      const metadata = { docType, purpose, copies, release, notes };
      const req = await createServiceRequest({ service_type: 'document', title, details, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit document request.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="Document Request Submitted" doneMsg={`Your request for ${docType} has been received. Processing time is 3-5 working days.`}>
      <Field label="Document Type">
        <select value={docType} onChange={e => setDocType(e.target.value)} className={SELECT}>
          {["Certificate of Registration (COR)","Certificate of Enrollment","Certificate of Grades","Good Moral Certificate","Certified True Copy (CTC)","Transcript of Records (TOR)"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Purpose *">
        <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="e.g. Scholarship application" required className={INPUT} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Copies"><select value={copies} onChange={e => setCopies(e.target.value)} className={SELECT}>{["1","2","3","4","5"].map(o=><option key={o}>{o}</option>)}</select></Field>
        <Field label="Release"><select value={release} onChange={e => setRelease(e.target.value)} className={SELECT}>{["On-site Pickup","Email (Soft Copy)","Courier Delivery"].map(o=><option key={o}>{o}</option>)}</select></Field>
      </div>
      <Field label="Additional Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special instructions..." className={INPUT} />
      </Field>
    </FormWrap>
  );
}

function TranscriptForm({ service, onBack, onSubmitted }) {
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState('1');
  const [release, setRelease] = useState('On-site Pickup');
  const [addressee, setAddressee] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!purpose) return;
    setBusy(true);
    try {
      const title = 'Transcript of Records (TOR)';
      const details = `Purpose: ${purpose}\nAddressee: ${addressee || 'None'}\nCopies: ${copies}\nRelease: ${release}\nNotes: ${notes || 'None'}`;
      const metadata = { purpose, addressee, copies, release, notes };
      const req = await createServiceRequest({ service_type: 'transcript', title, details, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit transcript request.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="TOR Request Submitted" doneMsg="Your Transcript of Records request has been received. Processing time is 5-7 working days.">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        Transcript requests require a clearance. Ensure your account has no outstanding balance before submitting.
      </div>
      <Field label="Purpose *">
        <select value={purpose} onChange={e => setPurpose(e.target.value)} required className={SELECT}>
          <option value="">Select purpose...</option>
          {["Employment","Further Studies / Graduate School","Board Examination","Transfer to Another School","Scholarship","Personal Record"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Addressee / Institution" hint="Name of company, school, or board that will receive the TOR.">
        <input type="text" value={addressee} onChange={e => setAddressee(e.target.value)} placeholder="e.g. University of the Philippines" className={INPUT} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Copies"><select value={copies} onChange={e => setCopies(e.target.value)} className={SELECT}>{["1","2","3","4","5"].map(o=><option key={o}>{o}</option>)}</select></Field>
        <Field label="Release"><select value={release} onChange={e => setRelease(e.target.value)} className={SELECT}>{["On-site Pickup","Courier Delivery","Sealed / Mailed Directly"].map(o=><option key={o}>{o}</option>)}</select></Field>
      </div>
      <Field label="Additional Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special instructions..." className={INPUT} />
      </Field>
    </FormWrap>
  );
}

function CertificateForm({ service, onBack, onSubmitted }) {
  const [certType, setCertType] = useState('Certificate of Enrollment');
  const [purpose, setPurpose] = useState('');
  const [copies, setCopies] = useState('1');
  const [release, setRelease] = useState('On-site Pickup');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!purpose) return;
    setBusy(true);
    try {
      const title = `Certificate - ${certType}`;
      const details = `Purpose: ${purpose}\nCopies: ${copies}\nRelease: ${release}\nNotes: ${notes || 'None'}`;
      const metadata = { certType, purpose, copies, release, notes };
      const req = await createServiceRequest({ service_type: 'certificate', title, details, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit certificate request.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="Certificate Request Submitted" doneMsg={`Your ${certType} request has been received. Processing time is 3-5 working days.`}>
      <Field label="Certificate Type">
        <select value={certType} onChange={e => setCertType(e.target.value)} className={SELECT}>
          {["Certificate of Enrollment","Certificate of Graduation","Certificate of Completion","Good Moral Certificate","Certificate of Residency","Honorable Dismissal"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Purpose *">
        <select value={purpose} onChange={e => setPurpose(e.target.value)} required className={SELECT}>
          <option value="">Select purpose...</option>
          {["Scholarship","Employment","Travel / Visa Application","Further Studies","Government Requirement","Bank / Loan Application","Personal Record"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Copies"><select value={copies} onChange={e => setCopies(e.target.value)} className={SELECT}>{["1","2","3","4","5"].map(o=><option key={o}>{o}</option>)}</select></Field>
        <Field label="Release"><select value={release} onChange={e => setRelease(e.target.value)} className={SELECT}>{["On-site Pickup","Email (Soft Copy)","Courier Delivery"].map(o=><option key={o}>{o}</option>)}</select></Field>
      </div>
      <Field label="Additional Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special instructions..." className={INPUT} />
      </Field>
    </FormWrap>
  );
}

function ScholarshipForm({ service, onBack, onSubmitted }) {
  const [action, setAction] = useState('Apply for Scholarship');
  const [schType, setSchType] = useState('Academic Excellence Scholarship');
  const [gwa, setGwa] = useState('');
  const [units, setUnits] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const title = `Scholarship - ${action} (${schType})`;
      const details = `Action: ${action}\nType: ${schType}\nGWA: ${gwa || 'N/A'}\nUnits: ${units || 'N/A'}\nNotes: ${notes || 'None'}`;
      const metadata = { action, schType, gwa, units, notes };
      const req = await createServiceRequest({ service_type: 'scholarship', title, details, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit scholarship request.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="Scholarship Request Submitted" doneMsg="Your scholarship request has been forwarded to the Student Affairs Office.">
      <Field label="Request Type">
        <select value={action} onChange={e => setAction(e.target.value)} className={SELECT}>
          {["Apply for Scholarship","Check Scholarship Status","Renew Scholarship","Scholarship Inquiry"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Scholarship Type">
        <select value={schType} onChange={e => setSchType(e.target.value)} className={SELECT}>
          {["Academic Excellence Scholarship","Financial Assistance Grant","Government Scholarship (CHED)","Sports Scholarship","Student Assistance Fund","External Scholarship"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Current GWA" hint="General Weighted Average"><input type="number" step="0.01" min="1" max="5" value={gwa} onChange={e => setGwa(e.target.value)} placeholder="e.g. 1.50" className={INPUT} /></Field>
        <Field label="Units Enrolled"><input type="number" min="1" max="30" value={units} onChange={e => setUnits(e.target.value)} placeholder="e.g. 18" className={INPUT} /></Field>
      </div>
      <Field label="Additional Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Supporting details..." className={INPUT} />
      </Field>
    </FormWrap>
  );
}

function ClearanceForm({ service, onBack, onSubmitted }) {
  const [clearType, setClearType] = useState('End-of-Semester Clearance');
  const [sem, setSem] = useState('1st Semester 2026-2027');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const title = `Clearance - ${clearType}`;
      const details = `Semester: ${sem}\nNotes: ${notes || 'None'}`;
      const metadata = { clearType, sem, notes };
      const req = await createServiceRequest({ service_type: 'clearance', title, details, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit clearance request.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="Clearance Request Submitted" doneMsg="Your clearance request has been received. Visit relevant offices.">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        Clearance requires sign-off from the Library, Accounting, and your Department.
      </div>
      <Field label="Clearance Type">
        <select value={clearType} onChange={e => setClearType(e.target.value)} className={SELECT}>
          {["End-of-Semester Clearance","Graduation Clearance","Transfer Clearance","Leave of Absence Clearance"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Semester / Period">
        <select value={sem} onChange={e => setSem(e.target.value)} className={SELECT}>
          {["1st Semester 2026-2027","2nd Semester 2025-2026","Summer 2026","1st Semester 2025-2026"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Additional Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any special concerns..." className={INPUT} />
      </Field>
    </FormWrap>
  );
}

function IdConcernsForm({ service, onBack, onSubmitted }) {
  const [concern, setConcern] = useState('Request New ID');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    setBusy(true);
    try {
      const title = `ID Concern - ${concern}`;
      const details = `Reason: ${reason}\nNotes: ${notes || 'None'}`;
      const metadata = { concern, reason, notes };
      const req = await createServiceRequest({ service_type: 'id_concern', title, details, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit ID request.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="ID Request Submitted" doneMsg="Your ID concern has been received. Visit the Office of the Registrar.">
      <Field label="Concern Type">
        <select value={concern} onChange={e => setConcern(e.target.value)} className={SELECT}>
          {["Request New ID","Lost ID Replacement","Damaged ID Replacement","ID Renewal","ID Data Correction"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Reason *">
        <textarea value={reason} onChange={e => setReason(e.target.value)} required rows={3} placeholder="Please explain reason for your ID concern..." className={INPUT} />
      </Field>
      <Field label="Additional Notes">
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any other details..." className={INPUT} />
      </Field>
    </FormWrap>
  );
}

function RegistrarForm({ service, user, onBack, onSubmitted }) {
  const [concern, setConcern] = useState('');
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState(user && user.email ? user.email : '');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!concern || !details.trim()) return;
    setBusy(true);
    try {
      const title = `Registrar - ${concern}`;
      const reqDetails = `Details: ${details}\nContact: ${contact || 'N/A'}`;
      const metadata = { concern, contact };
      const req = await createServiceRequest({ service_type: 'registrar', title, details: reqDetails, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit registrar concern.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="Concern Submitted" doneMsg="Your concern has been forwarded to the Registrar's Office. Expect a response in 2-3 working days.">
      <Field label="Concern Category *">
        <select value={concern} onChange={e => setConcern(e.target.value)} required className={SELECT}>
          <option value="">Select a category...</option>
          {["Grade Inquiry / Correction","Missing or Incomplete Grades","Enrollment Record Issue","Document Status Follow-up","Name / Data Correction","Others"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Details *">
        <textarea value={details} onChange={e => setDetails(e.target.value)} required rows={4} placeholder="Describe your concern..." className={INPUT} />
      </Field>
      <Field label="Preferred Contact Email">
        <input type="email" value={contact} onChange={e => setContact(e.target.value)} placeholder="your@email.com" className={INPUT} />
      </Field>
    </FormWrap>
  );
}

function PaymentForm({ service, user, onBack, onSubmitted }) {
  const [concern, setConcern] = useState('');
  const [amount, setAmount] = useState('');
  const [details, setDetails] = useState('');
  const [contact, setContact] = useState(user && user.email ? user.email : '');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    if (!concern || !details.trim()) return;
    setBusy(true);
    try {
      const title = `Payment - ${concern}`;
      const reqDetails = `Amount: ${amount ? '₱' + amount : 'N/A'}\nDetails: ${details}\nContact: ${contact || 'N/A'}`;
      const metadata = { concern, amount, contact };
      const req = await createServiceRequest({ service_type: 'payment', title, details: reqDetails, metadata });
      setBusy(false);
      setDone(true);
      if (onSubmitted) onSubmitted(req);
    } catch (err) {
      setBusy(false);
      alert(err.message || 'Failed to submit payment concern.');
    }
  }
  return (
    <FormWrap service={service} onSubmit={handleSubmit} busy={busy} done={done} onBack={onBack}
      doneTitle="Payment Concern Submitted" doneMsg="Your concern has been forwarded to the Accounting Office. Expect a response in 2-3 working days.">
      <Field label="Concern Type *">
        <select value={concern} onChange={e => setConcern(e.target.value)} required className={SELECT}>
          <option value="">Select a concern...</option>
          {["Payment Not Reflected","Request for Official Receipt","Balance Inquiry","Refund Request","Instalment Arrangement","Scholarship Deduction Issue","Others"].map(o => <option key={o}>{o}</option>)}
        </select>
      </Field>
      <Field label="Amount Involved (optional)">
        <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 5000.00" className={INPUT} />
      </Field>
      <Field label="Details *">
        <textarea value={details} onChange={e => setDetails(e.target.value)} required rows={4} placeholder="Describe payment concern..." className={INPUT} />
      </Field>
      <Field label="Preferred Contact Email">
        <input type="email" value={contact} onChange={e => setContact(e.target.value)} placeholder="your@email.com" className={INPUT} />
      </Field>
    </FormWrap>
  );
}

const FORM_MAP = {
  'enrollment': EnrollmentForm,
  'request-documents': RequestDocumentsForm,
  'transcript': TranscriptForm,
  'certificate': CertificateForm,
  'scholarship': ScholarshipForm,
  'clearance': ClearanceForm,
  'id-concerns': IdConcernsForm,
  'registrar': RegistrarForm,
  'payment': PaymentForm,
};

export default function ServiceRequestForm({ serviceId, service, user, onBack, onSubmitted }) {
  const Form = FORM_MAP[serviceId];
  const Icon = service && service.icon ? service.icon : FileText;
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button type="button" onClick={onBack}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Services
        </button>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
            <div className={`w-11 h-11 rounded-xl ${service && service.color ? service.color.icon : 'bg-blue-600'} text-white flex items-center justify-center shrink-0 shadow-sm`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{service && service.title}</h1>
              <p className="text-xs text-slate-500 font-medium">Fill out the form below and click Submit Request.</p>
            </div>
          </div>
          {Form ? (
            <Form service={service} user={user} onBack={onBack} onSubmitted={onSubmitted} />
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">Form not available for this service.</p>
          )}
        </div>
      </div>
    </main>
  );
}

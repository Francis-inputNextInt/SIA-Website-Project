import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  GraduationCap,
  Award,
  Banknote,
  ShieldCheck,
  CreditCard,
  Building2,
  CircleDollarSign,
  ChevronRight,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import ServiceRequestForm from './StudentServiceForms';
import { getMyServiceRequests } from '../services/serviceRequestService';

/* ── Service catalogue ─────────────────────────────────────── */

const SERVICES = [
  {
    id: 'enrollment',
    title: 'Enrollment',
    description: 'Submit your enrollment application or add/drop subjects for the current semester.',
    icon: GraduationCap,
    color: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-600', btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/30' },
    action: 'Enroll Now',
  },
  {
    id: 'request-documents',
    title: 'Request Documents',
    description: 'Request official school documents online and track your request status.',
    icon: FileText,
    color: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-600', btn: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/30' },
    action: 'Request Document',
  },
  {
    id: 'transcript',
    title: 'Transcript Request',
    description: 'Request your official Transcript of Records (TOR) for employment or further studies.',
    icon: ClipboardList,
    color: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'bg-violet-600', btn: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500/30' },
    action: 'Request Transcript',
  },
  {
    id: 'certificate',
    title: 'Certificate Request',
    description: 'Obtain certificates such as Good Moral, Enrollment, or Completion certificates.',
    icon: Award,
    color: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-600', btn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/30' },
    action: 'Request Certificate',
  },
  {
    id: 'scholarship',
    title: 'Scholarship',
    description: 'Apply for scholarships or check the status of your existing scholarship grant.',
    icon: Banknote,
    color: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', btn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/30' },
    action: 'Apply / Check Status',
  },
  {
    id: 'clearance',
    title: 'Clearance',
    description: 'Process your student clearance for graduation, transfer, or end-of-semester requirements.',
    icon: ShieldCheck,
    color: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'bg-teal-600', btn: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-500/30' },
    action: 'Process Clearance',
  },
  {
    id: 'id-concerns',
    title: 'ID Concerns',
    description: 'Request a new ID, report a lost ID, or have your ID replaced or renewed.',
    icon: CreditCard,
    color: { bg: 'bg-sky-50', border: 'border-sky-200', icon: 'bg-sky-600', btn: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500/30' },
    action: 'Submit ID Request',
  },
  {
    id: 'registrar',
    title: 'Registrar Concerns',
    description: "Raise concerns or inquiries directly to the Registrar's Office.",
    icon: Building2,
    color: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'bg-rose-600', btn: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/30' },
    action: 'Submit Concern',
  },
  {
    id: 'payment',
    title: 'Payment Concerns',
    description: 'Report payment issues, request official receipts, or inquire about your balance.',
    icon: CircleDollarSign,
    color: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-500', btn: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/30' },
    action: 'Submit Payment Concern',
  },
];

/* ── Status badge styles ───────────────────────────────────── */

const STATUS_STYLE = {
  pending:    { label: 'Pending',    cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  processing: { label: 'Processing', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  ready:      { label: 'Ready',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

/* ── Submitted banner ──────────────────────────────────────── */

function SubmittedBanner({ count, onView }) {
  if (!count) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm">
      <span className="flex items-center gap-2 text-emerald-700 font-medium">
        <CheckCircle2 className="w-4 h-4 shrink-0" />
        {count} request{count > 1 ? 's' : ''} submitted this session
      </span>
      <button type="button" onClick={onView} className="flex items-center gap-1 text-emerald-700 font-semibold hover:underline text-xs">
        View <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Service card ──────────────────────────────────────────── */

function ServiceCard({ service, onSelect }) {
  const Icon = service.icon;
  const c = service.color;
  return (
    <div className={`group flex flex-col rounded-2xl border ${c.border} ${c.bg} p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${c.icon} text-white flex items-center justify-center shrink-0 shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 leading-tight mt-2">{service.title}</h3>
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1 mb-4">{service.description}</p>
      <button
        type="button"
        onClick={() => onSelect(service.id)}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white ${c.btn} shadow-sm transition-all duration-150 focus:outline-none focus:ring-2`}
      >
        {service.action}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Recent requests panel ─────────────────────────────────── */

function RecentRequests({ requests, onHide }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Submitted Requests</h2>
        </div>
        <button type="button" onClick={onHide} className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
          Hide
        </button>
      </div>
      {requests.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No requests submitted yet.</p>
      ) : (
        <div className="space-y-2">
          {requests.map((r) => {
            const st = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
            return (
              <div key={r.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{r.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{r.submittedAt}</p>
                </div>
                <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${st.cls}`}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */

export default function StudentServicesPage({ user, onBack }) {
  const [activeService, setActiveService] = useState(null);
  const [submittedRequests, setSubmittedRequests] = useState([]);
  const [showRecent, setShowRecent] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const reqs = await getMyServiceRequests();
        setSubmittedRequests(reqs);
      } catch (err) {
        console.warn('Could not load service requests from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const handleSubmitted = (req) => {
    setSubmittedRequests((prev) => [req, ...prev]);
    setActiveService(null);
    setShowRecent(true);
  };

  if (activeService) {
    const service = SERVICES.find((s) => s.id === activeService);
    return (
      <ServiceRequestForm
        serviceId={activeService}
        service={service}
        user={user}
        onBack={() => setActiveService(null)}
        onSubmitted={handleSubmitted}
      />
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </button>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-600/20">
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Student Services</h1>
            </div>
            <p className="text-blue-100 text-sm sm:text-base font-medium max-w-xl">
              Submit service requests, track their status, and manage your academic needs — all in one place.
            </p>
            {submittedRequests.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {submittedRequests.length} request{submittedRequests.length > 1 ? 's' : ''} submitted this session
              </div>
            )}
          </div>
        </div>

        {!showRecent && <SubmittedBanner count={submittedRequests.length} onView={() => setShowRecent(true)} />}
        {showRecent && <RecentRequests requests={submittedRequests} onHide={() => setShowRecent(false)} />}

        {/* Service grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Available Services</h2>
            <span className="ml-auto text-xs text-slate-400 font-medium">{SERVICES.length} services</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => (
              <ServiceCard key={s.id} service={s} onSelect={setActiveService} />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}


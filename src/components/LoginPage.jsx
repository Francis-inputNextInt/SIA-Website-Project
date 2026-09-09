import React, { useState } from 'react';
import { GraduationCap, Sparkles, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { SignInView, SignUpView, ForgotView } from './auth/AuthViews';

const VIEWS = [
  { key: 'signin', label: 'Sign In' },
  { key: 'signup', label: 'Create Account' },
  { key: 'forgot', label: 'Reset' },
];

const VIEW_META = {
  signin: { title: 'Welcome Back', subtitle: 'Sign in to the AI Campus Assistant' },
  signup: { title: 'Create Account', subtitle: 'Join the Campus Digital Hub' },
  forgot: { title: 'Reset Password', subtitle: "We'll guide you through recovery" },
};

const FEATURES = [
  { icon: Sparkles, text: 'Instant answers about enrollment, programs, registrar, scholarships and more.' },
  { icon: BookOpen, text: 'Academic guidance tailored to your student level and campus resources.' },
  { icon: Clock, text: '24/7 availability across all campus devices — always ready to help.' },
];

export default function LoginPage({ onLogin }) {
  const [view, setView] = useState('signin');
  const [spw, setSpw] = useState(false);
  const [scp, setScp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [fid, setFid] = useState('');
  const [fpw, setFpw] = useState('');
  const [rem, setRem] = useState(true);
  const [fn, setFn] = useState('');
  const [fe, setFe] = useState('');
  const [rol, setRol] = useState('Student');
  const [dep, setDep] = useState('');
  const [sup, setSup] = useState('');
  const [cfp, setCfp] = useState('');
  const [fem, setFem] = useState('');

  const go = (v) => {
    if (busy) return;
    setView(v); setErr(''); setOk('');
    setSpw(false); setScp(false);
  };

  const meta = VIEW_META[view];

  return (
    <div className="min-h-screen w-full bg-slate-950 relative overflow-hidden flex flex-col">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-sky-500/5 blur-3xl" />

      {/* Brand header */}
      <div className="relative z-10 px-6 pt-8 pb-4 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">AI Campus Assistant</h1>
            <p className="text-xs text-slate-400 font-medium">Enrolled students &amp; faculty — exclusive access</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-4 sm:px-6 pb-10 pt-2 overflow-y-auto">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-center">
          {/* Left: feature panel (hidden on mobile) */}
          <div className="hidden lg:block text-left">
            <h2 className="text-3xl font-bold text-white leading-snug tracking-tight">
              Your smart<br />
              <span className="bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent">campus companion.</span>
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-sm">
              Get instant, personalized answers about enrollment, programs, campus services, and academic life — powered by AI and tailored to your institution.
            </p>
            <div className="mt-8 space-y-4">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Exclusive Access</p>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Only <span className="font-semibold text-slate-300">enrolled students</span> and <span className="font-semibold text-slate-300">faculty / staff</span> can use the assistant.
                Unenrolled accounts (e.g. Applicants) will see an access-restricted screen after login.
              </p>
            </div>
          </div>

          {/* Right: auth card */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/30 border border-slate-200/80 p-6 sm:p-8">
              {/* Card header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">{meta.title}</h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">{meta.subtitle}</p>
                </div>
              </div>

              {/* Tab bar */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
                {VIEWS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => go(t.key)}
                    disabled={busy}
                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      view === t.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* View content */}
              {view === 'signin' && (
                <SignInView
                  state={{ fid, fpw, rem }}
                  setters={{ setFid, setFpw, setRem, spw, setSpw, busy, setBusy, err, ok, setErr, setOk }}
                  onLogin={onLogin}
                  onClose={() => {}}
                  go={go}
                />
              )}
              {view === 'signup' && (
                <SignUpView
                  state={{ fn, fe, rol, dep, sup, cfp }}
                  setters={{ setFn, setFe, setRol, setDep, setSup, setCfp, spw, setSpw, scp, setScp, busy, setBusy, err, ok, setErr, setOk }}
                  onLogin={onLogin}
                  onClose={() => {}}
                />
              )}
              {view === 'forgot' && (
                <ForgotView
                  state={{ fem }}
                  setters={{ setFem, busy, setBusy, err, ok, setErr, setOk }}
                />
              )}

              {/* Footer links */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
                {view === 'signin' && (
                  <p>New to the campus hub?{' '}
                    <button type="button" onClick={() => go('signup')} className="font-semibold text-blue-600 hover:underline">Create an account</button>
                  </p>
                )}
                {view === 'signup' && (
                  <p>Already have an account?{' '}
                    <button type="button" onClick={() => go('signin')} className="font-semibold text-blue-600 hover:underline">Sign in here</button>
                  </p>
                )}
                {view === 'forgot' && (
                  <button type="button" onClick={() => go('signin')} className="font-semibold text-blue-600 hover:underline">← Back to Sign in</button>
                )}
              </div>
            </div>

            {/* Bottom branding */}
            <p className="mt-5 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Campus AI Assistant · Enrolled members only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


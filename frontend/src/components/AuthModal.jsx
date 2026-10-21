import React, { useState, useEffect, useCallback } from 'react';
import { X, GraduationCap } from 'lucide-react';
import { SignInView, SignUpView, ForgotView } from './auth/AuthViews';

export default function AuthModal({ open, onClose, onLogin }) {
  const [view, setView] = useState('signin');
  const [spw, setSpw] = useState(false);
  const [scp, setScp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [closing, setClosing] = useState(false);
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

  // Run the "drop down" exit animation, then ask the parent to close.
  const triggerClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [closing, onClose]);

  useEffect(() => {
    if (open) {
      setView('signin'); setSpw(false); setScp(false);
      setBusy(false); setErr(''); setOk('');
      setFid(''); setFpw(''); setFn(''); setFe('');
      setRol('Student'); setDep(''); setSup(''); setCfp(''); setFem('');
    }
  }, [open]);

  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape' && !busy) triggerClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, busy, triggerClose]);

  const go = (v) => { if (!busy) { setView(v); setErr(''); setOk(''); setSpw(false); setScp(false); } };

  // CRITICAL: unmount entirely when closed so the login page drops away
  // and the user lands back on the AI Campus Assistant.
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm ${closing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={() => !busy && triggerClose()} />
      <div className={`relative bg-white w-full max-w-md rounded-3xl shadow-2xl shadow-slate-900/20 border border-slate-200/80 ${closing ? 'animate-drop-down' : 'animate-slide-up'} max-h-[92vh] overflow-y-auto chat-scrollbar`}>
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 pt-5 pb-4 rounded-t-3xl flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20"><GraduationCap className="w-5 h-5" /></div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{view === 'signin' ? 'Welcome Back' : view === 'signup' ? 'Create Your Account' : 'Reset Your Password'}</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">{view === 'signin' ? 'AI Campus Assistant — Secure Login' : view === 'signup' ? 'Join the Campus Digital Hub' : "We'll guide you through recovery"}</p>
            </div>
          </div>
          <button type="button" onClick={() => !busy && triggerClose()} disabled={busy} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {view === 'signin' && (
            <SignInView
              state={{ fid, fpw, rem }}
              setters={{ setFid, setFpw, setRem, spw, setSpw, busy, setBusy, err, ok, setErr, setOk }}
              onLogin={onLogin}
              onClose={triggerClose}
              go={go}
            />
          )}
          {view === 'signup' && (
            <SignUpView
              state={{ fn, fe, rol, dep, sup, cfp }}
              setters={{ setFn, setFe, setRol, setDep, setSup, setCfp, spw, setSpw, scp, setScp, busy, setBusy, err, ok, setErr, setOk }}
              onLogin={onLogin}
              onClose={triggerClose}
              go={go}
            />
          )}
          {view === 'forgot' && (
            <ForgotView
              state={{ fem }}
              setters={{ setFem, busy, setBusy, err, ok, setErr, setOk }}
            />
          )}
          <div className="pt-2 pb-1 border-t border-slate-100 text-center text-xs sm:text-sm text-slate-500 font-medium">
            {view === 'signin' && <p>New to the campus hub? <button type="button" onClick={() => go('signup')} className="font-semibold text-blue-600 hover:underline">Create an account</button></p>}
            {view === 'signup' && <p>Already have an account? <button type="button" onClick={() => go('signin')} className="font-semibold text-blue-600 hover:underline">Sign in here</button></p>}
            {view === 'forgot' && <button type="button" onClick={() => go('signin')} className="font-semibold text-blue-600 hover:underline">← Back to Sign in</button>}
          </div>
        </div>
      </div>
    </div>
  );
}






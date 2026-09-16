import React, { useState, useEffect, useCallback } from 'react';
import { X, GraduationCap, Eye, EyeOff, LogIn, UserPlus, KeyRound, Mail, User, IdCard, ArrowRight, CheckCircle2, ShieldAlert, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { DEMO_ACCOUNTS, loginUser, registerUser, sendPasswordReset, verifySignupOtp } from '../services/authService';
import CaptchaCheckbox from './CaptchaCheckbox';

const IN = 'w-full bg-white text-slate-800 placeholder-slate-400 text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-slate-50 disabled:opacity-60';

function Err({ m }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium animate-fade-in">
      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" /><span>{m}</span>
    </div>
  );
}

function Ok({ m }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium animate-fade-in">
      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{m}</span>
    </div>
  );
}

function SubmitBtn({ busy, loadingText, children }) {
  return (
    <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all duration-150">
      {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> {loadingText}</>) : children}
    </button>
  );
}

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
  const [verifyEmail, setVerifyEmail] = useState('');
  const [fcode, setFcode] = useState('');
  const [regSnapshot, setRegSnapshot] = useState(null);

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
      setVerifyEmail(''); setFcode(''); setRegSnapshot(null);
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
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{view === 'signin' ? 'Welcome Back' : view === 'signup' ? 'Create Your Account' : view === 'verify' ? 'Confirm Your Email' : 'Reset Your Password'}</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">{view === 'signin' ? 'AI Campus Assistant — Secure Login' : view === 'signup' ? 'Join the Campus Digital Hub' : view === 'verify' ? 'Enter the 6-digit code we sent to your email' : "We'll guide you through recovery"}</p>
            </div>
          </div>
          <button type="button" onClick={() => !busy && triggerClose()} disabled={busy} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {view === 'signin' && <SignIn state={{ fid: fid, fpw: fpw, rem: rem }} setters={{ setFid: setFid, setFpw: setFpw, setRem: setRem, spw: spw, setSpw: setSpw, busy: busy, setBusy: setBusy, err: err, ok: ok, setErr: setErr, setOk: setOk }} onLogin={onLogin} onClose={triggerClose} go={go} />}
          {view === 'signup' && <SignUp state={{ fn: fn, fe: fe, rol: rol, dep: dep, sup: sup, cfp: cfp }} setters={{ setFn: setFn, setFe: setFe, setRol: setRol, setDep: setDep, setSup: setSup, setCfp: setCfp, spw: spw, setSpw: setSpw, scp: scp, setScp: setScp, busy: busy, setBusy: setBusy, err: err, ok: ok, setErr: setErr, setOk: setOk, setVerifyEmail: setVerifyEmail, setRegSnapshot: setRegSnapshot }} onLogin={onLogin} onClose={triggerClose} go={go} />}
          {view === 'forgot' && <Forgot state={{ fem: fem }} setters={{ setFem: setFem, busy: busy, setBusy: setBusy, err: err, ok: ok, setErr: setErr, setOk: setOk }} />}
          {view === 'verify' && <Verify state={{ verifyEmail: verifyEmail, fcode: fcode, regSnapshot: regSnapshot }} setters={{ setFcode: setFcode, busy: busy, setBusy: setBusy, err: err, ok: ok, setErr: setErr, setOk: setOk }} onLogin={onLogin} onClose={triggerClose} go={go} />}
          <div className="pt-2 pb-1 border-t border-slate-100 text-center text-xs sm:text-sm text-slate-500 font-medium">
            {view !== 'signin' && view !== 'verify' && <p className="mb-1.5">Already have an account? <button type="button" onClick={() => go('signin')} className="font-semibold text-blue-600 hover:underline">Sign in here</button></p>}
            {view === 'verify' && <p>Changed your mind? <button type="button" onClick={() => go('signin')} className="font-semibold text-blue-600 hover:underline">Sign in instead</button></p>}
            {view === 'signin' && <p>New to the campus hub? <button type="button" onClick={() => go('signup')} className="font-semibold text-blue-600 hover:underline">Create an account</button></p>}
            {view === 'forgot' && <button type="button" onClick={() => go('signin')} className="font-semibold text-blue-600 hover:underline">← Back to Sign in</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Sign In ===== */
function SignIn({ state, setters, onLogin, onClose, go }) {
  const { fid, fpw, rem } = state;
  const { setFid, setFpw, setRem, spw, setSpw, busy, setBusy, err, ok, setErr, setOk } = setters;
  const [captchaToken, setCaptchaToken] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!fid.trim() || !fpw.trim()) {
      setErr('Please enter both your email/ID and password.');
      return;
    }
    if (!captchaToken) {
      setErr('Please complete the CAPTCHA to prove you are not a bot.');
      return;
    }
    setBusy(true);
    try {
      const user = await loginUser({ identifier: fid, password: fpw, rememberMe: rem });
      onLogin(user);
      setOk(`Welcome back, ${user.name.split(' ')[0]}!`);
      setTimeout(() => onClose(), 900);
    } catch (err2) {
      setErr(err2.message);
    } finally {
      setTimeout(() => setBusy(false), 900);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><IdCard className="w-3.5 h-3.5 text-blue-500" /> University Email or ID Number</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={fid} onChange={(e) => setFid(e.target.value)} placeholder="e.g. student@campus.edu or 2024-00842" autoComplete="username" disabled={busy} className={`${IN} pl-9`} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><KeyRound className="w-3.5 h-3.5 text-blue-500" /> Password</label>
          <button type="button" onClick={() => go('forgot')} className="text-[11px] font-semibold text-blue-600 hover:underline">Forgot password?</button>
        </div>
        <div className="relative">
          <input type={spw ? 'text' : 'password'} value={fpw} onChange={(e) => setFpw(e.target.value)} placeholder="Enter your password" autoComplete="current-password" disabled={busy} className={`${IN} pl-9 pr-10`} />
          <button type="button" onClick={() => setSpw(!spw)} disabled={busy} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">{spw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-slate-600 select-none cursor-pointer">
        <input type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} disabled={busy} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
        Keep me signed in on this device
      </label>

      {err && <Err m={err} />}
      {ok && <Ok m={ok} />}

      <div className="pt-0.5">
        <CaptchaCheckbox
          onVerify={setCaptchaToken}
          onExpire={() => setCaptchaToken(null)}
          disabled={busy}
          className="py-1"
        />
        {captchaToken && (
          <p className="text-center text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Human verified ✓
          </p>
        )}
      </div>

      <SubmitBtn busy={busy} loadingText="Signing in..."><LogIn className="w-4 h-4" /> Sign In to Campus Assistant</SubmitBtn>

      <div className="pt-1">
        <p className="text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Or try a demo account</p>
        <div className="flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button key={acc.id} type="button" onClick={() => { setFid(acc.email); setFpw('password123'); setErr(''); }} disabled={busy} className="group flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 active:bg-blue-100 transition-all duration-150 text-left">
              <div className={`w-9 h-9 rounded-xl ${acc.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}>{acc.initials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{acc.name}</p>
                <p className="text-[11px] text-slate-500 font-medium truncate">{acc.email} · {acc.role}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">Demo password: <span className="font-semibold text-slate-500">password123</span></p>
        <p className="mt-1.5 text-center text-[11px] text-slate-400 leading-relaxed">
          ⚠️ <span className="font-semibold text-slate-500">Exclusive:</span> only enrolled students &amp; faculty staff can use the assistant — the <span className="font-semibold text-amber-600">Applicant</span> demo shows the restricted screen.
        </p>
      </div>
    </form>
  );
}
/* ===== Sign Up ===== */
function SignUp({ state, setters, onLogin, onClose, go }) {
  const { fn, fe, rol, dep, sup, cfp } = state;
  const { setFn, setFe, setRol, setDep, setSup, setCfp, spw, setSpw, scp, setScp, busy, setBusy, err, ok, setErr, setOk, setVerifyEmail = () => {}, setRegSnapshot = () => {} } = setters;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!fn.trim()) { setErr('Please enter your full name.'); return; }
    if (!fe.trim()) { setErr('Please enter your university email address.'); return; }
    if (!sup.trim()) { setErr('Please create a password (minimum 6 characters).'); return; }
    if (sup !== cfp) { setErr('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const result = await registerUser({ name: fn, email: fe, role: rol, department: dep, password: sup });
      if (result.needsEmailVerification) {
        // Supabase emailed a 6-digit code — show the in-app verification screen
        // instead of sending the user to their inbox for a redirect.
        setVerifyEmail(result.email);
        setRegSnapshot({ name: fn, email: fe, role: rol, department: dep, password: sup });
        setTimeout(() => go('verify'), 500);
      } else {
        onLogin(result);
        setOk(`Account created. Welcome, ${result.name.split(' ')[0]}!`);
        setTimeout(() => onClose(), 900);
      }
    } catch (err2) {
      setErr(err2.message);
    } finally {
      setTimeout(() => setBusy(false), 900);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><User className="w-3.5 h-3.5 text-blue-500" /> Full Name</label>
        <input type="text" value={fn} onChange={(e) => setFn(e.target.value)} placeholder="e.g. Maria Santos" autoComplete="name" disabled={busy} className={IN} />
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> University Email</label>
        <input type="email" value={fe} onChange={(e) => setFe(e.target.value)} placeholder="name@campus.edu" autoComplete="email" disabled={busy} className={IN} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><GraduationCap className="w-3.5 h-3.5 text-blue-500" /> I am a...</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)} disabled={busy} className={IN}>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Applicant">Applicant</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><IdCard className="w-3.5 h-3.5 text-blue-500" /> Department / Program <span className="text-slate-400 font-normal">(optional)</span></label>
          <input type="text" value={dep} onChange={(e) => setDep(e.target.value)} placeholder="e.g. Computer Science" disabled={busy} className={IN} />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><KeyRound className="w-3.5 h-3.5 text-blue-500" /> Create Password</label>
        <div className="relative">
          <input type={spw ? 'text' : 'password'} value={sup} onChange={(e) => setSup(e.target.value)} placeholder="Minimum 6 characters" autoComplete="new-password" disabled={busy} className={`${IN} pr-10`} />
          <button type="button" onClick={() => setSpw(!spw)} disabled={busy} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">{spw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><KeyRound className="w-3.5 h-3.5 text-blue-500" /> Confirm Password</label>
        <div className="relative">
          <input type={scp ? 'text' : 'password'} value={cfp} onChange={(e) => setCfp(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" disabled={busy} className={`${IN} pr-10`} />
          <button type="button" onClick={() => setScp(!scp)} disabled={busy} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">{scp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
      </div>
      {err && <Err m={err} />}
      {ok && <Ok m={ok} />}
      <SubmitBtn busy={busy} loadingText="Creating your account..."><UserPlus className="w-4 h-4" /> Create Account</SubmitBtn>
      <p className="text-[11px] text-slate-400 leading-relaxed text-center">
        ⚠️ Registration is exclusive to enrolled students &amp; faculty staff. Accounts created with a
        personal email (e.g. <span className="font-mono">@gmail.com</span>) are treated as <span className="font-semibold text-amber-600">unenrolled</span> and cannot access the assistant.
      </p>
    </form>
  );
}
/* ===== Email Verification (6-digit code) ===== */
function Verify({ state, setters, onLogin, onClose, go }) {
  const { verifyEmail, fcode, regSnapshot } = state;
  const { setFcode, busy, setBusy, err, ok, setErr, setOk } = setters;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    const code = String(fcode || '').replace(/\D/g, '');
    if (code.length !== 6) {
      setErr('Please enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    try {
      const user = await verifySignupOtp({ email: verifyEmail, token: code });
      onLogin(user);
      setOk(`Email confirmed! Welcome, ${user.name.split(' ')[0]}!`);
      setTimeout(() => onClose(), 900);
    } catch (err2) {
      setErr(err2.message);
    } finally {
      setTimeout(() => setBusy(false), 900);
    }
  };

  const resend = async () => {
    if (!regSnapshot) { setErr('Registration details are missing. Please sign up again.'); return; }
    setErr(''); setOk('');
    setBusy(true);
    try {
      // Re-running signUp resends the email with a fresh 6-digit code.
      await registerUser(regSnapshot);
      setOk(`A new 6-digit code was sent to ${verifyEmail}. Check your inbox.`);
    } catch (err2) {
      setErr(err2.message);
    } finally {
      setTimeout(() => setBusy(false), 900);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
        Enter the <span className="font-bold text-blue-700">6-digit code</span> we sent to{' '}
        <span className="font-semibold text-slate-800">{verifyEmail}</span> to prove that this email is really yours.
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
          <KeyRound className="w-3.5 h-3.5 text-blue-500" /> 6-Digit Verification Code
        </label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={fcode}
          onChange={(e) => setFcode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          autoFocus
          disabled={busy}
          className={`${IN} text-center text-lg font-bold tracking-[0.5em]`}
        />
      </div>
      {err && <Err m={err} />}
      {ok && <Ok m={ok} />}
      <SubmitBtn busy={busy} loadingText="Verifying code..."><ShieldCheck className="w-4 h-4" /> Verify &amp; Complete Registration</SubmitBtn>
      <div className="pt-1 flex items-center justify-between text-xs font-medium text-slate-500">
        <button type="button" onClick={resend} disabled={busy} className="inline-flex items-center gap-1 text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
          <RefreshCw className="w-3.5 h-3.5" /> Resend code
        </button>
        <button type="button" onClick={() => go('signin')} disabled={busy} className="text-slate-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed">
          Use a different email
        </button>
      </div>
    </form>
  );
}

/* ===== Forgot Password ===== */
function Forgot({ state, setters }) {
  const { fem } = state;
  const { setFem, busy, setBusy, err, ok, setErr, setOk } = setters;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!fem.trim()) { setErr('Please enter your registered university email address.'); return; }
    setBusy(true);
    try {
      const res = await sendPasswordReset(fem);
      setOk(res.message);
    } catch (err2) {
      setErr(err2.message);
    } finally {
      setTimeout(() => setBusy(false), 900);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
        Enter the university email associated with your account and we'll send you password recovery instructions.
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> University Email Address</label>
        <input type="email" value={fem} onChange={(e) => setFem(e.target.value)} placeholder="name@campus.edu" autoComplete="email" disabled={busy} className={IN} />
      </div>
      {err && <Err m={err} />}
      {ok && <Ok m={ok} />}
      <SubmitBtn busy={busy} loadingText="Sending recovery email..."><Mail className="w-4 h-4" /> Send Recovery Instructions</SubmitBtn>
    </form>
  );
}

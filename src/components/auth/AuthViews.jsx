import React from 'react';
import { Eye, EyeOff, LogIn, UserPlus, KeyRound, Mail, User, IdCard, ArrowRight, CheckCircle2, ShieldAlert, Loader2, GraduationCap } from 'lucide-react';
import { DEMO_ACCOUNTS, loginUser, registerUser, sendPasswordReset } from '../../services/authService';

export const AUTH_INPUT = 'w-full bg-white text-slate-800 placeholder-slate-400 text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:bg-slate-50 disabled:opacity-60';

export function AuthErr({ m }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium animate-fade-in">
      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" /><span>{m}</span>
    </div>
  );
}

export function AuthOk({ m }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-medium animate-fade-in">
      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{m}</span>
    </div>
  );
}

export function AuthSubmitBtn({ busy, loadingText, children }) {
  return (
    <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all duration-150">
      {busy ? (<><Loader2 className="w-4 h-4 animate-spin" /> {loadingText}</>) : children}
    </button>
  );
}

/* ===== Sign In ===== */
export function SignInView({ state, setters, onLogin, onClose = () => {}, go }) {
  const { fid, fpw, rem } = state;
  const { setFid, setFpw, setRem, spw, setSpw, busy, setBusy, err, ok, setErr, setOk } = setters;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!fid.trim() || !fpw.trim()) { setErr('Please enter both your email/ID and password.'); return; }
    setBusy(true);
    try {
      const user = await loginUser({ identifier: fid, password: fpw, rememberMe: rem });
      onLogin(user);
      setOk(`Welcome back, ${user.name.split(' ')[0]}!`);
      setTimeout(() => onClose(), 900);
    } catch (err2) { setErr(err2.message); }
    finally { setTimeout(() => setBusy(false), 900); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><IdCard className="w-3.5 h-3.5 text-blue-500" /> University Email or ID Number</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={fid} onChange={(e) => setFid(e.target.value)} placeholder="e.g. student@campus.edu or 2024-00842" autoComplete="username" disabled={busy} className={`${AUTH_INPUT} pl-9`} />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600"><KeyRound className="w-3.5 h-3.5 text-blue-500" /> Password</label>
          <button type="button" onClick={() => go('forgot')} className="text-[11px] font-semibold text-blue-600 hover:underline">Forgot password?</button>
        </div>
        <div className="relative">
          <input type={spw ? 'text' : 'password'} value={fpw} onChange={(e) => setFpw(e.target.value)} placeholder="Enter your password" autoComplete="current-password" disabled={busy} className={`${AUTH_INPUT} pl-9 pr-10`} />
          <button type="button" onClick={() => setSpw(!spw)} disabled={busy} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">{spw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs font-medium text-slate-600 select-none cursor-pointer">
        <input type="checkbox" checked={rem} onChange={(e) => setRem(e.target.checked)} disabled={busy} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30" />
        Keep me signed in on this device
      </label>
      {err && <AuthErr m={err} />}
      {ok && <AuthOk m={ok} />}
      <AuthSubmitBtn busy={busy} loadingText="Signing in..."><LogIn className="w-4 h-4" /> Sign In to Campus Assistant</AuthSubmitBtn>
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
export function SignUpView({ state, setters, onLogin, onClose = () => {} }) {
  const { fn, fe, rol, dep, sup, cfp } = state;
  const { setFn, setFe, setRol, setDep, setSup, setCfp, spw, setSpw, scp, setScp, busy, setBusy, err, ok, setErr, setOk } = setters;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setOk('');
    if (!fn.trim()) { setErr('Please enter your full name.'); return; }
    if (!fe.trim()) { setErr('Please enter your university email address.'); return; }
    if (!sup.trim()) { setErr('Please create a password (minimum 6 characters).'); return; }
    if (sup !== cfp) { setErr('Passwords do not match.'); return; }
    setBusy(true);
    try {
      const user = await registerUser({ name: fn, email: fe, role: rol, department: dep, password: sup });
      onLogin(user);
      setOk(`Account created. Welcome, ${user.name.split(' ')[0]}!`);
      setTimeout(() => onClose(), 900);
    } catch (err2) { setErr(err2.message); }
    finally { setTimeout(() => setBusy(false), 900); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><User className="w-3.5 h-3.5 text-blue-500" /> Full Name</label>
        <input type="text" value={fn} onChange={(e) => setFn(e.target.value)} placeholder="e.g. Maria Santos" autoComplete="name" disabled={busy} className={AUTH_INPUT} />
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> University Email</label>
        <input type="email" value={fe} onChange={(e) => setFe(e.target.value)} placeholder="name@campus.edu" autoComplete="email" disabled={busy} className={AUTH_INPUT} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><GraduationCap className="w-3.5 h-3.5 text-blue-500" /> I am a...</label>
          <select value={rol} onChange={(e) => setRol(e.target.value)} disabled={busy} className={AUTH_INPUT}>
            <option value="Student">Student</option>
            <option value="Faculty">Faculty</option>
            <option value="Applicant">Applicant</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><IdCard className="w-3.5 h-3.5 text-blue-500" /> Department / Program <span className="text-slate-400 font-normal">(optional)</span></label>
          <input type="text" value={dep} onChange={(e) => setDep(e.target.value)} placeholder="e.g. Computer Science" disabled={busy} className={AUTH_INPUT} />
        </div>
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><KeyRound className="w-3.5 h-3.5 text-blue-500" /> Create Password</label>
        <div className="relative">
          <input type={spw ? 'text' : 'password'} value={sup} onChange={(e) => setSup(e.target.value)} placeholder="Minimum 6 characters" autoComplete="new-password" disabled={busy} className={`${AUTH_INPUT} pr-10`} />
          <button type="button" onClick={() => setSpw(!spw)} disabled={busy} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">{spw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><KeyRound className="w-3.5 h-3.5 text-blue-500" /> Confirm Password</label>
        <div className="relative">
          <input type={scp ? 'text' : 'password'} value={cfp} onChange={(e) => setCfp(e.target.value)} placeholder="Re-enter your password" autoComplete="new-password" disabled={busy} className={`${AUTH_INPUT} pr-10`} />
          <button type="button" onClick={() => setScp(!scp)} disabled={busy} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">{scp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
        </div>
      </div>
      {err && <AuthErr m={err} />}
      {ok && <AuthOk m={ok} />}
      <AuthSubmitBtn busy={busy} loadingText="Creating your account..."><UserPlus className="w-4 h-4" /> Create Account</AuthSubmitBtn>
      <p className="text-[11px] text-slate-400 leading-relaxed text-center">
        ⚠️ Registration is exclusive to enrolled students &amp; faculty staff. Accounts created with a
        personal email (e.g. <span className="font-mono">@gmail.com</span>) are treated as <span className="font-semibold text-amber-600">unenrolled</span> and cannot access the assistant.
      </p>
    </form>
  );
}

/* ===== Forgot Password ===== */
export function ForgotView({ state, setters }) {
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
    } catch (err2) { setErr(err2.message); }
    finally { setTimeout(() => setBusy(false), 900); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
        Enter the university email associated with your account and we'll send you password recovery instructions.
      </div>
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5"><Mail className="w-3.5 h-3.5 text-blue-500" /> University Email Address</label>
        <input type="email" value={fem} onChange={(e) => setFem(e.target.value)} placeholder="name@campus.edu" autoComplete="email" disabled={busy} className={AUTH_INPUT} />
      </div>
      {err && <AuthErr m={err} />}
      {ok && <AuthOk m={ok} />}
      <AuthSubmitBtn busy={busy} loadingText="Sending recovery email..."><Mail className="w-4 h-4" /> Send Recovery Instructions</AuthSubmitBtn>
    </form>
  );
}


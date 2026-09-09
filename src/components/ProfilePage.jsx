import React, { useState } from 'react';
import {
  UserRound,
  Mail,
  Building2,
  GraduationCap,
  BadgeCheck,
  ArrowLeft,
  Save,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { updateUserProfile } from '../services/authService';

/**
 * "My Profile" page — lets a logged-in student/teacher update their
 * personal details (name, email, department, year level).
 *
 * Props:
 *   user        Current logged-in user object
 *   onBack      Called when the user clicks "Back to Assistant"
 *   onSaved     Called with the updated user object after a successful save
 *   showToast   Optional toast helper ({ type, title, message })
 */
export default function ProfilePage({ user, onBack, onSaved, showToast }) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [department, setDepartment] = useState(user.department || '');
  const [yearLevel, setYearLevel] = useState(user.yearLevel || '');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const isFaculty = user.role === 'Faculty' || user.role === 'Staff';

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr('');

    if (name.trim().length < 2) {
      setErr('Please provide your full name (minimum 2 characters).');
      return;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) {
      setErr('Please provide a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const updated = updateUserProfile({ name, email, department, yearLevel });
      setSaving(false);
      if (showToast) {
        showToast({
          type: 'success',
          title: 'Profile updated',
          message: 'Your profile details have been saved successfully.'
        });
      }
      onSaved(updated);
    } catch (error) {
      setSaving(false);
      setErr(error.message || 'Unable to save your profile. Please try again.');
    }
  };

  return (
    <main className="flex-1 flex justify-center bg-slate-50/50 overflow-y-auto">
      <div className="w-full max-w-3xl px-4 sm:px-6 py-8">

        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Assistant
        </button>

        {/* Page header / identity card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl ${user.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0`}>
              {user.initials || user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                My Profile
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Manage the personal details shown on your campus account.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <BadgeCheck className="w-3 h-3 mr-1" />
                  {user.role}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  {user.studentId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8"
        >
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserRound className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maria Clara Santos"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@campus.edu"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Use your university email to keep your full access to the assistant.
              </p>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder={isFaculty ? 'e.g. Department of Computer Science' : 'e.g. College of Engineering'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {/* Year Level / Position */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {isFaculty ? 'Position' : 'Year Level'}
              </label>
              <div className="relative">
                <GraduationCap className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  placeholder={isFaculty ? 'e.g. Associate Professor' : 'e.g. 3rd Year Undergraduate'}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          {err && (
            <div className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700 font-medium">
              {err}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Changes are saved to this device's session.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 shadow-md shadow-blue-600/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

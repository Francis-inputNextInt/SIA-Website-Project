import React, { useEffect, useRef } from 'react';
import { Home, MessageSquare, Building2, X, GraduationCap } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, view, onGoToDashboard, onGoToChat, onGoToServices, user }) {
  const sidebarRef = useRef(null);

  // Close when clicking outside on mobile
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar panel */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 shadow-xl shadow-slate-900/10 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <button
            type="button"
            onClick={() => { onGoToDashboard(); onClose(); }}
            className="flex items-center space-x-2.5 focus:outline-none rounded-xl -ml-1 pl-1 pr-2 py-1 transition-all hover:bg-slate-50"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">Menu</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          <button
            type="button"
            onClick={() => { onGoToDashboard(); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              view === 'dashboard'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Home className="w-4.5 h-4.5" />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => { onGoToChat(); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              view === 'chat'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            AI Assistant
          </button>
          <button
            type="button"
            onClick={() => { onGoToServices(); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              view === 'services'
                ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
            }`}
          >
            <Building2 className="w-4.5 h-4.5" />
            Student Services
          </button>
        </nav>

        {/* Sidebar footer — user info */}
        {user && (
          <div className="px-3 py-3 border-t border-slate-100">
            <div className="flex items-center gap-2.5 px-2">
              <div className={`w-8 h-8 rounded-lg ${user.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                {user.initials || user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-medium truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

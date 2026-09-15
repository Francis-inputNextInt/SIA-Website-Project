import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, GraduationCap, LogIn, LogOut, ChevronDown, UserRound, Home, MessageSquare, Menu } from 'lucide-react';

export default function Header({ view, onGoToDashboard, onGoToChat, onNewConversation, isResetting, user, onOpenLogin, onLogout, onOpenProfile, onToggleSidebar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/80 shadow-sm sticky top-0 z-30 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Left: Hamburger + Brand */}
        <div className="flex items-center gap-2">
          {/* Sidebar toggle button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand — clickable, navigates to dashboard */}
          <button
            type="button"
            onClick={onGoToDashboard}
            className="flex items-center space-x-3.5 focus:outline-none rounded-xl -ml-2 pl-2 pr-3 py-1 transition-all hover:bg-slate-50"
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  AI Campus Assistant
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-status-pulse"></span>
                  <span>Online</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Your smart companion for campus information'}
              </p>
            </div>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {view === 'chat' && (
            <button type="button" onClick={onNewConversation} title="Start a new conversation"
              className="group flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 rounded-xl transition-all duration-150 border border-slate-200/70 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs">
              <RotateCcw className={`w-4 h-4 text-slate-500 group-hover:text-blue-600 transition-transform duration-300 ${isResetting ? 'rotate-180' : 'group-hover:-rotate-45'}`} />
              <span className="hidden sm:inline">New Conversation</span>
              <span className="sm:hidden">Reset</span>
            </button>
          )}
{!user ? (
            <button type="button" onClick={onOpenLogin}
              className="group flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-600/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          ) : (
            <div className="relative" ref={menuRef}>
              <button type="button" onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                <div className={`w-8 h-8 rounded-xl ${user.avatarColor || 'bg-blue-600'} text-white flex items-center justify-center font-bold text-xs shrink-0`}>
                  {user.initials || user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 p-2 animate-slide-up z-40">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1.5">
                    <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium truncate">{user.email}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">{user.role}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">{user.studentId}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setMenuOpen(false); onGoToDashboard(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 active:bg-blue-100 transition-colors">
                    <Home className="w-4 h-4 text-blue-600" />
                    Dashboard
                  </button>
                  <button type="button" onClick={() => { setMenuOpen(false); onOpenProfile(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 active:bg-blue-100 transition-colors">
                    <UserRound className="w-4 h-4 text-blue-600" />
                    My Profile
                  </button>
                  <button type="button" onClick={() => { setMenuOpen(false); onLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-slide-up">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 text-sm backdrop-blur-md ${
        isSuccess 
          ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-900/10' 
          : isError
          ? 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-900/10'
          : 'bg-blue-50/95 border-blue-200 text-blue-900 shadow-blue-900/10'
      }`}>
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-600" />}
        </div>
        <div className="flex-1 space-y-0.5">
          {toast.title && <p className="font-semibold text-xs tracking-wide uppercase opacity-85">{toast.title}</p>}
          <p className="text-xs sm:text-sm font-medium leading-snug">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

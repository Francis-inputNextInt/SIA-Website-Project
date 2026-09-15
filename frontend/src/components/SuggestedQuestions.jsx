import React from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  FileCheck, 
  Building2, 
  Library, 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../data/mockResponses';

const iconMap = {
  GraduationCap: GraduationCap,
  BookOpen: BookOpen,
  FileCheck: FileCheck,
  Building2: Building2,
  Library: Library,
  HelpCircle: HelpCircle
};

export default function SuggestedQuestions({ onSelectQuestion, disabled }) {
  return (
    <div className="py-2.5 px-4 sm:px-6 bg-slate-50/90 border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Suggested Questions</span>
        </div>

        {/* Scrollable / wrap list of suggestion chips */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((item) => {
            const IconComponent = iconMap[item.icon] || HelpCircle;
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectQuestion(item.text)}
                className="group flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-blue-50/80 hover:text-blue-700 hover:border-blue-300 active:bg-blue-100 disabled:opacity-50 disabled:pointer-events-none rounded-xl border border-slate-200 shadow-2xs transition-all duration-150 text-left"
              >
                <IconComponent className="w-4 h-4 text-blue-500 group-hover:text-blue-600 shrink-0 transition-colors" />
                <span>{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

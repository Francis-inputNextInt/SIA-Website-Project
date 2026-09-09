import React from 'react';
import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start space-x-3 py-2 animate-fade-in">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Bot className="w-4 h-4" />
      </div>

      {/* Typing Bubble */}
      <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs max-w-[85%] sm:max-w-md">
        <div className="flex items-center space-x-2">
          {/* Animated 3 dots */}
          <div className="flex items-center space-x-1.5 py-0.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span className="text-xs font-medium text-slate-500 select-none italic">
            AI Campus Assistant is typing...
          </span>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import { School, Sparkles, BookOpen, GraduationCap, Building2 } from 'lucide-react';

export default function ChatWindow({ messages, isTyping }) {
  const bottomRef = useRef(null);

  // Auto-scroll whenever messages change or typing state toggles
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 chat-scrollbar space-y-4">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* Welcome Info Banner if conversation has only the welcome message */}
        {messages.length === 1 && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-100 text-slate-700 shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
                <School className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs sm:text-sm">
                <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  Welcome to Your Campus Hub
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Ask about course offerings, admission requirements, enrollment schedules, library amenities, registrar requests, or tuition payment options.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Messages Stream */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={bottomRef} className="h-2" />

      </div>
    </div>
  );
}

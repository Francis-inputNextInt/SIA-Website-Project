import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

export default function MessageInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto focus input on mount and when re-enabled
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // Enter without Shift sends message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-adjust height up to max
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const isSendDisabled = disabled || !text.trim();

  return (
    <footer className="bg-white border-t border-slate-200/80 p-3 sm:p-4 sticky bottom-0 z-20">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 bg-slate-50 border border-slate-300/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-2xl p-1.5 sm:p-2 transition-all shadow-xs">
          
          {/* Multiline textarea supporting Enter to send and Shift+Enter for new line */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your campus question here... (Press Enter to send)"
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-sm px-3 py-2 resize-none focus:outline-none max-h-32 disabled:opacity-50"
            style={{ minHeight: '40px' }}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={isSendDisabled}
            title={isSendDisabled ? "Type a message to send" : "Send message"}
            className="flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white font-medium rounded-xl shadow-sm transition-all duration-150 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Send className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs font-semibold">Send</span>
          </button>

        </form>

        {/* Subtle helper text */}
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 select-none">
          <span>AI Campus Assistant provides quick academic and school information.</span>
          <span className="hidden sm:inline text-[11px]">Enter = Send • Shift + Enter = New line</span>
        </div>
      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';

/**
 * Format markdown-like bold text (**text**), line breaks, and bullet items
 */
function renderFormattedContent(text) {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    // If empty line, render a subtle vertical space
    if (line.trim() === '') {
      return <div key={lineIndex} className="h-2" />;
    }

    // Process bold segments **text**
    const parts = [];
    const regex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }
      parts.push(
        <strong key={`bold-${lineIndex}-${match.index}`} className="font-semibold text-slate-900">
          {match[1]}
        </strong>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');

    return (
      <p
        key={lineIndex}
        className={`leading-relaxed text-sm ${isBullet ? 'pl-2 my-0.5' : 'my-1'}`}
      >
        {parts.length > 0 ? parts : line}
      </p>
    );
  });
}

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    if (!message.content) return;
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex items-start justify-end space-x-2.5 py-1.5 animate-slide-up group">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-xl">
          {/* User Bubble */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md shadow-blue-500/10 text-sm break-words whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>

          {/* Timestamp */}
          {message.timestamp && (
            <span className="text-[11px] text-slate-400 mt-1 mr-1 font-medium select-none">
              {message.timestamp}
            </span>
          )}
        </div>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 shadow-xs ring-1 ring-slate-300">
          <User className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Assistant Message
  return (
    <div className="flex items-start space-x-2.5 py-1.5 animate-slide-up group">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-blue-500/20">
        <Bot className="w-4 h-4" />
      </div>

      <div className="flex flex-col items-start max-w-[88%] sm:max-w-xl lg:max-w-2xl">
        {/* Assistant Bubble */}
        <div className="bg-white border border-slate-200/90 text-slate-800 rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3.5 shadow-xs text-sm break-words leading-relaxed relative">
          <div className="text-slate-700">
            {renderFormattedContent(message.content)}
          </div>

          {/* Copy Message Action Button */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] font-medium text-slate-400 select-none">
              AI Assistant {message.timestamp ? `• ${message.timestamp}` : ''}
            </span>
            <button
              onClick={handleCopy}
              title="Copy message to clipboard"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 flex items-center gap-1 text-[11px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Static frontend chat content (UI only).
 *
 * The AI response engine is implemented server-side in
 * `backend/src/data/responseEngine.js` and served via POST /api/chat.
 * This file must only contain static UI constants — NOT answer logic.
 */

export const INITIAL_ASSISTANT_MESSAGE = {
  id: 'welcome-msg',
  role: 'assistant',
  content: "Hello! I'm your AI Campus Assistant. I can help you with campus information, enrollment, academic programs, student services, and other school-related questions.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  category: 'welcome'
};

export const SUGGESTED_QUESTIONS = [
  {
    id: 'sq-1',
    text: 'How do I enroll?',
    category: 'enrollment',
    icon: 'GraduationCap'
  },
  {
    id: 'sq-2',
    text: 'What programs are offered?',
    category: 'programs',
    icon: 'BookOpen'
  },
  {
    id: 'sq-3',
    text: 'What are the enrollment requirements?',
    category: 'requirements',
    icon: 'FileCheck'
  },
  {
    id: 'sq-4',
    text: 'Where is the registrar?',
    category: 'registrar',
    icon: 'Building2'
  },
  {
    id: 'sq-5',
    text: 'Where is the library?',
    category: 'library',
    icon: 'Library'
  },
  {
    id: 'sq-6',
    text: 'What can you help me with?',
    category: 'help',
    icon: 'HelpCircle'
  }
];
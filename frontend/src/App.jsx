import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SuggestedQuestions from './components/SuggestedQuestions';
import MessageInput from './components/MessageInput';
import AuthModal from './components/AuthModal';
import AccessDenied from './components/AccessDenied';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import DashboardPage from './components/DashboardPage';
import StudentServicesPage from './components/StudentServicesPage';
import AcademicCalendarPage from './components/AcademicCalendarPage';
import Toast from './components/Toast';
import { INITIAL_ASSISTANT_MESSAGE } from './data/mockResponses';
import { sendChatMessage } from './services/chatService';
import { getCurrentUser, clearUserSession, isEnrolledUser } from './services/authService';

// Helper for user-scoped chat storage key
function getChatStorageKey(userId) {
  return userId ? `chat_history_${userId}` : 'chat_history_guest';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());

  const [messages, setMessages] = useState(() => {
    const user = getCurrentUser();
    if (user && user.id) {
      try {
        const saved = localStorage.getItem(getChatStorageKey(user.id));
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Error reading stored chat history:', e);
      }
    }
    return [{
      ...INITIAL_ASSISTANT_MESSAGE,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }];
  });

  const [isTyping, setIsTyping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'chat' | 'profile'
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Save messages to user-scoped localStorage whenever messages change
  useEffect(() => {
    if (currentUser && currentUser.id) {
      try {
        localStorage.setItem(getChatStorageKey(currentUser.id), JSON.stringify(messages));
      } catch (e) {
        console.warn('Error saving chat history:', e);
      }
    }
  }, [messages, currentUser]);

  // Show a toast notification and auto-clear
  const showToast = useCallback(({ type = 'success', title, message, duration }) => {
    setToast({ id: Date.now(), type, title, message, duration });
  }, []);

  // Send message handler
  const handleSendMessage = useCallback(async (content) => {
    if (!content || !content.trim() || isTyping) return;

    const trimmed = content.trim();
    const activeUserId = currentUser?.id;

    // 1. Add User message
    const userMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Fetch AI response from backend POST /api/chat with conversation history
      const aiResponse = await sendChatMessage(trimmed, messages);
      if (activeUserId !== currentUser?.id) return;
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      if (activeUserId !== currentUser?.id) return;
      console.error('Error generating response:', err);
      // Fallback error message
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          content: "I'm sorry, an unexpected error occurred while processing your request. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      if (activeUserId === currentUser?.id) {
        setIsTyping(false);
      }
    }
  }, [isTyping, currentUser, messages]);

  // Click on suggested prompt
  const handleSelectQuestion = useCallback((question) => {
    if (isTyping) return;
    handleSendMessage(question);
  }, [handleSendMessage, isTyping]);

  // Reset conversation to initial welcome message
  const handleNewConversation = useCallback(() => {
    setIsResetting(true);
    if (currentUser && currentUser.id) {
      try {
        localStorage.removeItem(getChatStorageKey(currentUser.id));
      } catch (e) {}
    }
    setMessages([
      {
        ...INITIAL_ASSISTANT_MESSAGE,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setIsTyping(false);

    setTimeout(() => {
      setIsResetting(false);
    }, 400);
  }, [currentUser]);

  // Open the login/signup modal
  const handleOpenLogin = useCallback(() => setIsAuthOpen(true), []);

  // Successful login / registration
  const handleLogin = useCallback((user) => {
    setCurrentUser(user);
    let loaded = null;
    if (user && user.id) {
      try {
        const saved = localStorage.getItem(getChatStorageKey(user.id));
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) loaded = parsed;
        }
      } catch (e) {
        console.warn('Error loading chat history on login:', e);
      }
    }
    setMessages(loaded || [
      {
        ...INITIAL_ASSISTANT_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast({
      type: 'success',
      title: 'Signed in successfully',
      message: `Welcome, ${user.name}! You're now connected to your campus account.`
    });
  }, [showToast]);

  // Log out
  const handleLogout = useCallback(() => {
    clearUserSession();
    setCurrentUser(null);
    setView('dashboard');
    setMessages([
      {
        ...INITIAL_ASSISTANT_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'You have been signed out of the Campus Assistant.'
    });
  }, [showToast]);

  // Open the My Profile page
  const handleOpenProfile = useCallback(() => {
    setView('profile');
  }, []);

  // Return to the chat view
  const handleBackToChat = useCallback(() => {
    setView('chat');
  }, []);

  // Navigate to dashboard
  const handleGoToDashboard = useCallback(() => setView('dashboard'), []);

  // Navigate to chat (AI Assistant)
  const handleGoToChat = useCallback(() => setView('chat'), []);

  // Navigate to Student Services
  const handleGoToServices = useCallback(() => setView('services'), []);

  // Navigate to Academic Calendar
  const handleGoToCalendar = useCallback(() => setView('calendar'), []);

  // Toggle sidebar
  const handleToggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  // Apply updated profile details returned by the ProfilePage
  const handleProfileSaved = useCallback((updatedUser) => {
    setCurrentUser(updatedUser);
  }, []);

  return currentUser ? (
    <div className="flex flex-col h-screen max-h-screen bg-slate-100/70 font-sans text-slate-800 antialiased">
      {/* 1. Header */}
      <Header
        view={view}
        onGoToDashboard={handleGoToDashboard}
        onGoToChat={handleGoToChat}
        onGoToServices={handleGoToServices}
        onGoToCalendar={handleGoToCalendar}
        onNewConversation={handleNewConversation}
        isResetting={isResetting}
        user={currentUser}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
        onOpenProfile={handleOpenProfile}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Sidebar — left side, toggleable */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        view={view}
        onGoToDashboard={handleGoToDashboard}
        onGoToChat={handleGoToChat}
        onGoToServices={handleGoToServices}
        onGoToCalendar={handleGoToCalendar}
        user={currentUser}
      />

      {/* Page Content — unenrolled users always see Access Denied */}
      {!isEnrolledUser(currentUser) ? (
        <AccessDenied user={currentUser} onLogout={handleLogout} />
      ) : view === 'dashboard' ? (
        <DashboardPage
          user={currentUser}
          onGoToChat={handleGoToChat}
          onGoToProfile={handleOpenProfile}
          onGoToServices={handleGoToServices}
          onGoToCalendar={handleGoToCalendar}
        />
      ) : view === 'services' ? (
        <StudentServicesPage
          user={currentUser}
          showToast={showToast}
          onBack={handleGoToDashboard}
        />
      ) : view === 'calendar' ? (
        <AcademicCalendarPage
          user={currentUser}
          onBack={handleGoToDashboard}
          showToast={showToast}
        />
      ) : view === 'profile' ? (
        <ProfilePage
          user={currentUser}
          onBack={handleBackToChat}
          onSaved={handleProfileSaved}
          showToast={showToast}
        />
      ) : (
        <main className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
          />

          {/* Suggested Questions */}
          <SuggestedQuestions
            onSelectQuestion={handleSelectQuestion}
            disabled={isTyping}
          />

          {/* Message Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isTyping}
          />
        </main>
      )}

      {/* Auth Modal (kept for legacy header quick-login path) */}
      <AuthModal
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
      />

      {/* Toast notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

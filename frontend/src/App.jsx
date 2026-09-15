import React, { useState, useCallback } from 'react';
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
import Toast from './components/Toast';
import { INITIAL_ASSISTANT_MESSAGE } from './data/mockResponses';
import { sendChatMessage } from './services/chatService';
import { getCurrentUser, clearUserSession, isEnrolledUser } from './services/authService';

export default function App() {
  const [messages, setMessages] = useState([
    {
      ...INITIAL_ASSISTANT_MESSAGE,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'chat' | 'profile'
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show a toast notification and auto-clear
  const showToast = useCallback(({ type = 'success', title, message, duration }) => {
    setToast({ id: Date.now(), type, title, message, duration });
  }, []);

  // Send message handler
  const handleSendMessage = useCallback(async (content) => {
    if (!content || !content.trim() || isTyping) return;

    const trimmed = content.trim();

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
      // 2. Fetch mock assistant response with realistic simulation delay
      const aiResponse = await sendChatMessage(trimmed);
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
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
      setIsTyping(false);
    }
  }, [isTyping]);

  // Click on suggested prompt
  const handleSelectQuestion = useCallback((question) => {
    if (isTyping) return;
    handleSendMessage(question);
  }, [handleSendMessage, isTyping]);

  // Reset conversation to initial welcome message
  const handleNewConversation = useCallback(() => {
    setIsResetting(true);
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
  }, []);

  // Open the login/signup modal
  const handleOpenLogin = useCallback(() => setIsAuthOpen(true), []);

  // Successful login / registration
  const handleLogin = useCallback((user) => {
    setCurrentUser(user);
    // Don't close the modal here — AuthModal displays a "Welcome back" success
    // message and then closes itself via onClose() after ~900ms, so the user
    // gets a clear confirmation before landing on the assistant.
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

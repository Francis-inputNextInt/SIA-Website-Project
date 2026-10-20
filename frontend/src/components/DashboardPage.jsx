import React from 'react';
import StudentDashboard from './dashboards/StudentDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import StaffDashboard from './dashboards/StaffDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

/**
 * DashboardPage — master role router.
 * Delegates rendering to the appropriate role-specific dashboard
 * based on user.role (case-insensitive).
 */
export default function DashboardPage({ user, onGoToChat, onGoToProfile, onGoToServices }) {
  const role = (user?.role || 'student').toLowerCase();

  if (role === 'faculty') {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <FacultyDashboard
          user={user}
          onGoToChat={onGoToChat}
          onGoToProfile={onGoToProfile}
          onGoToServices={onGoToServices}
        />
      </main>
    );
  }

  if (role === 'staff') {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <StaffDashboard
          user={user}
          onGoToChat={onGoToChat}
          onGoToProfile={onGoToProfile}
          onGoToServices={onGoToServices}
        />
      </main>
    );
  }

  if (role === 'admin') {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <AdminDashboard
          user={user}
          onGoToChat={onGoToChat}
          onGoToProfile={onGoToProfile}
          onGoToServices={onGoToServices}
        />
      </main>
    );
  }

  // Default: student
  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/50">
      <StudentDashboard
        user={user}
        onGoToChat={onGoToChat}
        onGoToProfile={onGoToProfile}
        onGoToServices={onGoToServices}
      />
    </main>
  );
}


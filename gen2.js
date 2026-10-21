const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part2 = `
const ACTION_COLORS = {
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'bg-blue-600 text-white',    hover: 'hover:border-blue-400' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-600 text-white', hover: 'hover:border-emerald-400' },
  violet:  { bg: 'bg-violet-50',  border: 'border-violet-200',  icon: 'bg-violet-600 text-white',  hover: 'hover:border-violet-400' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'bg-amber-500 text-white',   hover: 'hover:border-amber-400' },
};

const PRIORITY_STYLES = {
  high:   'bg-rose-50 text-rose-700 border border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low:    'bg-blue-50 text-blue-700 border border-blue-200',
};

const TYPE_STYLES = {
  assignment:   'bg-blue-100 text-blue-700',
  exam:         'bg-rose-100 text-rose-700',
  project:      'bg-violet-100 text-violet-700',
  registration: 'bg-emerald-100 text-emerald-700',
};

function WelcomeSection({ user }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-600/20">
      <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, {user.name.split(' ')[0]}!
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-blue-100 font-medium">
            {getFormattedDate()}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20">
              <GraduationCap className="w-3.5 h-3.5" />
              {user.role}
            </span>
            {user.department && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20">
                <BookOpen className="w-3.5 h-3.5" />
                {user.department}
              </span>
            )}
            {user.studentId && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm border border-white/20 font-mono">
                ID: {user.studentId}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-inner">
            {user.initials || user.name.charAt(0)}
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.appendFileSync(path, part2, 'utf8');
console.log('gen2 done');

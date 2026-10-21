const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part6 = `
function AnnouncementsSection({ announcements, loading, error, onRefresh }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Megaphone className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Campus Announcements</h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="Refresh Announcements"
        >
          <RefreshCw className={\`w-4 h-4 \${loading ? 'animate-spin' : ''}\`} />
        </button>
      </div>

      {loading && announcements.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading announcements from database...
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={onRefresh} className="font-bold underline">Retry</button>
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No campus announcements at this time.
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={\`px-2.5 py-0.5 rounded-full text-[10px] font-bold \${PRIORITY_STYLES[ann.priority] || PRIORITY_STYLES.medium}\`}>
                    {ann.category || 'General'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{ann.date || new Date(ann.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{ann.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{ann.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickActionsSection({ onGoToChat, onGoToProfile, onGoToServices, onGoToCalendar }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Access Portal
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = ACTION_ICONS[action.icon] || MessageSquare;
          const colors = ACTION_COLORS[action.color] || ACTION_COLORS.blue;
          const [isExpanded, setIsExpanded] = useState(false);

          const handleClick = () => {
            if (action.id === 'chat') onGoToChat();
            else if (action.id === 'services') onGoToServices();
            else if (action.id === 'calendar') onGoToCalendar();
            else if (action.id === 'profile') onGoToProfile();
            else setIsExpanded(prev => !prev);
          };

          return (
            <button
              key={action.id}
              onClick={handleClick}
              className={\`group relative text-left p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer \${colors.hover}\`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className={\`w-10 h-10 rounded-xl \${colors.icon} flex items-center justify-center shadow-md transition-transform duration-200 group-hover:scale-110\`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{action.title}</h3>
              <div
                className={\`grid transition-all duration-200 ease-in-out group-hover:grid-rows-[1fr] group-hover:opacity-100 \${
                  isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }\`}
              >
                <div className="overflow-hidden">
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-snug pt-1.5">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
`;

fs.appendFileSync(path, part6, 'utf8');
console.log('gen6 done');

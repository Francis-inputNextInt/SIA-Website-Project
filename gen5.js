const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part5 = `
function ScheduleSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Calendar className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Today's Class Schedule</h2>
        </div>
        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          Active Semester
        </span>
      </div>

      <div className="space-y-3">
        {SCHEDULE.map((cls) => (
          <div
            key={cls.id}
            className="group p-4 rounded-xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200/80 hover:border-blue-200 transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                  {cls.code}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {cls.type}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-900 transition-colors">
                {cls.subject}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Instructor: <strong className="text-slate-700">{cls.instructor}</strong>
              </p>
            </div>

            <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                {cls.time}
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {cls.room}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeadlinesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Clock className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Upcoming Deadlines</h2>
        </div>
      </div>

      <div className="space-y-3">
        {DEADLINES.map((item) => (
          <div
            key={item.id}
            className={\`p-3.5 rounded-xl border transition-all duration-200 \${
              item.urgent
                ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300'
                : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
            }\`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={\`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase \${TYPE_STYLES[item.type] || 'bg-slate-100 text-slate-700'}\`}>
                    {item.type}
                  </span>
                  {item.urgent && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      Urgent
                    </span>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[260px]">
                  {item.course}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-xs">
                  {item.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

fs.appendFileSync(path, part5, 'utf8');
console.log('gen5 done');

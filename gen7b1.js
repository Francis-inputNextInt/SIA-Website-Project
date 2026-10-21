const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part7b1 = `
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
            <QuickActionsSection onGoToChat={onGoToChat} onGoToProfile={onGoToProfile} onGoToServices={onGoToServices} onGoToCalendar={onGoToCalendar} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
                <ScheduleSection />
              </div>
            </div>
            <div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
                <DeadlinesSection />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
            <AnnouncementsSection
              announcements={announcements}
              loading={loading}
              error={error}
              onRefresh={fetchData}
            />
          </div>
        </div>
      )}
`;

fs.appendFileSync(path, part7b1, 'utf8');
console.log('gen7b1 done');

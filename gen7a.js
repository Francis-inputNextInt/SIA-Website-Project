const fs = require('fs');
const path = 'frontend/src/components/dashboards/StudentDashboard.jsx';

const part7a = `
export default function StudentDashboard({ user, onGoToChat, onGoToProfile, onGoToServices, onGoToCalendar }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [announcements, setAnnouncements] = useState([]);
  const [grades, setGrades] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfModalType, setPdfModalType] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [anns, grds, pyms] = await Promise.all([
        getAnnouncements().catch(() => []),
        getMyGrades().catch(() => []),
        getMyPayments().catch(() => [])
      ]);

      const filteredAnns = (anns || []).filter(ann => {
        if (!ann.target_roles || ann.target_roles.length === 0) return true;
        return ann.target_roles.includes('Student') || ann.target_roles.includes('All');
      });
      setAnnouncements(filteredAnns);
      setGrades(grds && grds.length > 0 ? grds : MOCK_GRADES);
      setPayments(pyms && pyms.length > 0 ? pyms : MOCK_PAYMENTS);
    } catch (err) {
      setError(err.message || 'Failed to load student data.');
      setGrades(MOCK_GRADES);
      setPayments(MOCK_PAYMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    let subscription = null;
    if (supabase) {
      subscription = supabase
        .channel('public:student_data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
          fetchData();
        })
        .subscribe();
    }

    return () => {
      if (subscription && supabase) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <WelcomeSection user={user} />

      <SummaryCardsSection grades={grades} payments={payments} />

      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={\`pb-3 text-sm font-bold border-b-2 transition-colors \${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }\`}
        >
          Overview & Schedule
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={\`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 \${
            activeTab === 'grades'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }\`}
        >
          <Award className="w-4 h-4" />
          My Grades
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={\`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 \${
            activeTab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }\`}
        >
          <CircleDollarSign className="w-4 h-4" />
          My Payments
        </button>
      </div>
`;

fs.appendFileSync(path, part7a, 'utf8');
console.log('gen7a done');
